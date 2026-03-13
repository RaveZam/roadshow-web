"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  const data = rows.map((row) => {
    const rateValue = Number.parseFloat(row.rate.replace("%", ""));
    const rate = Number.isFinite(rateValue) ? rateValue : 0;
    const estimatedTotal =
      rate > 0 ? Math.round(row.checkedIn / (rate / 100)) : 0;

    return {
      day: row.day,
      checkedIn: row.checkedIn,
      notCheckedIn: Math.max(estimatedTotal - row.checkedIn, 0),
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
          />
          <Legend
            formatter={(value) =>
              value === "checkedIn" ? "Checked In" : "Not Checked In"
            }
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Bar dataKey="checkedIn" fill="#059669" radius={[4, 4, 0, 0]} />
          <Bar dataKey="notCheckedIn" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
