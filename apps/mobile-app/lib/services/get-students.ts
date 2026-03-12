import { db } from "../sqlite/db";
import { supabase } from "../supabase";

type StudentDTO = {
  id: string; // must be stable from server needst o be supabase UUID
  student_id: string;
  first_name: string;
  last_name: string;
  section_id: string;
};

export async function syncStudentsFromApi() {
  console.log("syncing students from api");
  const res = await supabase.from("students").select("*");

  // console.log("res" + JSON.stringify(res.data));
  const students = res.data as StudentDTO[];

  db.execSync("BEGIN");
  try {
    for (const s of students) {
      db.runSync(
        `
          INSERT OR IGNORE INTO students (
            id,
            student_id,
            first_name,
            last_name,
            section_id
          ) VALUES (?, ?, ?, ?, ?)
          `,
        [s.id, s.student_id, s.first_name, s.last_name, s.section_id],
      );
    }

    db.execSync("COMMIT");
    return { insertedOrSkipped: students.length };
  } catch (error) {
    db.execSync("ROLLBACK");
    return;
  }
}
