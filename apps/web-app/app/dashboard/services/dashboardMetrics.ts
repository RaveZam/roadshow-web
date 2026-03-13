import { fetchSections } from "@/app/section-list/services/sections";
import { fetchStudents } from "@/app/student-list/services/students";
import { fetchAttendance } from "@/app/attendance/services/attendance";
import { buildDashboardMetrics } from "@/app/dashboard/helpers/dashboardMetrics";
import type { DashboardMetrics, DayFilter } from "../types/master-types";

export async function fetchDashboardMetrics(dayFilter: DayFilter): Promise<{
  data: DashboardMetrics | null;
  error: Error | null;
}> {
  const [studentsResult, sectionsResult, attendanceResult] = await Promise.all([
    fetchStudents(),
    fetchSections(),
    fetchAttendance(),
  ]);

  if (studentsResult.error) {
    return { data: null, error: studentsResult.error };
  }

  if (sectionsResult.error) {
    return { data: null, error: sectionsResult.error };
  }

  if (attendanceResult.error) {
    return { data: null, error: attendanceResult.error };
  }

  const students = studentsResult.data ?? [];
  const sections = sectionsResult.data ?? [];
  const attendance = attendanceResult.data ?? [];

  return {
    data: buildDashboardMetrics(students, sections, attendance, dayFilter),
    error: null,
  };
}
