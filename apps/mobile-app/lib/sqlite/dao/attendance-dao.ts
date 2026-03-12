import { db } from "../db";

export function postStudentOnAttendance(studentId: string) {
  db.runSync(`INSERT OR IGNORE INTO attendance (student_id) VALUES (?)`, [
    studentId,
  ]);
}

export function putStudentAttendance(studentId: string, day: string) {
  db.runSync(`UPDATE attendance SET ${day} = 1 WHERE student_id = ?`, [
    studentId,
  ]);
}

export function getAttendance() {
  return db.getAllSync(`SELECT * FROM attendance`);
}

export function getAttendanceByStudentId(supabaseId: string) {
  return db.getAllSync(`SELECT * FROM attendance WHERE student_id = ?`, [
    supabaseId,
  ]);
}
