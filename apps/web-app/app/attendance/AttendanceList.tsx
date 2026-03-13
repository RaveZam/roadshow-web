"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSections, type Section } from "../section-list/services/sections";
import {
  fetchStudents,
  fetchStudentsForExport,
  STUDENTS_PAGE_SIZE,
  type Student,
} from "../student-list/services/students";
import { fetchAttendance, type Attendance } from "./services/attendance";

type AttendanceRow = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  sectionId: string;
  sectionName: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  daysAttended: number;
};

const toStatus = (isPresent: boolean) => (isPresent ? "Present" : "Absent");

const toCsvValue = (value: string | number) => {
  const text = String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
};

const toCsvExcelText = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return `"=""${escaped}"""`;
};

export default function AttendanceList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
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

  const totalPages = Math.max(1, Math.ceil(totalStudents / STUDENTS_PAGE_SIZE));

  const loadAttendance = async (page: number, sectionId: string) => {
    setIsFetching(true);
    setError("");

    const studentsResult = await fetchStudents(page, sectionId);

    if (studentsResult.error) {
      setIsFetching(false);
      setError(studentsResult.error.message);
      return;
    }

    const pagedStudents = studentsResult.data ?? [];
    setStudents(pagedStudents);
    setTotalStudents(studentsResult.count ?? 0);

    if (pagedStudents.length === 0) {
      setAttendance([]);
      setIsFetching(false);
      return;
    }

    const attendanceResult = await fetchAttendance(
      pagedStudents.map((student) => student.id),
    );

    setIsFetching(false);

    if (attendanceResult.error) {
      setError(attendanceResult.error.message);
      return;
    }

    setAttendance(attendanceResult.data ?? []);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAttendance(currentPage, selectedSectionId);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentPage, selectedSectionId]);

  const rows = useMemo(() => {
    const attendanceByStudentId = new Map(
      attendance.map((record) => [record.student_id, record]),
    );
    const sectionById = new Map(sections.map((section) => [section.id, section.name]));

    return students.map((student): AttendanceRow => {
      const record = attendanceByStudentId.get(student.id);
      const day1 = record ? Boolean(record.day1) : false;
      const day2 = record ? Boolean(record.day2) : false;
      const day3 = record ? Boolean(record.day3) : false;
      const daysAttended = Number(day1) + Number(day2) + Number(day3);

      return {
        id: record?.id ?? `student-${student.id}`,
        studentId: student.student_id,
        firstName: student.first_name,
        lastName: student.last_name,
        sectionId: student.section_id,
        sectionName: sectionById.get(student.section_id) ?? "Unknown section",
        day1,
        day2,
        day3,
        daysAttended,
      };
    });
  }, [attendance, sections, students]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSection =
        selectedSectionId === "all" || row.sectionId === selectedSectionId;

      if (!matchesSection) return false;

      if (!normalizedSearch) return true;

      const fullName = `${row.firstName} ${row.lastName}`.toLowerCase();
      const studentCode = row.studentId.toLowerCase();
      return (
        fullName.includes(normalizedSearch) ||
        studentCode.includes(normalizedSearch)
      );
    });
  }, [rows, search, selectedSectionId]);

  const handleExtractRecords = async () => {
    setIsExporting(true);
    setError("");

    const exportStudentsResult = await fetchStudentsForExport(selectedSectionId);

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

    const exportAttendanceResult = await fetchAttendance(
      exportStudents.map((student) => student.id),
    );

    if (exportAttendanceResult.error) {
      setIsExporting(false);
      setError(exportAttendanceResult.error.message);
      return;
    }

    const attendanceByStudentId = new Map(
      (exportAttendanceResult.data ?? []).map((record) => [record.student_id, record]),
    );
    const sectionById = new Map(sections.map((section) => [section.id, section.name]));
    const exportRows = exportStudents.map((student) => {
      const record = attendanceByStudentId.get(student.id);
      const day1 = record ? Boolean(record.day1) : false;
      const day2 = record ? Boolean(record.day2) : false;
      const day3 = record ? Boolean(record.day3) : false;
      const daysAttended = Number(day1) + Number(day2) + Number(day3);

      return {
        studentName: `${student.first_name} ${student.last_name}`.trim(),
        studentId: student.student_id,
        sectionName: sectionById.get(student.section_id) ?? "Unknown section",
        day1,
        day2,
        day3,
        daysAttended,
      };
    });

    const header = [
      "Student Name",
      "Student ID",
      "Section",
      "Day 1",
      "Day 2",
      "Day 3",
      "Days Attended",
    ];

    const lines = [
      header.map(toCsvValue).join(","),
      ...exportRows.map((row) => {
        const rowValues = [
          row.studentName,
          row.studentId,
          row.sectionName,
          toStatus(row.day1),
          toStatus(row.day2),
          toStatus(row.day3),
        ];

        return `${rowValues.map(toCsvValue).join(",")},${toCsvExcelText(`${row.daysAttended}/3`)}`;
      }),
    ];

    const csv = `${lines.join("\n")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const sectionLabel =
      selectedSectionId === "all"
        ? "all-sections"
        : sections.find((section) => section.id === selectedSectionId)?.name ??
          "section";

    const safeSectionLabel = sectionLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const filename = `attendance-${safeSectionLabel}.csv`;
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or student ID..."
          className="min-w-[200px] flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
        />
        <select
          value={selectedSectionId}
          onChange={(e) => {
            setSelectedSectionId(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-300"
        >
          <option value="all">All sections</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExtractRecords}
          disabled={isFetching || isExporting || totalStudents === 0}
          className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-400 disabled:bg-emerald-400"
        >
          {isExporting ? "Extracting..." : "Extract Record"}
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <p>Student</p>
          <p>Section</p>
          <p className="text-left">Day 1</p>
          <p className="text-left">Day 2</p>
          <p className="text-left">Day 3</p>
          <p className="text-left">Days Attended</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
              <p className="mt-2 text-sm text-zinc-500">Loading attendance...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <p className="px-3 py-4 text-sm text-zinc-500">No students found.</p>
          ) : (
            filteredRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] items-center gap-4 px-3 py-2 text-sm text-zinc-700"
              >
                <div>
                  <p>
                    {row.firstName} {row.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">{row.studentId}</p>
                </div>
                <p>{row.sectionName}</p>
                <p
                  className={`text-left ${row.day1 ? "text-emerald-700" : "text-zinc-500"}`}
                >
                  {toStatus(row.day1)}
                </p>
                <p
                  className={`text-left ${row.day2 ? "text-emerald-700" : "text-zinc-500"}`}
                >
                  {toStatus(row.day2)}
                </p>
                <p
                  className={`text-left ${row.day3 ? "text-emerald-700" : "text-zinc-500"}`}
                >
                  {toStatus(row.day3)}
                </p>
                <p className="text-left font-medium text-zinc-700">
                  {row.daysAttended}/3
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
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
