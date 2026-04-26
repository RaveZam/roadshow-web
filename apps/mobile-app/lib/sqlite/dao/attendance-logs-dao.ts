import { db } from "../db";

export type AttendanceLog = {
  id: string;
  student_id: string;
  period: "morning" | "afternoon";
  time_in: string | null;
  time_out: string | null;
  date: string;
};

export function upsertAttendanceLog(log: AttendanceLog) {
  db.runSync(
    `INSERT INTO attendance_logs (id, student_id, period, time_in, time_out, date)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(student_id, date, period)
     DO UPDATE SET time_in = excluded.time_in, time_out = excluded.time_out`,
    [log.id, log.student_id, log.period, log.time_in, log.time_out, log.date],
  );
}

export function setTimeIn(studentId: string, date: string, period: string, timeIn: string) {
  db.runSync(
    `UPDATE attendance_logs SET time_in = ? WHERE student_id = ? AND date = ? AND period = ?`,
    [timeIn, studentId, date, period],
  );
}

export function setTimeOut(studentId: string, date: string, period: string, timeOut: string) {
  db.runSync(
    `UPDATE attendance_logs SET time_out = ? WHERE student_id = ? AND date = ? AND period = ?`,
    [timeOut, studentId, date, period],
  );
}

export function getAttendanceLogs(): AttendanceLog[] {
  return db.getAllSync<AttendanceLog>(`SELECT * FROM attendance_logs`);
}

export function getAttendanceLogsByStudentId(studentId: string): AttendanceLog[] {
  return db.getAllSync<AttendanceLog>(
    `SELECT * FROM attendance_logs WHERE student_id = ?`,
    [studentId],
  );
}

export function getAttendanceLogsByDate(date: string): AttendanceLog[] {
  return db.getAllSync<AttendanceLog>(
    `SELECT * FROM attendance_logs WHERE date = ?`,
    [date],
  );
}

export function getAttendanceLog(
  studentId: string,
  date: string,
  period: string,
): AttendanceLog | null {
  return db.getFirstSync<AttendanceLog>(
    `SELECT * FROM attendance_logs WHERE student_id = ? AND date = ? AND period = ?`,
    [studentId, date, period],
  );
}

export function getAttendanceLogsWithStudentNames() {
  return db.getAllSync(`
    SELECT al.id, al.student_id, al.period, al.time_in, al.time_out, al.date,
           s.first_name, s.last_name
    FROM attendance_logs al
    LEFT JOIN students s ON al.student_id = s.id
    ORDER BY al.date DESC, al.period ASC
  `);
}
