import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("roadshow.db");

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      section TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL UNIQUE,
      day1 INTEGER NOT NULL DEFAULT 0,
      day2 INTEGER NOT NULL DEFAULT 0,
      day3 INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
  `);
}
