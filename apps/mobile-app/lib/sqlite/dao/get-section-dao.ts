import { db } from "../db";

export function getSections() {
  return db.getAllSync("SELECT * FROM section");
}
