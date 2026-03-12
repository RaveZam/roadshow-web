import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("roadshow-v2.5.db");

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      section_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL UNIQUE,
      day1 INTEGER NOT NULL DEFAULT 0,
      day2 INTEGER NOT NULL DEFAULT 0,
      day3 INTEGER NOT NULL DEFAULT 0,
      scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS section (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      day TEXT NOT NULL,          
      synced INTEGER DEFAULT 0,
      FOREIGN KEY(student_id) REFERENCES students(id),
      UNIQUE(student_id, day)
);

    CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_outbox_synced ON outbox(synced);
  `);
}
