import { fetchSectionsForMetrics } from "@/app/section-list/services/sections";
import { fetchStudentsForMetrics } from "@/app/student-list/services/students";
import { fetchAttendanceLogs } from "@/app/attendance/services/attendance";
import { fetchEventSettings } from "@/app/event-settings/services/eventSettings";
import { buildDashboardMetrics } from "@/app/dashboard/helpers/dashboardMetrics";
import type { DashboardMetrics } from "../types/master-types";

export async function fetchDashboardMetrics(dayFilter: string): Promise<{
  data: DashboardMetrics | null;
  error: Error | null;
}> {
  try {
    const [studentsResult, sectionsResult, logsResult, eventSettings] =
      await Promise.all([
        fetchStudentsForMetrics(),
        fetchSectionsForMetrics(),
        fetchAttendanceLogs(),
        fetchEventSettings().catch(() => null),
      ]);

    if (studentsResult.error) {
      return { data: null, error: studentsResult.error };
    }

    if (sectionsResult.error) {
      return { data: null, error: sectionsResult.error };
    }

    if (logsResult.error) {
      return { data: null, error: logsResult.error };
    }

    return {
      data: buildDashboardMetrics(
        studentsResult.data ?? [],
        sectionsResult.data ?? [],
        logsResult.data ?? [],
        eventSettings,
        dayFilter,
      ),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
