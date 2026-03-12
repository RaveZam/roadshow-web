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
  const pending = getOutbox() as OutboxRow[];

  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      const { error } = await supabase.rpc("mark_attendance", {
        p_student_id: entry.student_id,
        p_day: entry.day,
      });

      if (error) throw error;

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
    }
  }

  return { synced, failed };
}
