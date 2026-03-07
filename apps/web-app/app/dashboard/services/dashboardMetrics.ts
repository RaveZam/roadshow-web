import { fetchSections } from "@/app/section-list/services/sections";
import { fetchStudents } from "@/app/student-list/services/students";

export type DashboardStatCard = {
  label: string;
  value: string;
  note: string;
  highlighted?: boolean;
};

export type TrendRow = {
  day: string;
  checkedIn: number;
  rate: string;
};

export type TopSectionRow = {
  section: string;
  checkedIn: number;
  rate: string;
};

export type DashboardAlert = {
  title: string;
  details: string;
  badge: string;
};

export type DashboardMetrics = {
  eventWindowLabel: string;
  statCards: DashboardStatCard[];
  trendRows: TrendRow[];
  topSections: TopSectionRow[];
  alerts: DashboardAlert[];
};

const MOCK_ATTENDANCE = {
  day1CheckedIn: 412,
  day2CheckedIn: 458,
  day3CheckedIn: 437,
  atRiskStudents: 63,
  topSections: [
    { section: "BSIT 3A", checkedIn: 96, rate: "96%" },
    { section: "BSCS 2B", checkedIn: 91, rate: "91%" },
    { section: "BSBA 1C", checkedIn: 88, rate: "88%" },
    { section: "BSED 4A", checkedIn: 86, rate: "86%" },
    { section: "BEED 2A", checkedIn: 84, rate: "84%" },
  ] as TopSectionRow[],
  alerts: [
    {
      title: "BSHM 1D attendance is below target",
      details: "3-day attendance rate dropped to 62% (target: 80%).",
      badge: "High",
    },
    {
      title: "63 students are at risk",
      details: "Students attended 0-1 out of 3 event days.",
      badge: "Watch",
    },
    {
      title: "Day 3 turnout dipped",
      details: "Attendance fell by 21 students compared with Day 2.",
      badge: "Info",
    },
  ] as DashboardAlert[],
};

export async function fetchDashboardMetrics(): Promise<{
  data: DashboardMetrics | null;
  error: Error | null;
}> {
  const [studentsResult, sectionsResult] = await Promise.all([
    fetchStudents(),
    fetchSections(),
  ]);

  if (studentsResult.error) {
    return { data: null, error: studentsResult.error };
  }

  if (sectionsResult.error) {
    return { data: null, error: sectionsResult.error };
  }

  const totalStudents = studentsResult.data?.length ?? 0;
  const totalSections = sectionsResult.data?.length ?? 0;
  const totalCheckedIn =
    MOCK_ATTENDANCE.day1CheckedIn +
    MOCK_ATTENDANCE.day2CheckedIn +
    MOCK_ATTENDANCE.day3CheckedIn;
  const maxPossibleCheckIns = totalStudents * 3;
  const attendanceRate =
    maxPossibleCheckIns === 0
      ? 0
      : Math.min((totalCheckedIn / maxPossibleCheckIns) * 100, 100);

  const trendRows: TrendRow[] = [
    {
      day: "Day 1",
      checkedIn: MOCK_ATTENDANCE.day1CheckedIn,
      rate: totalStudents === 0 ? "0.0%" : `${((MOCK_ATTENDANCE.day1CheckedIn / totalStudents) * 100).toFixed(1)}%`,
    },
    {
      day: "Day 2",
      checkedIn: MOCK_ATTENDANCE.day2CheckedIn,
      rate: totalStudents === 0 ? "0.0%" : `${((MOCK_ATTENDANCE.day2CheckedIn / totalStudents) * 100).toFixed(1)}%`,
    },
    {
      day: "Day 3",
      checkedIn: MOCK_ATTENDANCE.day3CheckedIn,
      rate: totalStudents === 0 ? "0.0%" : `${((MOCK_ATTENDANCE.day3CheckedIn / totalStudents) * 100).toFixed(1)}%`,
    },
  ];

  return {
    data: {
      eventWindowLabel: "3-day university event",
      statCards: [
        {
          label: "Total Students Registered",
          value: totalStudents.toLocaleString(),
          note: "From students master list",
          highlighted: true,
        },
        {
          label: "Total Sections Participating",
          value: totalSections.toLocaleString(),
          note: "From sections master list",
        },
        {
          label: "Students Checked In (3 days)",
          value: totalCheckedIn.toLocaleString(),
          note: "Mocked attendance count",
        },
        {
          label: "Attendance Rate (3 days)",
          value: `${attendanceRate.toFixed(1)}%`,
          note: "Checked-ins / (students x 3 days)",
        },
        {
          label: "At-Risk Students",
          value: MOCK_ATTENDANCE.atRiskStudents.toLocaleString(),
          note: "Mocked: attended 0-1 day",
        },
      ],
      trendRows,
      topSections: MOCK_ATTENDANCE.topSections,
      alerts: MOCK_ATTENDANCE.alerts,
    },
    error: null,
  };
}
