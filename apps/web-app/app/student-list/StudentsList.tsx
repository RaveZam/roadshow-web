"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchSections, type Section } from "../section-list/services/sections";
import { createStudent, fetchStudents, type Student } from "./services/students";
import { generateStudentQrZip } from "./hooks/useExportQR";

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("all");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newSectionId, setNewSectionId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [isExportingQr, setIsExportingQr] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      setIsFetching(true);
      setError("");

      const [studentsResult, sectionsResult] = await Promise.all([
        fetchStudents(),
        fetchSections(),
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

      const fetchedSections = sectionsResult.data ?? [];
      setSections(fetchedSections);
      setStudents(studentsResult.data ?? []);

      if (fetchedSections.length > 0) {
        setNewSectionId(fetchedSections[0].id);
      }
    };

    initialize();
  }, []);

  const sectionNameById = useMemo(() => {
    return new Map(sections.map((section) => [section.id, section.name]));
  }, [sections]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSection =
        selectedSectionId === "all" || student.section_id === selectedSectionId;

      if (!matchesSection) return false;

      if (!normalizedSearch) return true;

      const studentCode = student.student_id.toLowerCase();
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      return (
        fullName.includes(normalizedSearch) ||
        studentCode.includes(normalizedSearch)
      );
    });
  }, [search, selectedSectionId, students]);

  const resetAddForm = () => {
    setStudentId("");
    setFirstName("");
    setLastName("");
    setAddError("");
    setNewSectionId(sections[0]?.id ?? "");
  };

  const openAddModal = () => {
    resetAddForm();
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddError("");
  };

  const onSubmitAddStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentId.trim() || !firstName.trim() || !lastName.trim() || !newSectionId) {
      return;
    }

    setAdding(true);
    setAddError("");

    const { data, error: createError } = await createStudent({
      student_id: studentId.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      section_id: newSectionId,
    });

    setAdding(false);

    if (createError) {
      setAddError(createError.message);
      return;
    }

    if (data) {
      setStudents((current) => [data, ...current]);
    }

    closeAddModal();
    resetAddForm();
  };

  const onExportStudentQr = async () => {
    if (filteredStudents.length === 0) {
      setExportError("No students to export.");
      return;
    }

    setIsExportingQr(true);
    setExportError("");

    try {
      const zipBlob = await generateStudentQrZip(
        filteredStudents.map((student) => ({
          id: student.id,
          student_id: student.student_id,
          full_name: `${student.first_name} ${student.last_name}`,
        }))
      );

      const objectUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "student-qrs.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Failed to export student QR codes."
      );
    } finally {
      setIsExportingQr(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            aria-label="Search students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
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
          <button
            type="button"
            onClick={onExportStudentQr}
            disabled={isExportingQr || filteredStudents.length === 0}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isExportingQr ? "Extracting..." : "Extract Student QR's"}
          </button>
          <button
            type="button"
            onClick={openAddModal}
            disabled={sections.length === 0}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Add Student
          </button>
        </div>

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        {exportError ? <p className="mb-3 text-sm text-red-600">{exportError}</p> : null}
        {sections.length === 0 ? (
          <p className="mb-3 text-sm text-zinc-500">
            Add a section first before adding students.
          </p>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[1fr_1fr_auto] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            <p>Student</p>
            <p>Section</p>
            <p>Created</p>
          </div>

          <div className="divide-y divide-zinc-100">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                <p className="mt-2 text-sm text-zinc-500">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <p className="px-3 py-4 text-sm text-zinc-500">No students found.</p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-3 py-2 text-sm text-zinc-700"
                >
                  <div>
                    <p>
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-zinc-500">{student.student_id}</p>
                  </div>
                  <p>{sectionNameById.get(student.section_id) ?? "Unknown section"}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(student.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {addModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">Add student</h3>
            <form className="mt-4 space-y-3" onSubmit={onSubmitAddStudent}>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Student ID"
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
              <select
                value={newSectionId}
                onChange={(e) => setNewSectionId(e.target.value)}
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>

              {addError ? <p className="text-sm text-red-600">{addError}</p> : null}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {adding ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
