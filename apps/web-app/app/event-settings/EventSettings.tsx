"use client";

import { useEffect, useState } from "react";
import {
  fetchEventSettings,
  upsertEventSettings,
  type EventSettings as EventSettingsType,
  type EventSettingsInput,
} from "./services/eventSettings";

const DEFAULT_VALUES: EventSettingsInput = {
  start_date: "",
  end_date: "",
  morning_in: "07:00",
  morning_in_cutoff: "08:30",
  morning_out: "11:30",
  morning_out_cutoff: "12:00",
  afternoon_in: "13:00",
  afternoon_in_cutoff: "13:30",
  afternoon_out: "16:30",
  afternoon_out_cutoff: "17:00",
};

export default function EventSettings() {
  const [settings, setSettings] = useState<EventSettingsType | null>(null);
  const [form, setForm] = useState<EventSettingsInput>(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchEventSettings();
      if (data) {
        setSettings(data);
        setForm({
          start_date: data.start_date,
          end_date: data.end_date,
          morning_in: data.morning_in.slice(0, 5),
          morning_in_cutoff: data.morning_in_cutoff.slice(0, 5),
          morning_out: data.morning_out.slice(0, 5),
          morning_out_cutoff: data.morning_out_cutoff.slice(0, 5),
          afternoon_in: data.afternoon_in.slice(0, 5),
          afternoon_in_cutoff: data.afternoon_in_cutoff.slice(0, 5),
          afternoon_out: data.afternoon_out.slice(0, 5),
          afternoon_out_cutoff: data.afternoon_out_cutoff.slice(0, 5),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      const saved = await upsertEventSettings(form, settings?.id);
      setSettings(saved);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof EventSettingsInput>(
    key: K,
    value: EventSettingsInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
        <p className="mt-2 text-sm text-zinc-500">Loading event settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              Settings Saved
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Event settings have been updated successfully.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Event Dates */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h2 className="text-base font-semibold text-zinc-800">Event Dates</h2>
        <p className="mt-1 text-xs text-zinc-500">
          When does the event start and end?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Start Date
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => updateField("start_date", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              End Date
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => updateField("end_date", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Morning Schedule */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h2 className="text-base font-semibold text-zinc-800">
          Morning Schedule
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Time in/out and their cutoffs for the morning session (Philippine Time).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time In
            </label>
            <input
              type="time"
              value={form.morning_in}
              onChange={(e) => updateField("morning_in", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time In Cutoff
            </label>
            <input
              type="time"
              value={form.morning_in_cutoff}
              onChange={(e) => updateField("morning_in_cutoff", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time Out
            </label>
            <input
              type="time"
              value={form.morning_out}
              onChange={(e) => updateField("morning_out", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time Out Cutoff
            </label>
            <input
              type="time"
              value={form.morning_out_cutoff}
              onChange={(e) => updateField("morning_out_cutoff", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Afternoon Schedule */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h2 className="text-base font-semibold text-zinc-800">
          Afternoon Schedule
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Time in/out and their cutoffs for the afternoon session (Philippine Time).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time In
            </label>
            <input
              type="time"
              value={form.afternoon_in}
              onChange={(e) => updateField("afternoon_in", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time In Cutoff
            </label>
            <input
              type="time"
              value={form.afternoon_in_cutoff}
              onChange={(e) => updateField("afternoon_in_cutoff", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time Out
            </label>
            <input
              type="time"
              value={form.afternoon_out}
              onChange={(e) => updateField("afternoon_out", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Time Out Cutoff
            </label>
            <input
              type="time"
              value={form.afternoon_out_cutoff}
              onChange={(e) => updateField("afternoon_out_cutoff", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving
          ? "Saving..."
          : settings
            ? "Update Settings"
            : "Save Settings"}
      </button>
    </div>
  );
}
