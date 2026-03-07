"use client";

import React from "react";

export default function StudentsList() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <input
          aria-label="Search students"
          placeholder="Search students..."
          className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
        />
        <button
          type="button"
          className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-50 sm:flex"
        >
          Filter
        </button>
        <button
          type="button"
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add Student
        </button>
      </div>

      <div className="h-[420px] overflow-auto hide-scrollbar rounded-md border border-zinc-100 p-3">
        <p className="text-sm text-zinc-500">No students yet — this is a placeholder list area.</p>
      </div>
    </div>
  );
}
