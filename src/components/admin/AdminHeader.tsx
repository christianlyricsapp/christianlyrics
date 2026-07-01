"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminLogout, getLoggedInUserName, getAdminRole } from "@/lib/admin-store";

type AdminHeaderProps = {
  onMenuOpen: () => void;
};

export default function AdminHeader({ onMenuOpen }: AdminHeaderProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");

  useEffect(() => {
    setUserName(getLoggedInUserName());
    getAdminRole().then(setRole);
  }, []);

  function handleLogout() {
    adminLogout().then(() => {
      router.push("/admin/login");
    });
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            style={{
              background: "transparent",
              border: "1.5px solid #e2e8f0",
              color: "#0A2540",
              borderRadius: "6px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="md:hidden browse-reset-btn"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href="/admin/dashboard"
            className="font-serif text-lg font-semibold text-[#0A2540] sm:text-xl"
          >
            Christian Lyrics Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-[#3a5a7c] transition-colors hover:bg-[#f8fafc] hover:text-[#0A2540] sm:inline-block"
          >
            View Site
          </Link>

          {/* User Avatar + Name */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-[#051224]"
              style={{
                background:
                  role === "admin"
                    ? "var(--accent)"
                    : "#d6b265",
              }}
              title={`${userName} (${role})`}
            >
              {initials}
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-semibold leading-tight text-[#0A2540]">
                {userName}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">
                {role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-medium text-[#0A2540] transition-colors hover:bg-[#f8fafc]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
