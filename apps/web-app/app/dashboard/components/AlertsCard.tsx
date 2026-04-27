import type { DashboardAlert } from "../types/master-types";

const badgeStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Watch: "bg-amber-100 text-amber-700",
  Info: "bg-sky-100 text-sky-700",
};

export default function AlertsCard({ rows }: { rows: DashboardAlert[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
      {rows.map((row) => (
        <div
          key={row.title}
          className="flex items-start justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-700">{row.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{row.details}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${badgeStyles[row.badge] ?? "bg-zinc-100 text-zinc-600"}`}
          >
            {row.badge}
          </span>
        </div>
      ))}
    </div>
  );
}
