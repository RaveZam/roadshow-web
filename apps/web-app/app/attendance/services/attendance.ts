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

export type AttendanceLog = {
  id: string;
  student_id: string;
  period: string;
  time_in: string | null;
  time_out: string | null;
  date: string;
};

export async function fetchAttendanceLogs(studentIds: string[] = []) {
  const supabase = createClient();
  let query = supabase
    .from("attendance_logs")
    .select("id, student_id, period, time_in, time_out, date")
    .order("date", { ascending: false })
    .order("period", { ascending: true });

  if (studentIds.length > 0) {
    query = query.in("student_id", studentIds);
  }

  return query;
}
