import type { Attendance } from "@/app/attendance/services/attendance";
import type { Section } from "@/app/section-list/services/sections";
import type { Student } from "@/app/student-list/services/students";
import type {
  DashboardMetrics,
  TopSectionRow,
  TrendRow,
  DashboardAlert,
  DayFilter,
} from "../types/master-types";

const getAttendedDays = (record: Attendance | undefined) =>
  Number(Boolean(record?.day1)) +
  Number(Boolean(record?.day2)) +
  Number(Boolean(record?.day3));

const getDayCheckIn = (record: Attendance | undefined, dayFilter: DayFilter) => {
  if (dayFilter === "day1") return Number(Boolean(record?.day1));
  if (dayFilter === "day2") return Number(Boolean(record?.day2));
  if (dayFilter === "day3") return Number(Boolean(record?.day3));
  return getAttendedDays(record);
};

export function buildDashboardMetrics(
  students: Student[],
  sections: Section[],
  attendance: Attendance[],
  dayFilter: DayFilter,
): DashboardMetrics {
  const totalStudents = students.length;
  const totalSections = sections.length;
  const day1CheckedIn = attendance.filter((record) =>
    Boolean(record.day1),
  ).length;
  const day2CheckedIn = attendance.filter((record) =>
    Boolean(record.day2),
  ).length;
  const day3CheckedIn = attendance.filter((record) =>
    Boolean(record.day3),
  ).length;
  const isAllTime = dayFilter === "all";
  const selectedDayLabel =
    dayFilter === "day1"
      ? "Day 1"
      : dayFilter === "day2"
        ? "Day 2"
        : dayFilter === "day3"
          ? "Day 3"
          : "3 days";
  const totalCheckedIn = isAllTime
    ? day1CheckedIn + day2CheckedIn + day3CheckedIn
    : dayFilter === "day1"
      ? day1CheckedIn
      : dayFilter === "day2"
        ? day2CheckedIn
        : day3CheckedIn;
  const maxPossibleCheckIns = totalStudents * (isAllTime ? 3 : 1);
  const attendanceRate =
    maxPossibleCheckIns === 0
      ? 0
      : Math.min((totalCheckedIn / maxPossibleCheckIns) * 100, 100);

  const attendanceByStudentId = new Map(
    attendance.map((record) => [record.student_id, record]),
  );
  const checkInsBySectionId = new Map<string, number>();
  const studentsBySectionId = new Map<string, number>();

  for (const student of students) {
    studentsBySectionId.set(
      student.section_id,
      (studentsBySectionId.get(student.section_id) ?? 0) + 1,
    );
  }

  for (const student of students) {
    const record = attendanceByStudentId.get(student.id);
    const studentCheckIns = getDayCheckIn(record, dayFilter);
    checkInsBySectionId.set(
      student.section_id,
      (checkInsBySectionId.get(student.section_id) ?? 0) + studentCheckIns,
    );
  }

  const atRiskStudents = students.reduce((count, student) => {
    const record = attendanceByStudentId.get(student.id);
    if (isAllTime) {
      return getAttendedDays(record) <= 1 ? count + 1 : count;
    }
    return getDayCheckIn(record, dayFilter) === 0 ? count + 1 : count;
  }, 0);

  const topSections: TopSectionRow[] = sections
    .map((section) => {
      const sectionStudents = studentsBySectionId.get(section.id) ?? 0;
      const sectionCheckIns = checkInsBySectionId.get(section.id) ?? 0;
      const sectionMaxCheckIns = sectionStudents * (isAllTime ? 3 : 1);
      const sectionRate =
        sectionMaxCheckIns === 0
          ? 0
          : (sectionCheckIns / sectionMaxCheckIns) * 100;

      return {
        section: section.name,
        checkedIn: sectionCheckIns,
        rate: `${sectionRate.toFixed(1)}%`,
      };
    })
    .sort((a, b) => b.checkedIn - a.checkedIn)
    .slice(0, 5);

  const trendRows: TrendRow[] = [
    {
      day: "Day 1",
      checkedIn: day1CheckedIn,
      rate:
        totalStudents === 0
          ? "0.0%"
          : `${((day1CheckedIn / totalStudents) * 100).toFixed(1)}%`,
    },
    {
      day: "Day 2",
      checkedIn: day2CheckedIn,
      rate:
        totalStudents === 0
          ? "0.0%"
          : `${((day2CheckedIn / totalStudents) * 100).toFixed(1)}%`,
    },
    {
      day: "Day 3",
      checkedIn: day3CheckedIn,
      rate:
        totalStudents === 0
          ? "0.0%"
          : `${((day3CheckedIn / totalStudents) * 100).toFixed(1)}%`,
    },
  ];

  const alerts: DashboardAlert[] = [];
  if (topSections.length > 0) {
    const lowestTopSection = [...topSections].sort(
      (a, b) => Number.parseFloat(a.rate) - Number.parseFloat(b.rate),
    )[0];
    alerts.push({
      title: `${lowestTopSection.section} attendance is below target`,
      details: `Current ${selectedDayLabel.toLowerCase()} section rate is ${lowestTopSection.rate} (target: 80%).`,
      badge: "Watch",
    });
  }

  alerts.push({
    title: `${atRiskStudents.toLocaleString()} students are at risk`,
    details: isAllTime
      ? "Students attended 0-1 out of 3 event days."
      : `Students were absent on ${selectedDayLabel}.`,
    badge: "High",
  });

  const dayDelta = day3CheckedIn - day2CheckedIn;
  if (dayDelta < 0) {
    alerts.push({
      title: "Day 3 turnout dipped",
      details: `Attendance fell by ${Math.abs(dayDelta).toLocaleString()} students compared with Day 2.`,
      badge: "Info",
    });
  }

  return {
    eventWindowLabel: isAllTime
      ? "3-day university event"
      : `${selectedDayLabel} of university event`,
    statCards: [
      {
        label: "Total Students Registered",
        value: totalStudents.toLocaleString(),
        note: "From students master list",
        highlighted: true,
      },
      {
        label: "Total Sections Participating",
        value: totalSections.toLocaleString(),
        note: "From sections master list",
      },
      {
        label: isAllTime
          ? "Students Checked In (3 days)"
          : `Students Checked In (${selectedDayLabel})`,
        value: totalCheckedIn.toLocaleString(),
        note: "From attendance records",
      },
      {
        label: isAllTime
          ? "Attendance Rate (3 days)"
          : `Attendance Rate (${selectedDayLabel})`,
        value: `${attendanceRate.toFixed(1)}%`,
        note: isAllTime
          ? "Checked-ins / (students x 3 days)"
          : "Checked-ins / students",
      },
      {
        label: "At-Risk Students",
        value: atRiskStudents.toLocaleString(),
        note: isAllTime
          ? "Attended 0-1 out of 3 days"
          : `Absent on ${selectedDayLabel}`,
      },
    ],
    trendRows,
    topSections,
    alerts,
  };
}
