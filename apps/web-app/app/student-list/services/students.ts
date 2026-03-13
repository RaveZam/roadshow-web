import { createClient } from "@/utils/supabase/client";

export const STUDENTS_PAGE_SIZE = 10;

export type Student = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  section_id: string;
  created_at: string;
};

export async function fetchStudents(page = 1, sectionId = "all") {
  const supabase = createClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * STUDENTS_PAGE_SIZE;
  const to = from + STUDENTS_PAGE_SIZE - 1;
  let query = supabase
    .from("students")
    .select("id, student_id, first_name, last_name, section_id, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (sectionId !== "all") {
    query = query.eq("section_id", sectionId);
  }

  return query.range(from, to);
}

export async function createStudent(payload: {
  student_id: string;
  first_name: string;
  last_name: string;
  section_id: string;
}) {
  const supabase = createClient();

  return supabase
    .from("students")
    .insert([payload])
    .select("id, student_id, first_name, last_name, section_id, created_at")
    .single();
}
