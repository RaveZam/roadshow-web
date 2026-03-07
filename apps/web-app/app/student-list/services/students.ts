import { createClient } from "@/utils/supabase/client";

export type Student = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  section_id: string;
  created_at: string;
};

export async function fetchStudents() {
  const supabase = createClient();

  return supabase
    .from("students")
    .select("id, student_id, first_name, last_name, section_id, created_at")
    .order("created_at", { ascending: false });
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
