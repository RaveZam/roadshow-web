import {
  getAttendance,
  postStudentOnAttendance,
  putStudentAttendance,
} from "../../../../lib/sqlite/dao/attendance-dao";
import {
  getOutbox,
  postStudentOnOutbox,
} from "../../../../lib/sqlite/dao/outbox-dao";

const days = [
  { label: "day1", date: "2026-03-10" },
  { label: "day2", date: "2026-03-11" },
  { label: "day3", date: "2026-03-12" },
];
const today = new Date().toISOString().split("T")[0];

export function useScanner(data: string) {
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
