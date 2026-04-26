import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("roadshow-v3.db");

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

    CREATE TABLE IF NOT EXISTS section (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_settings (
      id TEXT PRIMARY KEY,
      morning_in TEXT,
      morning_in_cutoff TEXT,
      morning_out TEXT,
      morning_out_cutoff TEXT,
      afternoon_in TEXT,
      afternoon_in_cutoff TEXT,
      afternoon_out TEXT,
      afternoon_out_cutoff TEXT,
      created_at TEXT,
      updated_at TEXT,
      start_date TEXT,
      end_date TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
      time_in TEXT,
      time_out TEXT,
      date TEXT NOT NULL,
      FOREIGN KEY(student_id) REFERENCES students(id),
      UNIQUE(student_id, date, period)
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      period TEXT NOT NULL,
      date TEXT NOT NULL,
      time_in TEXT,
      time_out TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY(student_id) REFERENCES students(id),
      UNIQUE(student_id, date, period)
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_id ON attendance_logs(student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(date);
    CREATE INDEX IF NOT EXISTS idx_outbox_synced ON outbox(synced);
  `);
}
