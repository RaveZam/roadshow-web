import { db } from "../db";

export function getStudents() {
  return db.getAllSync("SELECT * FROM students");
}
