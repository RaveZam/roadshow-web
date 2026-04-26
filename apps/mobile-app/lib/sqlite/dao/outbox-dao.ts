import { db } from "../db";

export type OutboxRow = {
  id: number;
  student_id: string;
  period: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  synced: number;
};

export function postToOutbox(
  studentId: string,
  period: string,
  date: string,
  timeIn: string | null,
  timeOut: string | null,
) {
  db.runSync(
    `INSERT INTO outbox (student_id, period, date, time_in, time_out)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(student_id, date, period)
     DO UPDATE SET time_in = excluded.time_in, time_out = excluded.time_out, synced = 0`,
    [studentId, period, date, timeIn, timeOut],
  );
}

export function getOutbox(): OutboxRow[] {
  return db.getAllSync<OutboxRow>(`SELECT * FROM outbox WHERE synced = 0`);
}
