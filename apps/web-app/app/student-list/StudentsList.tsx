"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchSections, type Section } from "../section-list/services/sections";
import {
  createStudent,
  deleteStudent,
  fetchStudentsForExport,
  STUDENTS_PAGE_SIZE,
  type Student,
  updateStudent,
} from "./services/students";
import { generateStudentQrZip } from "./hooks/useExportQR";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openActionMenuStudentId, setOpenActionMenuStudentId] = useState<
    string | null
  >(null);
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newSectionId, setNewSectionId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [isExportingQr, setIsExportingQr] = useState(false);
  const [exportError, setExportError] = useState("");

  const loadStudents = async (sectionId: string) => {
    setIsFetching(true);
    setError("");

    const studentsResult = await fetchStudentsForExport(sectionId);

    setIsFetching(false);

    if (studentsResult.error) {
      setError(studentsResult.error.message);
      return;
    }

    setStudents(studentsResult.data ?? []);
  };

  useEffect(() => {
    const initializeSections = async () => {
      const sectionsResult = await fetchSections();

      if (sectionsResult.error) {
        setError(sectionsResult.error.message);
        return;
      }

      const fetchedSections = sectionsResult.data ?? [];
      setSections(fetchedSections);

      if (fetchedSections.length > 0) {
        setNewSectionId(fetchedSections[0].id);
      }
    };

    initializeSections();
  }, []);

  useEffect(() => {
    loadStudents(selectedSectionId);
  }, [selectedSectionId]);

  const sectionNameById = useMemo(
    () => new Map(sections.map((section) => [section.id, section.name])),
    [sections],
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      return name.includes(term) || s.student_id.toLowerCase().includes(term);
    });
  }, [students, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PAGE_SIZE),
  );
  const displayStudents = useMemo(
    () =>
      filteredStudents.slice(
        (currentPage - 1) * STUDENTS_PAGE_SIZE,
        currentPage * STUDENTS_PAGE_SIZE,
      ),
    [filteredStudents, currentPage],
  );

  const resetAddForm = () => {
    setStudentId("");
    setFirstName("");
    setLastName("");
    setAddError("");
    setNewSectionId(sections[0]?.id ?? "");
  };

  const openAddModal = () => {
    setEditingStudent(null);
    resetAddForm();
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setEditingStudent(null);
    setAddError("");
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setStudentId(student.student_id);
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setNewSectionId(student.section_id);
    setAddError("");
    setAddModalOpen(true);
    setOpenActionMenuStudentId(null);
  };

  const openDeleteModal = (student: Student) => {
    setOpenActionMenuStudentId(null);
    setDeleteTarget(student);
    setDeleteModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setError("");

    const { error: deleteError } = await deleteStudent(deleteTarget.id);

    setDeleteLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadStudents(selectedSectionId);
    setCurrentPage((page) => Math.min(page, totalPages));
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const onSubmitAddStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !studentId.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !newSectionId
    ) {
      return;
    }

    setAdding(true);
    setAddError("");

    const studentPayload = {
      student_id: studentId.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      section_id: newSectionId,
    };
    const { data, error: submitError } = editingStudent
      ? await updateStudent({
          id: editingStudent.id,
          ...studentPayload,
        })
      : await createStudent(studentPayload);

    setAdding(false);

    if (submitError) {
      setAddError(submitError.message);
      return;
    }

    if (data) {
      await loadStudents(selectedSectionId);
      setCurrentPage(1);
    }

    closeAddModal();
    resetAddForm();
  };

  const onExportStudentQr = async () => {
    setIsExportingQr(true);
    setExportError("");

    try {
      const exportStudentsResult =
        await fetchStudentsForExport(selectedSectionId);

      if (exportStudentsResult.error) {
        setExportError(exportStudentsResult.error.message);
        return;
      }

      const exportStudents = exportStudentsResult.data ?? [];

      if (exportStudents.length === 0) {
        setExportError("No students to export.");
        return;
      }

      const zipBlob = await generateStudentQrZip(
        exportStudents.map((student) => ({
          id: student.id,
          student_id: student.student_id,
          full_name: `${student.first_name} ${student.last_name}`,
        })),
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
        error instanceof Error
          ? error.message
          : "Failed to export student QR codes.",
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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search students..."
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
                  <span className="block truncate font-normal">
                    All sections
                  </span>
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
            onClick={onExportStudentQr}
            disabled={isExportingQr || isFetching || students.length === 0}
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
        {exportError ? (
          <p className="mb-3 text-sm text-red-600">{exportError}</p>
        ) : null}
        {sections.length === 0 ? (
          <p className="mb-3 text-sm text-zinc-500">
            Add a section first before adding students.
          </p>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[minmax(220px,1.5fr)_minmax(140px,1fr)_180px_64px] items-center gap-4 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            <p>Student</p>
            <p>Section</p>
            <p>Created</p>
            <p className="justify-self-end text-right">Actions</p>
          </div>

          <div className="divide-y divide-zinc-100">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                <p className="mt-2 text-sm text-zinc-500">
                  Loading students...
                </p>
              </div>
            ) : displayStudents.length === 0 ? (
              <p className="px-3 py-4 text-sm text-zinc-500">
                No students found.
              </p>
            ) : (
              displayStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[minmax(220px,1.5fr)_minmax(140px,1fr)_180px_64px] items-center gap-4 px-3 py-2 text-sm text-zinc-700"
                >
                  <div>
                    <p>
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {student.student_id}
                    </p>
                  </div>
                  <p>
                    {sectionNameById.get(student.section_id) ??
                      "Unknown section"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(student.created_at + "Z").toLocaleString(
                      "en-PH",
                      { timeZone: "Asia/Manila" },
                    )}
                  </p>
                  <div className="relative justify-self-end">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenActionMenuStudentId((current) =>
                          current === student.id ? null : student.id,
                        )
                      }
                      className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                    >
                      ...
                    </button>
                    {openActionMenuStudentId === student.id ? (
                      <div className="absolute right-0 top-9 z-10 w-28 rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => openEditModal(student)}
                          className="w-full rounded px-2 py-1 text-left text-xs text-zinc-700 hover:bg-zinc-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(student)}
                          className="w-full rounded px-2 py-1 text-left text-xs text-red-600 hover:bg-zinc-100"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
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

      {addModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">
              {editingStudent ? "Edit student" : "Add student"}
            </h3>
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
              <Listbox value={newSectionId} onChange={setNewSectionId}>
                <div className="relative">
                  <ListboxButton className="relative w-full cursor-default rounded-md border border-zinc-200 bg-white py-2 pl-3 pr-8 text-left text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-300">
                    <span className="block truncate">
                      {sections.find((s) => s.id === newSectionId)?.name ??
                        "Select section"}
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

              {addError ? (
                <p className="text-sm text-red-600">{addError}</p>
              ) : null}

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
                  {adding
                    ? editingStudent
                      ? "Saving..."
                      : "Adding..."
                    : editingStudent
                      ? "Save"
                      : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {deleteModalOpen && deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">
              Delete student
            </h3>
            <p className="mt-3 text-sm text-zinc-700">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {deleteTarget.first_name} {deleteTarget.last_name}
              </span>
              ? This action cannot be undone.
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              This will permanently remove the student from the list.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                disabled={deleteLoading}
                className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
