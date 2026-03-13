"use client";

import { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import StatCardsRow from "./components/StatCardsRow";
import StudentsList from "../student-list/StudentsList";
import SectionListPage from "../section-list/page";
import AttendanceList from "../attendance/AttendanceList";
import Header from "../components/header";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";

export type DayFilter = "all" | "day1" | "day2" | "day3";

const DAY_FILTER_LABELS: Record<DayFilter, string> = {
  all: "All-Time",
  day1: "Day 1",
  day2: "Day 2",
  day3: "Day 3",
};

export default function DashboardPage() {
  const [active, setActive] = useState<string>("Dashboard");
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const { metrics, isLoadingMetrics, metricsError } = useDashboardMetrics(
    active === "Dashboard",
  );

  return (
    <div className="h-screen bg-[#f5f6f8] font-sans text-zinc-900">
      <div className="flex h-full">
        <DashboardSidebar active={active} onSelect={setActive} />
        <main className="flex-1 p-6 xl:p-8 flex flex-col overflow-hidden">
          <Header active={active} />
          <div className="flex-1 overflow-auto hide-scrollbar">
            {active === "Dashboard" ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {(Object.keys(DAY_FILTER_LABELS) as DayFilter[]).map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDayFilter(key)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          dayFilter === key
                            ? "bg-emerald-600 text-white"
                            : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        {DAY_FILTER_LABELS[key]}
                      </button>
                    ),
                  )}
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
                    <StatCardsRow cards={metrics.statCards} />

                    <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.4fr]">
                      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-zinc-800">
                            Daily Attendance Trend
                          </h2>
                          <p className="text-xs text-zinc-500">
                            {metrics.eventWindowLabel}
                          </p>
                        </div>

                        <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                          {metrics.trendRows.map((row) => (
                            <div
                              key={row.day}
                              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-3 py-3 text-sm text-zinc-700"
                            >
                              <p className="font-medium">{row.day}</p>
                              <p>{row.checkedIn.toLocaleString()} checked in</p>
                              <p className="text-xs text-zinc-500">
                                {row.rate}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <h2 className="text-lg font-semibold text-zinc-800">
                          Top Sections by Attendance
                        </h2>
                        <div className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                          {metrics.topSections.map((section) => (
                            <div
                              key={section.section}
                              className="flex items-center justify-between px-3 py-3 text-sm text-zinc-700"
                            >
                              <p className="font-medium">{section.section}</p>
                              <p>{section.checkedIn}</p>
                              <p className="text-xs text-zinc-500">
                                {section.rate}
                              </p>
                            </div>
                          ))}
                        </div>
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
            ) : (
              <AttendanceList />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
