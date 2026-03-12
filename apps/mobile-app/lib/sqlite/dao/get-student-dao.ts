import { db } from "../db";

export type StudentRecord = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  section_id: string;
};

export function getStudents() {
  return db.getAllSync("SELECT * FROM students");
}

export function getStudentById(studentPrimaryId: string) {
  return db.getFirstSync<StudentRecord>(
    `
      SELECT id, student_id, first_name, last_name, section_id
      FROM students
      WHERE id = ?
    `,
    [studentPrimaryId],
  );
}
