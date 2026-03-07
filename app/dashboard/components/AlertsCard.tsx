export type AlertRow = {
  title: string;
  details: string;
  badge: string;
};

type AlertsCardProps = {
  title: string;
  rows: AlertRow[];
};

export default function AlertsCard({ title, rows }: AlertsCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-2xl leading-none font-semibold tracking-tight text-zinc-900">{title}</h3>
      <div className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200">
        {rows.map((row) => (
          <div key={row.title} className="flex items-center justify-between px-3 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-700">{row.title}</p>
              <p className="text-xs text-zinc-500">{row.details}</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
              {row.badge}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
