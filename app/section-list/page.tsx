"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createSection,
  fetchSections,
  updateSection,
  deleteSection,
  type Section,
} from "./services/sections";

export default function SectionListPage() {
  const [name, setName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setIsFetching(true);
      const { data, error: fetchError } = await fetchSections();
      setIsFetching(false);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setSections(data ?? []);
    };

    initialize();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const { data, error: createError } = await createSection(name.trim());
    setLoading(false);

    if (createError) {
      setError(createError.message);
      return;
    }

    if (data) {
      setSections((current) => [data, ...current]);
    }
    setName("");
  };

  const handleDelete = (section: Section) => {
    setDeleteError("");
    setDeleteTarget(section);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");

    const { error: delError } = await deleteSection(deleteTarget.id);
    setDeleteLoading(false);

    if (delError) {
      const msg =
        delError.message ??
        "Failed to delete section. It may have dependent students.";
      setDeleteError(
        /foreign|dependen|constraint/i.test(msg)
          ? "Cannot delete section: there are students assigned to this section."
          : msg,
      );
      return;
    }

    setSections((current) => current.filter((s) => s.id !== deleteTarget.id));
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const startEdit = (section: Section) => {
    setEditingId(section.id);
    setEditingName(section.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    const { data, error: updError } = await updateSection(
      id,
      editingName.trim(),
    );
    if (updError) {
      setError(updError.message);
      return;
    }
    if (data) {
      setSections((current) => current.map((s) => (s.id === id ? data : s)));
    }
    cancelEdit();
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] ">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <form className="mb-4 flex gap-2" onSubmit={onSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Section name"
            className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Adding..." : "Add Section"}
          </button>
        </form>

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-[1fr_auto_auto] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            <p>Name</p>
            <p>Created</p>
            <div />
          </div>

          <div className="divide-y divide-zinc-100">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                <p className="mt-2 text-sm text-zinc-500">
                  Loading sections...
                </p>
              </div>
            ) : sections.length === 0 ? (
              <p className="px-3 py-4 text-sm text-zinc-500">
                No sections yet.
              </p>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-3 py-2 text-sm text-zinc-700"
                >
                  <div>
                    {editingId === section.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(section.id)}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(section)}
                        className="text-left text-sm text-zinc-700 hover:underline"
                      >
                        {section.name}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500">
                    {new Date(section.created_at).toLocaleString()}
                  </p>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(section)}
                      title="Delete section"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.75 5.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75zM5.25 7.5a.75.75 0 0 0-.75.75v9.75c0 1.24 1.01 2.25 2.25 2.25h9.75c1.24 0 2.25-1.01 2.25-2.25V8.25a.75.75 0 0 0-.75-.75H5.25zM9 3.75A1.5 1.5 0 0 1 10.5 2.25h3a1.5 1.5 0 0 1 1.5 1.5V4.5h3.75a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 4.5H6v-.75z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {deleteModalOpen && deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">
              Delete section
            </h3>
            <p className="mt-3 text-sm text-zinc-700">
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteTarget.name}</span>? This
              action cannot be undone.
            </p>
            {deleteError ? (
              <p className="mt-3 text-sm text-red-600">{deleteError}</p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">
                If this section has students assigned, deletion will fail and an
                error will be shown.
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
