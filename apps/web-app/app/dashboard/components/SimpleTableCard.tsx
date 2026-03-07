export type TableRow = {
  label: string;
  value: string;
  amount: string;
};

type SimpleTableCardProps = {
  title: string;
  rows: TableRow[];
};

export default function SimpleTableCard({ title, rows }: SimpleTableCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-2xl leading-none font-semibold tracking-tight text-zinc-900">{title}</h3>

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
        <div className="grid grid-cols-[1fr_auto_auto] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <p>Product</p>
          <p>Qty</p>
          <p>₱</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <div
              key={`${row.label}-${row.value}-${row.amount}`}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 text-sm text-zinc-700"
            >
              <p>{row.label}</p>
              <p>{row.value}</p>
              <p>{row.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
