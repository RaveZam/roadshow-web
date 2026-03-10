import { db, initDb } from "./db";

function logTableSnapshot(
  table: "students" | "attendance" | "outbox" | "section",
) {
  try {
    const columns = db.getAllSync<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>(`PRAGMA table_info(${table});`);
    const countRow = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${table}`,
    );
    const previewRows = db.getAllSync<Record<string, unknown>>(
      `SELECT * FROM ${table} LIMIT 10`,
    );

    console.log(`[sqlite] ${table}: ${countRow?.count ?? 0} rows`);
    console.log(
      `[sqlite] ${table} columns:`,
      columns.map((c) => ({
        name: c.name,
        type: c.type,
        notNull: Boolean(c.notnull),
        primaryKey: Boolean(c.pk),
        defaultValue: c.dflt_value,
      })),
    );
    console.log(`[sqlite] ${table} preview:`, previewRows);
  } catch (error) {
    console.log(`[sqlite] Failed to read ${table}`, error);
  }
}

export default function bootstrapDatabase() {
  initDb();
  // logTableSnapshot("students");
  // logTableSnapshot("attendance");
  // logTableSnapshot("outbox");
  // logTableSnapshot("section");
}
