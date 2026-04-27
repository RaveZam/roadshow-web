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

const BARS = [
  { key: "morningIn", label: "Morning Check-In", color: "#059669" },
  { key: "morningOut", label: "Morning Check-Out", color: "#6ee7b7" },
  { key: "afternoonIn", label: "Afternoon Check-In", color: "#3b82f6" },
  { key: "afternoonOut", label: "Afternoon Check-Out", color: "#93c5fd" },
] as const;

export default function GroupedBarChart({ rows }: { rows: TrendRow[] }) {
  const data = rows.map((row) => ({
    day: row.label,
    morningIn: row.morningIn,
    morningOut: row.morningOut,
    afternoonIn: row.afternoonIn,
    afternoonOut: row.afternoonOut,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barGap={2}
          barCategoryGap="20%"
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e4e4e7"
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
            contentStyle={{
              borderRadius: 10,
              borderColor: "#e4e4e7",
              fontSize: 13,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value, name) => {
              const bar = BARS.find((b) => b.key === name);
              return [
                typeof value === "number" ? value.toLocaleString() : value,
                bar?.label ?? name,
              ];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const bar = BARS.find((b) => b.key === value);
              return bar?.label ?? value;
            }}
            wrapperStyle={{ fontSize: "12px", paddingTop: 8 }}
          />
          {BARS.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
