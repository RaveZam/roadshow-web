import { createClient } from "@/utils/supabase/client";

export type Attendance = {
  id: string;
  student_id: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  updated_at: string;
};

export async function fetchAttendance(studentIds: string[] = []) {
  const supabase = createClient();
  let query = supabase
    .from("attendance")
    .select("id, student_id, day1, day2, day3, updated_at")
    .order("updated_at", { ascending: false });

  if (studentIds.length > 0) {
    query = query.in("student_id", studentIds);
  }

  return query;
}
