"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSections, type Section } from "../section-list/services/sections";
import {
  fetchStudentsForExport,
  STUDENTS_PAGE_SIZE,
  type Student,
} from "../student-list/services/students";
import { fetchAttendanceLogs, type AttendanceLog } from "./services/attendance";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";

type AttendanceLogRow = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  sectionName: string;
  period: string;
  timeIn: string | null;
  timeOut: string | null;
  date: string;
};

const formatTime = (timestamp: string | null) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const periodLabel = (period: string) => {
  const lower = period.toLowerCase();
  if (lower === "morning" || lower === "am") return "Morning";
  if (lower === "afternoon" || lower === "pm") return "Afternoon";
  return period;
};

type Remark = "Present" | "Late" | "No Time Out" | "—";

const getRemarks = (timeIn: string | null, timeOut: string | null): Remark => {
  if (timeIn && timeOut) return "Present";
  if (!timeIn && timeOut) return "Late";
  if (timeIn && !timeOut) return "No Time Out";
  return "—";
};

const remarkStyle: Record<Remark, string> = {
  Present: "bg-emerald-50 text-emerald-700",
  Late: "bg-orange-50 text-orange-700",
  "No Time Out": "bg-red-50 text-red-700",
  "—": "",
};

const isMorning = (period: string) => {
  const lower = period.toLowerCase();
  return lower === "morning" || lower === "am";
};

const toCsvValue = (value: string | number) => {
  const text = String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
};

