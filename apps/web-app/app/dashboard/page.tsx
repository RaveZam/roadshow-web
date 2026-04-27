"use client";

import { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import StatCardsRow from "./components/StatCardsRow";
import GroupedBarChart from "./components/GroupedBarChart";
import DayDetailChart from "./components/DayDetailChart";
import PeriodSummaryCard from "./components/PeriodSummaryCard";
import AlertsCard from "./components/AlertsCard";
import StudentsList from "../student-list/StudentsList";
import SectionListPage from "../section-list/page";
import AttendanceList from "../attendance/AttendanceList";
import EventSettings from "../event-settings/EventSettings";
import Header from "../components/header";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";

export default function DashboardPage() {
  const [active, setActive] = useState<string>("Dashboard");
  const [dayFilter, setDayFilter] = useState("all");
  const { metrics, isLoadingMetrics, metricsError } = useDashboardMetrics(
    active === "Dashboard",
    dayFilter,
  );

  return (
    <div className="h-screen bg-[#f5f6f8] font-sans text-zinc-900">
      <div className="flex h-full">
        <DashboardSidebar active={active} onSelect={setActive} />
        <main className="flex-1 overflow-hidden p-6 xl:p-8 flex flex-col">
          <Header active={active} />
          <div className="flex-1 overflow-auto hide-scrollbar">
            {active === "Dashboard" ? (
              <>
                {/* ── Day filter tabs ── */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDayFilter("all")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      dayFilter === "all"
                        ? "bg-emerald-600 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    All Days
                  </button>
                  {(metrics?.dayOptions ?? []).map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setDayFilter(day.date)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        dayFilter === day.date
                          ? "bg-emerald-600 text-white"
                          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                  {metrics ? (
                    <span className="ml-auto text-xs text-zinc-400">
                      {metrics.eventWindowLabel}
                    </span>
                  ) : null}
                </div>

                {metricsError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Failed to load dashboard metrics: {metricsError}
                  </div>
                ) : null}

                {isLoadingMetrics ? (
                  <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                    <p className="mt-2 text-sm text-zinc-500">
                      Loading attendance metrics...
                    </p>
                  </div>
                ) : metrics ? (
                  <>
                    {/* ── Stat cards ── */}
                    <StatCardsRow cards={metrics.statCards} />

                    {/* ── Chart + Period summary ── */}
                    <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        {dayFilter === "all" || !metrics.dayDetail ? (
                          <>
                            <div className="mb-4 flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-zinc-800">
                                Daily Attendance Trend
                              </h2>
                              <p className="text-xs text-zinc-400">
                                Check-ins &amp; check-outs per day
                              </p>
                            </div>
                            <GroupedBarChart rows={metrics.trendRows} />
                          </>
                        ) : (
                          <>
                            <div className="mb-4 flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-zinc-800">
                                {metrics.eventWindowLabel} — Time
                                Distribution
                              </h2>
                              <p className="text-xs text-zinc-400">
                                Check-in &amp; check-out activity across
                                the day
                              </p>
                            </div>
                            <DayDetailChart
                              detail={metrics.dayDetail}
                              dayLabel={metrics.eventWindowLabel}
                            />
                          </>
                        )}
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <h2 className="mb-4 text-lg font-semibold text-zinc-800">
                          Period Breakdown
                        </h2>
                        <PeriodSummaryCard data={metrics.periodSummary} />
                      </div>
                    </section>

                    {/* ── Section leaderboard + Alerts ── */}
                    <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
                      {/* Sections */}
                      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <h2 className="mb-4 text-lg font-semibold text-zinc-800">
                          Section Leaderboard
                        </h2>

                        <div className="space-y-3">
                          {metrics.topSections.length === 0 ? (
                            <p className="text-sm text-zinc-400">
                              No section data yet.
                            </p>
                          ) : (
                            metrics.topSections.map((section, i) => {
                              const barPct = Math.min(section.rate, 100);
                              return (
                                <div key={section.section}>
                                  <div className="mb-1 flex items-baseline justify-between text-sm">
                                    <span className="font-medium text-zinc-700">
                                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-500">
                                        {i + 1}
                                      </span>
                                      {section.section}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                      {section.timeIns}/{section.maxSlots} in · {section.timeOuts}/{section.maxSlots} out
                                      <span className="ml-2 font-semibold text-zinc-700">
                                        {section.rate.toFixed(1)}%
                                      </span>
                                    </span>
                                  </div>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                    <div
                                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                      style={{ width: `${barPct}%` }}
                                    />
                                  </div>
                                  {section.missingOuts > 0 ? (
                                    <p className="mt-0.5 text-[10px] text-red-500">
                                      {section.missingOuts} missing time-out
                                      {section.missingOuts > 1 ? "s" : ""}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Alerts */}
                      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <h2 className="mb-4 text-lg font-semibold text-zinc-800">
                          Alerts &amp; Insights
                        </h2>
                        {metrics.alerts.length > 0 ? (
                          <AlertsCard rows={metrics.alerts} />
                        ) : (
                          <p className="text-sm text-zinc-400">
                            No alerts at this time.
                          </p>
                        )}
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    No metrics available yet.
                  </div>
                )}
              </>
            ) : active === "Students List" ? (
              <StudentsList />
            ) : active === "Sections" ? (
              <SectionListPage />
            ) : active === "Event Settings" ? (
              <EventSettings />
            ) : (
              <AttendanceList />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
