 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import SimpleTableCard, { type TableRow } from "./components/SimpleTableCard";
import StatCardsRow from "./components/StatCardsRow";
import AlertsCard, { type AlertRow } from "./components/AlertsCard";
import StudentsList from "./student-list/StudentsList";
import { createClient } from "@/utils/supabase/client";

const topProductsRows: TableRow[] = [
  { label: "Pandesal (12pc)", value: "56", amount: "₱3,080" },
  { label: "Spanish Bread", value: "25", amount: "₱750" },
  { label: "Cheese Bread", value: "21", amount: "₱840" },
  { label: "Banana Bread Slice", value: "20", amount: "₱900" },
  { label: "Ensaymada", value: "18", amount: "₱630" },
];

const boProductsRows: TableRow[] = [
  { label: "Spanish Bread", value: "20", amount: "₱600" },
];

const varianceAlerts: AlertRow[] = [
  {
    title: "Ben • 2026-02-21",
    details: "2 rows • BO 25 • variance 8",
    badge: "v270",
  },
];

export default function DashboardPage() {
  const [active, setActive] = useState<string>("Dashboard");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="h-screen bg-[#f5f6f8] font-sans text-zinc-900">
      <div className="flex h-full">
        <DashboardSidebar active={active} onSelect={setActive} />

        <main className="flex-1 p-6 xl:p-8 flex flex-col overflow-hidden">
          <header className="mb-5 flex-none">
            <h1 className="text-[42px] leading-none font-semibold tracking-tight text-zinc-900">
              {active === "Dashboard" ? "Dashboard" : "Students List"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {active === "Dashboard"
                ? "Control center - not analytics."
                : "Manage students and attendance."}
            </p>
          </header>

          <div className="flex-1 overflow-auto hide-scrollbar">
            {active === "Dashboard" ? (
              <>
                <StatCardsRow />

                <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[3fr_1.4fr]">
                  <div className="h-[330px] rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    <h2 className="text-lg font-semibold text-zinc-800">Project Analytics</h2>
                    <div className="flex h-full items-center justify-center pb-10">
                      <p className="text-5xl font-semibold lowercase tracking-tight text-zinc-700">
                        attendance
                      </p>
                    </div>
                  </div>

                  <SimpleTableCard title="Top 5 products sold" rows={topProductsRows} />
                </section>

                <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1.3fr]">
                  <SimpleTableCard title="Top 5 BO products" rows={boProductsRows} />
                  <AlertsCard title="Variance alerts" rows={varianceAlerts} />
                </section>
              </>
            ) : (
              <StudentsList />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
