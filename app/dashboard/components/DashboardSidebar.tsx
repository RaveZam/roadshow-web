"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  active: string;
  onSelect: (item: string) => void;
};

const navItems = ["Dashboard", "Students List"];

export default function DashboardSidebar({ active, onSelect }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("Unknown user");
  const [userId, setUserId] = useState("N/A");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserEmail(data.user.email ?? "No email");
        setUserId(data.user.id);
      }
    };

    loadUser();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  return (
    <>
      <aside className="flex h-full w-64 flex-none flex-col overflow-hidden border-r border-zinc-200 bg-white">
      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-sm font-semibold text-white">
            ••
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800">
              Roadshow Attendance
            </p>
            <p className="text-xs text-zinc-500">RouteLedger</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <p className="mb-2 text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item === active;

            return (
              <li
                key={item}
                onClick={() => onSelect(item)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm select-none ${
                  isActive
                    ? "bg-emerald-50 font-medium text-emerald-700"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {item}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left hover:bg-zinc-100"
        >
          <p className="text-sm font-medium text-zinc-800">{userEmail}</p>
          <p className="text-xs text-zinc-500">View profile and sign out</p>
        </button>
      </div>
      </aside>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-zinc-900">User Info</h3>
            <p className="mt-3 text-sm text-zinc-700">
              <span className="font-medium">Email:</span> {userEmail}
            </p>
            <p className="mt-1 break-all text-xs text-zinc-500">
              <span className="font-medium">User ID:</span> {userId}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
