import { db } from "../sqlite/db";
import { supabase } from "../supabase";
import { getOutbox, type OutboxRow } from "../sqlite/dao/outbox-dao";

export async function syncOutbox() {
  const pending = getOutbox();

  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      const { error } = await supabase.rpc("upsert_attendance_log", {
        p_student_id: entry.student_id,
        p_period: entry.period,
        p_date: entry.date,
        p_time_in: entry.time_in,
        p_time_out: entry.time_out,
      });

      if (error) throw error;

      await db.runAsync(`UPDATE outbox SET synced = 1 WHERE id = ?`, [
        entry.id,
      ]);

      synced++;
    } catch (err) {
      console.error(
        `Failed to sync outbox entry ${entry.id}:`,
        JSON.stringify(err),
        JSON.stringify(entry),
      );
      failed++;
    }
  }

  return { synced, failed };
}
