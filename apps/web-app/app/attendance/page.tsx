"use client";

import AttendanceList from "./AttendanceList";

export default function AttendancePage() {
  return (
    <main className="min-h-screen bg-[#f5f6f8] p-6 xl:p-8">
      <header className="mb-5">
        <h1 className="text-[42px] leading-none font-semibold tracking-tight text-zinc-900">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track day 1, day 2, and day 3 attendance by section.
        </p>
      </header>

      <AttendanceList />
    </main>
  );
}
