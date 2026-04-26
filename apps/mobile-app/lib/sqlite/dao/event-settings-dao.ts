import { db } from "../db";

export type EventSettings = {
  id: string;
  morning_in: string | null;
  morning_in_cutoff: string | null;
  morning_out: string | null;
  morning_out_cutoff: string | null;
  afternoon_in: string | null;
  afternoon_in_cutoff: string | null;
  afternoon_out: string | null;
  afternoon_out_cutoff: string | null;
  created_at: string | null;
  updated_at: string | null;
  start_date: string | null;
  end_date: string | null;
};

export function upsertEventSettings(settings: EventSettings) {
  db.runSync(
    `INSERT OR REPLACE INTO event_settings (
      id, morning_in, morning_in_cutoff, morning_out, morning_out_cutoff,
      afternoon_in, afternoon_in_cutoff, afternoon_out, afternoon_out_cutoff,
      created_at, updated_at, start_date, end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      settings.id,
      settings.morning_in,
      settings.morning_in_cutoff,
      settings.morning_out,
      settings.morning_out_cutoff,
      settings.afternoon_in,
      settings.afternoon_in_cutoff,
      settings.afternoon_out,
      settings.afternoon_out_cutoff,
      settings.created_at,
      settings.updated_at,
      settings.start_date,
      settings.end_date,
    ],
  );
}

export function getEventSettings(): EventSettings | null {
  return db.getFirstSync<EventSettings>(
    `SELECT * FROM event_settings LIMIT 1`,
  );
}

export function getLocalUpdatedAt(): string | null {
  const row = db.getFirstSync<{ updated_at: string | null }>(
    `SELECT updated_at FROM event_settings LIMIT 1`,
  );
  return row?.updated_at ?? null;
}

export function clearEventSettings() {
  db.runSync(`DELETE FROM event_settings`);
}
