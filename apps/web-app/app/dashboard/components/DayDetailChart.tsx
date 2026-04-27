"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayDetail } from "../types/master-types";

// ── Helpers ──────────────────────────────────────────────────────────

function formatBucketTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? "PM" : "AM";
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const seriesLabel: Record<string, string> = {
  morningIn: "AM Check-In",
  afternoonIn: "PM Check-In",
  morningOut: "AM Check-Out",
  afternoonOut: "PM Check-Out",
};

// ── Stat badge ───────────────────────────────────────────────────────

function TimeBadge({
  label,
  time,
  accent,
}: {
  label: string;
  time: string | null;
  accent: "emerald" | "teal";
}) {
  const ring =
    accent === "emerald"
      ? "border-emerald-200 bg-emerald-50/60"
      : "border-teal-200 bg-teal-50/60";
  const text =
    accent === "emerald" ? "text-emerald-700" : "text-teal-700";

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-center ${ring}`}
    >
      <p className="text-[10px] tracking-wide text-zinc-400 uppercase">
        {label}
      </p>
      <p className={`mt-0.5 text-base font-semibold tracking-tight ${text}`}>
        {time ?? "—"}
      </p>
    </div>
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white/95 px-3 py-2.5 text-xs shadow-lg backdrop-blur-sm">
      <p className="mb-1.5 font-semibold text-zinc-700">
        {formatBucketTime(label)}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-6"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {seriesLabel[entry.dataKey] ?? entry.dataKey}
          </span>
          <span className="font-semibold tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export default function DayDetailChart({
  detail,
  dayLabel,
}: {
  detail: DayDetail;
  dayLabel: string;
}) {
  const hasData = detail.buckets.length > 0;
  return (
    <div>
      {/* ── Average time badges ── */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TimeBadge
          label="Avg AM In"
          time={detail.avgMorningIn}
          accent="emerald"
        />
        <TimeBadge
          label="Avg AM Out"
          time={detail.avgMorningOut}
          accent="emerald"
        />
        <TimeBadge
          label="Avg PM In"
          time={detail.avgAfternoonIn}
          accent="teal"
        />
        <TimeBadge
          label="Avg PM Out"
          time={detail.avgAfternoonOut}
          accent="teal"
        />
      </div>

      {/* ── Chart ── */}
      {hasData ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={detail.buckets}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="emeraldFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#059669"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#059669"
                    stopOpacity={0.04}
                  />
                </linearGradient>
                <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#0d9488"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#0d9488"
                    stopOpacity={0.04}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e4e4e7"
              />

              <XAxis
                dataKey="time"
                tickFormatter={formatBucketTime}
                interval={3}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip content={<ChartTooltip />} />

              <Legend
                formatter={(value: string) => seriesLabel[value] ?? value}
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />

              {/* Check-in areas (prominent) */}
              <Area
                type="monotone"
                dataKey="morningIn"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#emeraldFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#059669" }}
              />
              <Area
                type="monotone"
                dataKey="afternoonIn"
                stroke="#0d9488"
                strokeWidth={2}
                fill="url(#tealFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#0d9488" }}
              />

              {/* Check-out lines (subtle dashed) */}
              <Line
                type="monotone"
                dataKey="morningOut"
                stroke="#6ee7b7"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 3, fill: "#6ee7b7" }}
              />
              <Line
                type="monotone"
                dataKey="afternoonOut"
                stroke="#5eead4"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 3, fill: "#5eead4" }}
              />

              {/* Cutoff reference lines */}
              {detail.morningCutoff && (
                <ReferenceLine
                  x={detail.morningCutoff}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "AM Cutoff",
                    position: "insideTopRight",
                    fill: "#d97706",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}
              {detail.afternoonCutoff && (
                <ReferenceLine
                  x={detail.afternoonCutoff}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "PM Cutoff",
                    position: "insideTopRight",
                    fill: "#d97706",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-sm text-zinc-400">
          No time-in / time-out data for {dayLabel}
        </div>
      )}
    </div>
  );
}
