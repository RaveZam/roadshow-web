"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSections, type Section } from "../section-list/services/sections";
import { fetchStudents, type Student } from "../student-list/services/students";
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

export default function AttendanceList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("all");

  useEffect(() => {
    const initialize = async () => {
      setIsFetching(true);
      setError("");

      const [studentsResult, sectionsResult, attendanceResult] = await Promise.all([
        fetchStudents(),
        fetchSections(),
        fetchAttendance(),
      ]);

      setIsFetching(false);

      if (studentsResult.error) {
        setError(studentsResult.error.message);
        return;
      }

      if (sectionsResult.error) {
        setError(sectionsResult.error.message);
        return;
      }

      if (attendanceResult.error) {
        setError(attendanceResult.error.message);
        return;
      }

      setStudents(studentsResult.data ?? []);
      setSections(sectionsResult.data ?? []);
      setAttendance(attendanceResult.data ?? []);
    };

    initialize();
  }, []);

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
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-300"
        >
          <option value="all">All sections</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
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
    </div>
  );
}