const formatTimeForCsv = (timestamp: string | null) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function AttendanceList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const initializeSections = async () => {
      const sectionsResult = await fetchSections();

      if (sectionsResult.error) {
        setError(sectionsResult.error.message);
        return;
      }

      setSections(sectionsResult.data ?? []);
    };

    initializeSections();
  }, []);

  const loadAttendanceLogs = async (sectionId: string) => {
    setIsFetching(true);
    setError("");

    try {
      const studentsResult = await fetchStudentsForExport(sectionId);

      if (studentsResult.error) {
        setError(studentsResult.error.message);
        return;
      }

      const allStudents = studentsResult.data ?? [];
      setStudents(allStudents);

      const studentIds =
        sectionId === "all" ? [] : allStudents.map((student) => student.id);

      if (sectionId !== "all" && studentIds.length === 0) {
        setLogs([]);
        return;
      }

      const logsResult = await fetchAttendanceLogs(studentIds);

      if (logsResult.error) {
        setError(logsResult.error.message);
        return;
      }

      setLogs(logsResult.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attendance logs.",
      );
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAttendanceLogs(selectedSectionId);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [selectedSectionId]);

  const rows = useMemo(() => {
    const sectionById = new Map(
      sections.map((section) => [section.id, section.name]),
    );

    const logsByStudent = new Map<string, AttendanceLog[]>();
    for (const log of logs) {
      const existing = logsByStudent.get(log.student_id) ?? [];
      existing.push(log);
      logsByStudent.set(log.student_id, existing);
    }

    const result: AttendanceLogRow[] = [];

    for (const student of students) {
      const studentLogs = logsByStudent.get(student.id);

      if (studentLogs && studentLogs.length > 0) {
        for (const log of studentLogs) {
          result.push({
            id: log.id,
            studentId: student.student_id,
            firstName: student.first_name,
            lastName: student.last_name,
            sectionName: sectionById.get(student.section_id) ?? "Unknown section",
            period: log.period,
            timeIn: log.time_in,
            timeOut: log.time_out,
            date: log.date,
          });
        }
      } else {
        result.push({
          id: student.id,
          studentId: student.student_id,
          firstName: student.first_name,
          lastName: student.last_name,
          sectionName: sectionById.get(student.section_id) ?? "Unknown section",
          period: "",
          timeIn: null,
          timeOut: null,
          date: "",
        });
      }
    }

    return result;
  }, [logs, sections, students]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const name = `${row.firstName} ${row.lastName}`.toLowerCase();
      return name.includes(term) || row.studentId.toLowerCase().includes(term);
    });
  }, [rows, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / STUDENTS_PAGE_SIZE),
  );
  const displayRows = useMemo(
    () =>
      filteredRows.slice(
        (currentPage - 1) * STUDENTS_PAGE_SIZE,
        currentPage * STUDENTS_PAGE_SIZE,
      ),
    [filteredRows, currentPage],
  );

  const handleExtractRecords = async () => {
    setIsExporting(true);
    setError("");

    const exportStudentsResult =
      await fetchStudentsForExport(selectedSectionId);
    if (exportStudentsResult.error) {
      setIsExporting(false);
      setError(exportStudentsResult.error.message);
      return;
    }

    const exportStudents = exportStudentsResult.data ?? [];
    if (exportStudents.length === 0) {
      setIsExporting(false);
      setError("No students to export.");
      return;
    }

    const exportLogsResult = await fetchAttendanceLogs(
      exportStudents.map((s) => s.id),
    );
    if (exportLogsResult.error) {
      setIsExporting(false);
      setError(exportLogsResult.error.message);
      return;
    }

    const allLogs = exportLogsResult.data ?? [];
    const studentById = new Map(exportStudents.map((s) => [s.id, s]));
    const sectionById = new Map(sections.map((s) => [s.id, s.name]));

    // Group logs by student_id + date
    const grouped = new Map<
      string,
      { morning: AttendanceLog | null; afternoon: AttendanceLog | null }
    >();

    for (const log of allLogs) {
      const key = `${log.student_id}|${log.date}`;
      if (!grouped.has(key)) {
        grouped.set(key, { morning: null, afternoon: null });
      }
      const entry = grouped.get(key)!;
      if (isMorning(log.period)) {
        entry.morning = log;
      } else {
        entry.afternoon = log;
      }
    }

    const header = [
      "Student Name",
      "Student ID",
      "Section",
      "Day",
      "Morning Time In",
      "Morning Time Out",
      "Morning Remarks",
      "Afternoon Time In",
      "Afternoon Time Out",
      "Afternoon Remarks",
      "Attendance",
    ];

    const csvRows: string[] = [header.map(toCsvValue).join(",")];

    for (const [key, { morning, afternoon }] of grouped) {
      const [studentId, date] = key.split("|");
      const student = studentById.get(studentId);
      const studentName = student
        ? `${student.first_name} ${student.last_name}`.trim()
        : "";
      const studentCode = student?.student_id ?? "";
      const sectionName = student
        ? (sectionById.get(student.section_id) ?? "Unknown")
        : "Unknown";

      const morningRemarks = morning
        ? getRemarks(morning.time_in, morning.time_out)
        : "—";
      const afternoonRemarks = afternoon
        ? getRemarks(afternoon.time_in, afternoon.time_out)
        : "—";

      const attended =
        (morningRemarks !== "—" ? 1 : 0) + (afternoonRemarks !== "—" ? 1 : 0);

      const row = [
        toCsvValue(studentName),
        toCsvValue(studentCode),
        toCsvValue(sectionName),
        toCsvValue(formatDate(date)),
        toCsvValue(formatTimeForCsv(morning?.time_in ?? null)),
        toCsvValue(formatTimeForCsv(morning?.time_out ?? null)),
        toCsvValue(morningRemarks),
        toCsvValue(formatTimeForCsv(afternoon?.time_in ?? null)),
        toCsvValue(formatTimeForCsv(afternoon?.time_out ?? null)),
        toCsvValue(afternoonRemarks),
        toCsvValue(`${attended}/2`),
      ];

      csvRows.push(row.join(","));
    }

    const csv = csvRows.join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const sectionLabel =
      selectedSectionId === "all"
        ? "all-sections"
        : (sections.find((s) => s.id === selectedSectionId)?.name ?? "section");

    const safeSectionLabel = sectionLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const filename = `attendance-logs-${safeSectionLabel}.csv`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          aria-label="Search students"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name or student ID..."
          className="min-w-[200px] flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
        />
        <Listbox
          value={selectedSectionId}
          onChange={(value) => {
            setSelectedSectionId(value);
            setCurrentPage(1);
          }}
        >
          <div className="relative">
            <ListboxButton className="relative w-full min-w-[140px] cursor-default rounded-md border border-zinc-200 bg-white py-2 pl-3 pr-8 text-left text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-300">
              <span className="block truncate">
                {selectedSectionId === "all"
                  ? "All sections"
                  : (sections.find((s) => s.id === selectedSectionId)?.name ??
                    "All sections")}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="h-4 w-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </span>
            </ListboxButton>
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
              <ListboxOption
                value="all"
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-zinc-700 ui-selected:bg-emerald-50 ui-selected:text-emerald-900 ui-active:bg-zinc-100"
              >
                <span className="block truncate font-normal">All sections</span>
              </ListboxOption>
              {sections.map((section) => (
                <ListboxOption
                  key={section.id}
                  value={section.id}
                  className="relative cursor-default select-none py-2 pl-3 pr-9 text-zinc-700 ui-selected:bg-emerald-50 ui-selected:text-emerald-900 ui-active:bg-zinc-100"
                >
                  <span className="block truncate font-normal">
                    {section.name}
                  </span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <button
          type="button"
          onClick={handleExtractRecords}
          disabled={isFetching || isExporting || students.length === 0}
          className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-400 disabled:bg-emerald-400"
        >
          {isExporting ? "Extracting..." : "Extract Record"}
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <div className="grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <p>Student</p>
          <p>Section</p>
          <p>Day</p>
          <p>Period</p>
          <p>Time In</p>
          <p>Time Out</p>
          <p>Remarks</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
              <p className="mt-2 text-sm text-zinc-500">
                Loading attendance logs...
              </p>
            </div>
          ) : displayRows.length === 0 ? (
            <p className="px-3 py-4 text-sm text-zinc-500">
              No attendance logs found.
            </p>
          ) : (
            displayRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_1fr_1fr] items-center gap-4 px-3 py-2 text-sm text-zinc-700"
              >
                <div>
                  <p>
                    {row.firstName} {row.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">{row.studentId}</p>
                </div>
                <p>{row.sectionName}</p>
                <p>{formatDate(row.date)}</p>
                <p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.period.toLowerCase() === "morning" ||
                      row.period.toLowerCase() === "am"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {periodLabel(row.period)}
                  </span>
                </p>
                <p
                  className={row.timeIn ? "text-emerald-700" : "text-zinc-400"}
                >
                  {formatTime(row.timeIn)}
                </p>
                <p
                  className={row.timeOut ? "text-emerald-700" : "text-zinc-400"}
                >
                  {formatTime(row.timeOut)}
                </p>
                <p>
                  {(() => {
                    const remark = getRemarks(row.timeIn, row.timeOut);
                    if (remark === "—")
                      return <span className="text-zinc-400">—</span>;
                    return (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${remarkStyle[remark]}`}
                      >
                        {remark}
                      </span>
                    );
                  })()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1 || isFetching}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage >= totalPages || isFetching}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
