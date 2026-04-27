"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  active: string;
  onSelect: (item: string) => void;
};

const navItems = [
  {
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-none">
        <path d="M2 4.5A2.5 2.5 0 014.5 2h2A2.5 2.5 0 019 4.5v2A2.5 2.5 0 016.5 9h-2A2.5 2.5 0 012 6.5v-2zm9 0A2.5 2.5 0 0113.5 2h2A2.5 2.5 0 0118 4.5v2A2.5 2.5 0 0115.5 9h-2A2.5 2.5 0 0111 6.5v-2zm-9 8A2.5 2.5 0 014.5 10h2A2.5 2.5 0 019 12.5v2A2.5 2.5 0 016.5 17h-2A2.5 2.5 0 012 14.5v-2zm9 0A2.5 2.5 0 0113.5 10h2A2.5 2.5 0 0118 12.5v2A2.5 2.5 0 0115.5 17h-2A2.5 2.5 0 0111 14.5v-2z" />
      </svg>
    ),
  },
  {
    label: "Students List",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-none">
        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 17a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
      </svg>
    ),
  },
  {
    label: "Sections",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-none">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-none">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Event Settings",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-none">
        <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.205 1.251l-1.18 2.044a1 1 0 01-1.186.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.113a7.047 7.047 0 010-2.228L1.821 7.773a1 1 0 01-.205-1.251l1.18-2.044a1 1 0 011.186-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

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

  const initials = getInitials(userEmail);

  return (
    <>
      <aside
        className="flex h-full w-60 flex-none flex-col overflow-hidden"
        style={{
          background: "#f5f8f6",
          borderRight: "1px solid #d4e6dc",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-lg"
              style={{ background: "#e8f1ec" }}
            >
              <img
                src="https://res.cloudinary.com/dcdgu2fxc/image/upload/v1773372695/isu-logo_nnhlgl.png"
                alt="ISU logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-xs tracking-wide"
                style={{ color: "#141f19", letterSpacing: "0.04em" }}
              >
                Roadshow Attendance
              </p>
              <p className="text-[10px]" style={{ color: "#85a898" }}>
                ISU
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4" style={{ height: "1px", background: "#d4e6dc" }} />

        {/* Nav */}
        <nav className="flex-1 px-3">
          <p
            className="mb-3 px-2 text-[9px] tracking-widest uppercase"
            style={{ color: "#97b5a8" }}
          >
            Navigation
          </p>
          <ul className="space-y-0.5">
            {navItems.map(({ label, icon }) => {
              const isActive = label === active;
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => onSelect(label)}
                    className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-all duration-150 select-none"
                    style={
                      isActive
                        ? {
                            background: "rgba(5, 150, 105, 0.07)",
                            color: "#065f46",
                            borderLeft: "2px solid #059669",
                            paddingLeft: "10px",
                          }
                        : {
                            color: "#4a7060",
                            borderLeft: "2px solid transparent",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = "#243b2e";
                        (e.currentTarget as HTMLElement).style.background = "#ebf4ef";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = "#7a7060";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                  >
                    <span
                      style={
                        isActive
                          ? { color: "#059669" }
                          : { color: "inherit" }
                      }
                    >
                      {icon}
                    </span>
                    <span className="tracking-wide">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User card */}
        <div className="p-3">
          <div className="mb-3" style={{ height: "1px", background: "#d4e6dc" }} />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all duration-150"
            style={{ background: "#ebf4ef" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#e2ede7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#ebf4ef";
            }}
          >
            <div
              className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-[10px] tracking-wider"
              style={{
                background: "rgba(5, 150, 105, 0.1)",
                color: "#059669",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] tracking-wide" style={{ color: "#2a4035" }}>
                {userEmail}
              </p>
              <p className="text-[9px] tracking-wide" style={{ color: "#c5bcb0" }}>
                signed in
              </p>
            </div>
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3 flex-none"
              style={{ color: "#97b5a8" }}
            >
              <path d="M6 10.5a.5.5 0 000 1h3a.5.5 0 000-1H6zM5 7.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Profile modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)" }}>
          <div
            className="w-full max-w-sm rounded-xl p-5"
            style={{
              background: "#f5f8f6",
              border: "1px solid #d4e6dc",
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm tracking-wider"
                style={{
                  background: "rgba(5, 150, 105, 0.08)",
                  color: "#059669",
                  border: "1px solid rgba(5, 150, 105, 0.2)",
                }}
              >
                {initials}
              </div>
              <div>
                <h3 className="text-xs tracking-widest uppercase" style={{ color: "#141f19", letterSpacing: "0.12em" }}>
                  Account
                </h3>
                <p className="text-[10px]" style={{ color: "#85a898" }}>
                  Signed in via email
                </p>
              </div>
            </div>

            <div
              className="rounded-md p-3 mb-2 space-y-2"
              style={{ background: "#ebf4ef", border: "1px solid #d4e6dc" }}
            >
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "#c5bcb0" }}>Email</p>
                <p className="text-xs break-all" style={{ color: "#2a4035" }}>{userEmail}</p>
              </div>
              <div style={{ height: "1px", background: "#d4e6dc" }} />
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "#c5bcb0" }}>User ID</p>
                <p className="text-[10px] break-all font-mono" style={{ color: "#4a7060" }}>{userId}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-md px-3 py-2 text-xs tracking-wide transition-all duration-150"
                style={{
                  background: "#ebf4ef",
                  border: "1px solid #d4e6dc",
                  color: "#4a7060",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#e2ede7";
                  (e.currentTarget as HTMLElement).style.color = "#243b2e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#ebf4ef";
                  (e.currentTarget as HTMLElement).style.color = "#7a7060";
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 rounded-md px-3 py-2 text-xs tracking-wide transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "rgba(5, 150, 105, 0.08)",
                  border: "1px solid rgba(5, 150, 105, 0.25)",
                  color: "#065f46",
                }}
                onMouseEnter={(e) => {
                  if (!isSigningOut) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(5, 150, 105, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(5, 150, 105, 0.08)";
                }}
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
