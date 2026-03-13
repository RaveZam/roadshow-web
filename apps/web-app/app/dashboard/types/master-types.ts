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
