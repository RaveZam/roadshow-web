import {
  getAttendance,
  getAttendanceByStudentId,
  postStudentOnAttendance,
  putStudentAttendance,
} from "../../../../lib/sqlite/dao/attendance-dao";
import {
  getOutbox,
  postStudentOnOutbox,
} from "../../../../lib/sqlite/dao/outbox-dao";

const days = [
  { label: "day1", date: "2026-03-11" },
  { label: "day2", date: "2026-03-12" },
  { label: "day3", date: "2026-03-13" },
];

function getTodayDayLabel(): string | null {
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  return days.find((day) => today === day.date)?.label ?? null;
}

export function hasStudentAttendedToday(studentId: string): boolean {
  const dayLabel = getTodayDayLabel();
  if (!dayLabel) return false;
  const rows = getAttendanceByStudentId(studentId) as {
    [key: string]: number;
  }[];
  const row = rows[0];
  return row ? row[dayLabel] === 1 : false;
}

export function scanStudent(data: string) {
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const dayToday = days.find((day) => today === day.date);
  console.log("dayToday", dayToday?.label);

  postStudentOnAttendance(data);

  if (dayToday) {
    putStudentAttendance(data, dayToday.label);
    postStudentOnOutbox(data, dayToday.label);
  }

  const attendance = getAttendance();
  const outbox = getOutbox();

  console.log("attendance table", attendance);
  console.log("outbox table", outbox);
}
