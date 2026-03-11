import { db } from "../sqlite/db";
import { supabase } from "../supabase";
import { getOutbox } from "../sqlite/dao/outbox-dao";

type OutboxRow = {
  id: number;
  student_id: string;
  day: string;
  synced: number;
};

export async function syncOutbox() {
  // 1. Grab all unsynced outbox entries
  const pending = getOutbox() as OutboxRow[];

  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      // 2. Build the upsert payload
      //    Only set the specific day column this entry represents
      // const payload = {
      //   student_id: entry.student_id,
      //   [entry.day]: true, // e.g. day1: true
      // };

      // 3. UPSERT — if row exists, only update the day column
      //    ignoreDuplicates: false so it merges, not skips
      const { error } = await supabase.rpc("mark_attendance", {
        p_student_id: entry.student_id,
        p_day: entry.day,
      });

      if (error) throw error;

      // 4. Mark this outbox entry as done
      await db.runAsync(`UPDATE outbox SET synced = 1 WHERE id = ?`, [
        entry.id,
      ]);

      synced++;
    } catch (err) {
      console.warn(
        `Failed to sync outbox entry ${entry.id}:`,
        err instanceof Error ? err.message : String(err),
      );
      failed++;
      // Don't mark as synced — it will retry next time
    }
  }

  return { synced, failed };
}
