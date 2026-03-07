import { type DashboardStatCard } from "../services/dashboardMetrics";

type StatCardsRowProps = {
  cards: DashboardStatCard[];
};

export default function StatCardsRow({ cards }: StatCardsRowProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
            card.highlighted
              ? "border-emerald-700 bg-emerald-700 text-white"
              : "border-zinc-200 bg-white text-zinc-900"
          }`}
        >
          <p className={`text-sm ${card.highlighted ? "text-emerald-100" : "text-zinc-500"}`}>
            {card.label}
          </p>
          <p className="mt-1 text-[36px] leading-none font-semibold tracking-tight">{card.value}</p>
          <p className={`mt-2 text-xs ${card.highlighted ? "text-emerald-100" : "text-zinc-400"}`}>
            {card.note}
          </p>
        </article>
      ))}
    </section>
  );
}
