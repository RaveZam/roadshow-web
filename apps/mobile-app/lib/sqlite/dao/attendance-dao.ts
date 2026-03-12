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

export function getAttendanceWithStudentNames() {
  return db.getAllSync(`
    SELECT a.id, a.student_id, a.day1, a.day2, a.day3, a.scanned_at,
           s.first_name, s.last_name
    FROM attendance a
    LEFT JOIN students s ON a.student_id = s.id
    ORDER BY a.scanned_at DESC
  `);
}

export function getAttendanceByStudentId(supabaseId: string) {
  return db.getAllSync(`SELECT * FROM attendance WHERE student_id = ?`, [
    supabaseId,
  ]);
}
