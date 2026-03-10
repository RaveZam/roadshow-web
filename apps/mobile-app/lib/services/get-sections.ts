import { db } from "../sqlite/db";
import { supabase } from "../supabase";

type SectionDTO = {
  id: string; // must be stable from server needst o be supabase UUID
  name: string;
};

export async function syncSectionsFromApi() {
  const res = await supabase.from("sections").select("*");

  // console.log("res" + JSON.stringify(res.data));
  const sections = res.data as SectionDTO[];

  db.execSync("BEGIN");
  try {
    for (const s of sections) {
      // console.log("inserting student:" + JSON.stringify(s));
      db.runSync(
        `
          INSERT OR IGNORE INTO section (
            id,
            name
          ) VALUES (?, ?)
          `,
        [s.id, s.name],
      );
    }

    db.execSync("COMMIT");
    return { insertedOrSkipped: sections.length };
  } catch (error) {
    db.execSync("ROLLBACK");
    throw error;
  }
}
