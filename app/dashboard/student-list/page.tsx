"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentsList from "./StudentsList";
import { createClient } from "@/utils/supabase/client";

export default function StudentListPage() {
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
    <main className="min-h-screen bg-[#f5f6f8] p-6 xl:p-8">
      <header className="mb-5">
        <h1 className="text-[42px] leading-none font-semibold tracking-tight text-zinc-900">
          Students List
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Manage students and attendance.</p>
      </header>

      <StudentsList />
    </main>
  );
}
