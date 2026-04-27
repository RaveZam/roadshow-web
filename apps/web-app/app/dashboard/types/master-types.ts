export type DashboardStatCard = {
  label: string;
  value: string;
  note: string;
  color?: "emerald" | "teal" | "amber" | "red" | "zinc";
};

export type DayOption = {
  label: string;
  date: string;
};

export type TrendRow = {
  label: string;
  date: string;
  morningIn: number;
  morningOut: number;
  afternoonIn: number;
  afternoonOut: number;
  totalStudents: number;
};

export type TopSectionRow = {
  section: string;
  timeIns: number;
  timeOuts: number;
  maxSlots: number;
  rate: number;
  missingOuts: number;
};

export type PeriodSummary = {
  period: "Morning" | "Afternoon";
  timeIns: number;
  timeOuts: number;
  missingOuts: number;
  late: number;
  total: number;
};

export type DashboardAlert = {
  title: string;
  details: string;
  badge: "High" | "Watch" | "Info";
};

export type TimeBucket = {
  time: string;
  morningIn: number;
  morningOut: number;
  afternoonIn: number;
  afternoonOut: number;
};

export type DayDetail = {
  buckets: TimeBucket[];
  avgMorningIn: string | null;
  avgMorningOut: string | null;
  avgAfternoonIn: string | null;
  avgAfternoonOut: string | null;
  morningCutoff: string | null;
  afternoonCutoff: string | null;
  onTimeCount: number;
  lateCount: number;
};

export type DashboardMetrics = {
  eventWindowLabel: string;
  dayOptions: DayOption[];
  statCards: DashboardStatCard[];
  trendRows: TrendRow[];
  topSections: TopSectionRow[];
  periodSummary: PeriodSummary[];
  alerts: DashboardAlert[];
  dayDetail: DayDetail | null;
};
