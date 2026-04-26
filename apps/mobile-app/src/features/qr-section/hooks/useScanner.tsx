import {
  getAttendanceLog,
  upsertAttendanceLog,
} from "../../../../lib/sqlite/dao/attendance-logs-dao";
import { postToOutbox } from "../../../../lib/sqlite/dao/outbox-dao";
import {
  getEventSettings,
  type EventSettings,
} from "../../../../lib/sqlite/dao/event-settings-dao";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export type ScanResult =
  | { status: "time_in"; period: "morning" | "afternoon" }
  | { status: "time_out"; period: "morning" | "afternoon" }
  | { status: "already_timed_in"; period: "morning" | "afternoon" }
  | { status: "already_timed_out"; period: "morning" | "afternoon" }
  | { status: "outside_window" }
  | { status: "no_settings" };

type ScanAction = {
  period: "morning" | "afternoon";
  action: "time_in" | "time_out";
};

function getToday(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/** Parse "HH:MM" to minutes since midnight */
function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function determineScanAction(settings: EventSettings): ScanAction | null {
  const now = getCurrentTimeMinutes();

  // Check morning time-in window
  if (settings.morning_in && settings.morning_in_cutoff) {
    const start = parseTime(settings.morning_in);
    const end = parseTime(settings.morning_in_cutoff);
    if (now >= start && now <= end) {
      return { period: "morning", action: "time_in" };
    }
  }

  // Check morning time-out window
  if (settings.morning_out && settings.morning_out_cutoff) {
    const start = parseTime(settings.morning_out);
    const end = parseTime(settings.morning_out_cutoff);
    if (now >= start && now <= end) {
      return { period: "morning", action: "time_out" };
    }
  }

  // Check afternoon time-in window
  if (settings.afternoon_in && settings.afternoon_in_cutoff) {
    const start = parseTime(settings.afternoon_in);
    const end = parseTime(settings.afternoon_in_cutoff);
    if (now >= start && now <= end) {
      return { period: "afternoon", action: "time_in" };
    }
  }

  // Check afternoon time-out window
  if (settings.afternoon_out && settings.afternoon_out_cutoff) {
    const start = parseTime(settings.afternoon_out);
    const end = parseTime(settings.afternoon_out_cutoff);
    if (now >= start && now <= end) {
      return { period: "afternoon", action: "time_out" };
    }
  }

  return null;
}

export function scanStudent(studentId: string): ScanResult {
  const settings = getEventSettings();
  if (!settings) return { status: "no_settings" };

  const scanAction = determineScanAction(settings);
  if (!scanAction) return { status: "outside_window" };

  const { period, action } = scanAction;
  const today = getToday();
  const timestamp = getCurrentTimestamp();

  const existing = getAttendanceLog(studentId, today, period);

  if (action === "time_in") {
    if (existing?.time_in) {
      return { status: "already_timed_in", period };
    }

    // Insert new attendance log with time_in
    upsertAttendanceLog({
      id: existing?.id ?? generateId(),
      student_id: studentId,
      period,
      time_in: timestamp,
      time_out: existing?.time_out ?? null,
      date: today,
    });

    // Queue for sync — read back the current state
    const updated = getAttendanceLog(studentId, today, period);
    postToOutbox(studentId, period, today, updated?.time_in ?? timestamp, updated?.time_out ?? null);

    return { status: "time_in", period };
  }

  // action === "time_out"
  if (existing?.time_out) {
    return { status: "already_timed_out", period };
  }

  // Update or create row with time_out (even if no time_in)
  upsertAttendanceLog({
    id: existing?.id ?? generateId(),
    student_id: studentId,
    period,
    time_in: existing?.time_in ?? null,
    time_out: timestamp,
    date: today,
  });

  // Queue for sync
  postToOutbox(studentId, period, today, existing?.time_in ?? null, timestamp);

  return { status: "time_out", period };
}
