import type { PeriodSummary } from "../types/master-types";

export default function PeriodSummaryCard({
  data,
}: {
  data: PeriodSummary[];
}) {
  return (
    <div className="space-y-4">
      {data.map((p) => {
        const pct =
          p.total === 0 ? 0 : Math.min((p.timeIns / p.total) * 100, 100);

        return (
          <div
            key={p.period}
            className="rounded-lg border border-zinc-200 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-700">
                {p.period}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                  p.period === "Morning"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {p.period === "Morning" ? "AM" : "PM"}
              </span>
            </div>

            {/* fill bar */}
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  p.period === "Morning" ? "bg-emerald-500" : "bg-teal-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mb-3 text-right text-[11px] text-zinc-400">
              {pct.toFixed(1)}% checked in
            </p>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <p className="text-zinc-400">Time Ins</p>
                <p className="text-sm font-semibold text-emerald-700">
                  {p.timeIns}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Time Outs</p>
                <p className="text-sm font-semibold text-teal-700">
                  {p.timeOuts}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">No Time Out</p>
                <p
                  className={`text-sm font-semibold ${p.missingOuts > 0 ? "text-red-600" : "text-zinc-300"}`}
                >
                  {p.missingOuts}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Late</p>
                <p
                  className={`text-sm font-semibold ${p.late > 0 ? "text-amber-600" : "text-zinc-300"}`}
                >
                  {p.late}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
