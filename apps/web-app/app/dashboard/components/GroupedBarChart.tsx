"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendRow } from "../types/master-types";

type GroupedBarChartProps = {
  rows: TrendRow[];
};

export default function GroupedBarChart({ rows }: GroupedBarChartProps) {
  const data = rows.map((row) => ({
    day: row.day,
    checkedIn: row.checkedIn,
    notCheckedIn: Math.max(row.totalStudents - row.checkedIn, 0),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          barGap={6}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#d1fae5"
          />
          <XAxis
            dataKey="day"
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, borderColor: "#34d399" }}
            formatter={(value, name) => [
              typeof value === "number" ? value.toLocaleString() : value,
              name === "checkedIn" ? "Checked In" : "Not Checked In",
            ]}
            itemSorter={(item) => (item.name === "checkedIn" ? 0 : 1)}
          />
          <Legend
            formatter={(value) =>
              value === "checkedIn" ? "Checked In" : "Not Checked In"
            }
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Bar dataKey="checkedIn" fill="#059669" radius={[4, 4, 0, 0]} />
          <Bar dataKey="notCheckedIn" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="checkedIn"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4, fill: "#f59e0b" }}
            activeDot={{ r: 6 }}
            legendType="none"
            tooltipType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
