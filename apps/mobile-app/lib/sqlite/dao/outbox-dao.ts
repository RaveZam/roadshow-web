import { db } from "../db";

export function postStudentOnOutbox(studentId: string, day: string) {
  db.runSync(`INSERT OR IGNORE INTO outbox (student_id, day) VALUES (?, ?)`, [
    studentId,
    day,
  ]);
}

export function getOutbox() {
  return db.getAllSync(`SELECT * FROM outbox WHERE synced = 0`);
}
