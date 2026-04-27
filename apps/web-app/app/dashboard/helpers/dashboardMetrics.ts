import type { AttendanceLog } from "@/app/attendance/services/attendance";
import type { EventSettings } from "@/app/event-settings/services/eventSettings";
import type { Section } from "@/app/section-list/services/sections";
import type { Student } from "@/app/student-list/services/students";
import type {
  DashboardMetrics,
  DayOption,
  DayDetail,
  TimeBucket,
  TrendRow,
  TopSectionRow,
  PeriodSummary,
  DashboardAlert,
} from "../types/master-types";

const isMorningPeriod = (period: string) => {
  const lower = period.toLowerCase();
  return lower === "morning" || lower === "am";
};

const extractTime = (timestamp: string): string => {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

// ── Day-detail helpers ──────────────────────────────────────────────

function snapTo15Min(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const snapped = Math.round(m / 15) * 15;
  const adjM = snapped % 60;
  const adjH = h + Math.floor(snapped / 60);
  return `${adjH.toString().padStart(2, "0")}:${adjM.toString().padStart(2, "0")}`;
}

function minutesSinceMidnight(timestamp: string): number {
  const d = new Date(timestamp);
  return d.getHours() * 60 + d.getMinutes();
}

function minutesToLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function avgOfMinutes(arr: number[]): string | null {
  if (arr.length === 0) return null;
  return minutesToLabel(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function buildDayDetail(
  dayLogs: AttendanceLog[],
  eventSettings: EventSettings | null,
): DayDetail {
  // 15-min buckets from 05:00 → 21:00
  const allBuckets: TimeBucket[] = [];
  for (let h = 5; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      allBuckets.push({
        time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
        morningIn: 0,
        morningOut: 0,
        afternoonIn: 0,
        afternoonOut: 0,
      });
    }
  }

  const placeToBucket = (ts: string) => {
    const t = extractTime(ts);
    for (let i = allBuckets.length - 1; i >= 0; i--) {
      if (allBuckets[i].time <= t) return i;
    }
    return 0;
  };

  for (const log of dayLogs) {
    const morning = isMorningPeriod(log.period);
    if (log.time_in) {
      const idx = placeToBucket(log.time_in);
      if (morning) allBuckets[idx].morningIn++;
      else allBuckets[idx].afternoonIn++;
    }
    if (log.time_out) {
      const idx = placeToBucket(log.time_out);
      if (morning) allBuckets[idx].morningOut++;
      else allBuckets[idx].afternoonOut++;
    }
  }

  // Trim to data range with 2-bucket padding
  let first = allBuckets.length;
  let last = -1;
  for (let i = 0; i < allBuckets.length; i++) {
    const b = allBuckets[i];
    if (b.morningIn + b.morningOut + b.afternoonIn + b.afternoonOut > 0) {
      if (i < first) first = i;
      if (i > last) last = i;
    }
  }
  const buckets =
    first <= last
      ? allBuckets.slice(
          Math.max(0, first - 2),
          Math.min(allBuckets.length, last + 3),
        )
      : [];

  // Averages
  const mIns: number[] = [];
  const mOuts: number[] = [];
  const aIns: number[] = [];
  const aOuts: number[] = [];

  for (const log of dayLogs) {
    const morning = isMorningPeriod(log.period);
    if (log.time_in)
      (morning ? mIns : aIns).push(minutesSinceMidnight(log.time_in));
    if (log.time_out)
      (morning ? mOuts : aOuts).push(minutesSinceMidnight(log.time_out));
  }

  // Cutoffs snapped to nearest bucket boundary
  const morningCutoff = eventSettings?.morning_in_cutoff
    ? snapTo15Min(eventSettings.morning_in_cutoff)
    : null;
  const afternoonCutoff = eventSettings?.afternoon_in_cutoff
    ? snapTo15Min(eventSettings.afternoon_in_cutoff)
    : null;

  // On-time / late counts
  let onTimeCount = 0;
  let lateCount = 0;
  if (eventSettings) {
    for (const log of dayLogs) {
      if (!log.time_in) continue;
      const t = extractTime(log.time_in);
      const cutoff = isMorningPeriod(log.period)
        ? eventSettings.morning_in_cutoff
        : eventSettings.afternoon_in_cutoff;
      if (cutoff) {
        if (t <= cutoff) onTimeCount++;
        else lateCount++;
      }
    }
  }

  return {
    buckets,
    avgMorningIn: avgOfMinutes(mIns),
    avgMorningOut: avgOfMinutes(mOuts),
    avgAfternoonIn: avgOfMinutes(aIns),
    avgAfternoonOut: avgOfMinutes(aOuts),
    morningCutoff,
    afternoonCutoff,
    onTimeCount,
    lateCount,
  };
}

export function buildDashboardMetrics(
  students: Student[],
  sections: Section[],
  logs: AttendanceLog[],
  eventSettings: EventSettings | null,
  dayFilter: string,
): DashboardMetrics {
  const totalStudents = students.length;

  // Build dynamic day options from event settings
  const dayOptions: DayOption[] = [];
  if (eventSettings?.start_date && eventSettings?.end_date) {
    const start = new Date(eventSettings.start_date + "T00:00:00");
    const end = new Date(eventSettings.end_date + "T00:00:00");
    let dayNum = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayOptions.push({
        label: `Day ${dayNum}`,
        date: d.toISOString().slice(0, 10),
      });
      dayNum++;
    }
  } else {
    // Fallback: derive unique days from log records
    const uniqueDates = [...new Set(logs.map((l) => l.date))].sort();
    uniqueDates.forEach((date, i) => {
      dayOptions.push({ label: `Day ${i + 1}`, date });
    });
  }

  // Filter logs by selected day
  const filteredLogs =
    dayFilter === "all" ? logs : logs.filter((l) => l.date === dayFilter);

  // Core counts
  const timeInLogs = filteredLogs.filter((l) => l.time_in !== null);
  const totalTimeIns = timeInLogs.length;

  const uniqueStudentsWithTimeIn = new Set(
    timeInLogs.map((l) => l.student_id),
  );
  const studentsCheckedIn = uniqueStudentsWithTimeIn.size;

  const missingTimeOuts = filteredLogs.filter(
    (l) => l.time_in !== null && l.time_out === null,
  ).length;

  // Late arrivals (checked in after the cutoff window)
  let lateCount = 0;
  if (eventSettings) {
    for (const log of timeInLogs) {
      const timeStr = extractTime(log.time_in!);
      const cutoff = isMorningPeriod(log.period)
        ? eventSettings.morning_in_cutoff
        : eventSettings.afternoon_in_cutoff;
      if (cutoff && timeStr > cutoff) {
        lateCount++;
      }
    }
  }

  const attendanceRate =
    totalStudents === 0 ? 0 : (studentsCheckedIn / totalStudents) * 100;
  const absentStudents = totalStudents - studentsCheckedIn;

  // Label for the active filter
  const selectedDayOption = dayOptions.find((d) => d.date === dayFilter);
  const filterLabel =
    dayFilter === "all"
      ? `All ${dayOptions.length} Days`
      : (selectedDayOption?.label ?? dayFilter);

  // ── Stat cards ──────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      note: "From master list",
      color: "emerald" as const,
    },
    {
      label: `Check-Ins (${filterLabel})`,
      value: totalTimeIns.toLocaleString(),
      note: `${studentsCheckedIn} unique students`,
      color: "teal" as const,
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate.toFixed(1)}%`,
      note: `${absentStudents} students absent`,
      color: "zinc" as const,
    },
    {
      label: "Missing Time-Outs",
      value: missingTimeOuts.toLocaleString(),
      note: "Checked in but not out",
      color: (missingTimeOuts > 0 ? "red" : "zinc") as "red" | "zinc",
    },
    {
      label: "Late Arrivals",
      value: lateCount.toLocaleString(),
      note: eventSettings ? "After cutoff time" : "No cutoff configured",
      color: (lateCount > 0 ? "amber" : "zinc") as "amber" | "zinc",
    },
  ];

  // ── Trend rows (one per event day) ─────────────────────────────────
  const trendRows: TrendRow[] = dayOptions.map((day) => {
    const dayLogs = logs.filter((l) => l.date === day.date);
    return {
      label: day.label,
      date: day.date,
      morningIn: dayLogs.filter(
        (l) => isMorningPeriod(l.period) && l.time_in !== null,
      ).length,
      morningOut: dayLogs.filter(
        (l) => isMorningPeriod(l.period) && l.time_out !== null,
      ).length,
      afternoonIn: dayLogs.filter(
        (l) => !isMorningPeriod(l.period) && l.time_in !== null,
      ).length,
      afternoonOut: dayLogs.filter(
        (l) => !isMorningPeriod(l.period) && l.time_out !== null,
      ).length,
      totalStudents,
    };
  });

  // ── Section leaderboard ────────────────────────────────────────────
  const studentSectionMap = new Map(
    students.map((s) => [s.id, s.section_id]),
  );
  const sectionStudentCount = new Map<string, number>();
  for (const student of students) {
    sectionStudentCount.set(
      student.section_id,
      (sectionStudentCount.get(student.section_id) ?? 0) + 1,
    );
  }

  const sectionTimeIns = new Map<string, number>();
  const sectionTimeOuts = new Map<string, number>();
  const sectionMissingOuts = new Map<string, number>();
  for (const log of filteredLogs) {
    const sectionId = studentSectionMap.get(log.student_id);
    if (!sectionId) continue;
    if (log.time_in !== null) {
      sectionTimeIns.set(
        sectionId,
        (sectionTimeIns.get(sectionId) ?? 0) + 1,
      );
    }
    if (log.time_out !== null) {
      sectionTimeOuts.set(
        sectionId,
        (sectionTimeOuts.get(sectionId) ?? 0) + 1,
      );
    }
    if (log.time_in !== null && log.time_out === null) {
      sectionMissingOuts.set(
        sectionId,
        (sectionMissingOuts.get(sectionId) ?? 0) + 1,
      );
    }
  }

  const periodsPerDay = 2;
  const numDays = dayFilter === "all" ? Math.max(dayOptions.length, 1) : 1;

  const topSections: TopSectionRow[] = sections
    .map((section) => {
      const count = sectionStudentCount.get(section.id) ?? 0;
      const timeIns = sectionTimeIns.get(section.id) ?? 0;
      const timeOuts = sectionTimeOuts.get(section.id) ?? 0;
      const maxSlots = count * periodsPerDay * numDays;
      // Complete (in+out) = full credit, time-in only = half credit
      const complete = timeOuts;
      const inOnly = timeIns - timeOuts;
      const score = complete + inOnly * 0.5;
      const rate = maxSlots === 0 ? 0 : (score / maxSlots) * 100;
      return {
        section: section.name,
        timeIns,
        timeOuts,
        maxSlots,
        rate,
        missingOuts: sectionMissingOuts.get(section.id) ?? 0,
      };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  // ── Period summary (Morning / Afternoon) ───────────────────────────
  const buildPeriod = (
    periodLogs: AttendanceLog[],
    period: "Morning" | "Afternoon",
  ): PeriodSummary => {
    const ins = periodLogs.filter((l) => l.time_in !== null);
    const outs = periodLogs.filter((l) => l.time_out !== null);
    const noOuts = periodLogs.filter(
      (l) => l.time_in !== null && l.time_out === null,
    );
    const late = periodLogs.filter(
      (l) => l.time_out !== null && l.time_in === null,
    ).length;
    return {
      period,
      timeIns: ins.length,
      timeOuts: outs.length,
      missingOuts: noOuts.length,
      late,
      total: totalStudents * numDays,
    };
  };

  const morningLogs = filteredLogs.filter((l) => isMorningPeriod(l.period));
  const afternoonLogs = filteredLogs.filter((l) => !isMorningPeriod(l.period));

  const periodSummary: PeriodSummary[] = [
    buildPeriod(morningLogs, "Morning"),
    buildPeriod(afternoonLogs, "Afternoon"),
  ];

  // ── Alerts ─────────────────────────────────────────────────────────
  const alerts: DashboardAlert[] = [];

  if (absentStudents > 0) {
    alerts.push({
      title: `${absentStudents} students absent`,
      details:
        dayFilter === "all"
          ? "No check-in across all event days."
          : `No check-in on ${filterLabel}.`,
      badge: "High",
    });
  }
  if (missingTimeOuts > 0) {
    alerts.push({
      title: `${missingTimeOuts} missing time-outs`,
      details: "Students checked in but haven't timed out yet.",
      badge: "Watch",
    });
  }
  if (lateCount > 0) {
    alerts.push({
      title: `${lateCount} late arrivals`,
      details: "Students who checked in after the cutoff time.",
      badge: "Info",
    });
  }
  if (trendRows.length >= 2) {
    const last = trendRows[trendRows.length - 1];
    const prev = trendRows[trendRows.length - 2];
    const delta =
      prev.morningIn + prev.afternoonIn - (last.morningIn + last.afternoonIn);
    if (delta > 0) {
      alerts.push({
        title: `${last.label} turnout dipped`,
        details: `Attendance fell by ${delta} check-ins vs ${prev.label}.`,
        badge: "Info",
      });
    }
  }

  // ── Day detail (single-day timeline) ────────────────────────────────
  const dayDetail =
    dayFilter !== "all"
      ? buildDayDetail(filteredLogs, eventSettings)
      : null;

  return {
    eventWindowLabel:
      dayFilter === "all"
        ? `${dayOptions.length}-day event overview`
        : filterLabel,
    dayOptions,
    statCards,
    trendRows,
    topSections,
    periodSummary,
    alerts,
    dayDetail,
  };
}
