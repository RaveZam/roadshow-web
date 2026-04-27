import type { DashboardStatCard } from "../types/master-types";

const accentBorder: Record<string, string> = {
  emerald: "border-l-emerald-500",
  teal: "border-l-teal-500",
  amber: "border-l-amber-400",
  red: "border-l-red-500",
  zinc: "border-l-zinc-300",
};

const valueTint: Record<string, string> = {
  emerald: "text-emerald-700",
  teal: "text-teal-700",
  amber: "text-amber-700",
  red: "text-red-600",
  zinc: "text-zinc-900",
};

export default function StatCardsRow({
  cards,
}: {
  cards: DashboardStatCard[];
}) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const color = card.color ?? "zinc";
        return (
          <article
            key={card.label}
            className={`rounded-xl border border-l-4 border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${accentBorder[color]}`}
          >
            <p className="text-[11px] tracking-wide text-zinc-500 uppercase">
              {card.label}
            </p>
            <p
              className={`mt-1 text-[32px] leading-none font-semibold tracking-tight ${valueTint[color]}`}
            >
              {card.value}
            </p>
            <p className="mt-2 text-xs text-zinc-400">{card.note}</p>
          </article>
        );
      })}
    </section>
  );
}
