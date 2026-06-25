"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminLogout } from "@/lib/admin-store";

type AdminHeaderProps = {
  onMenuOpen: () => void;
};

export default function AdminHeader({ onMenuOpen }: AdminHeaderProps) {
  const router = useRouter();

  function handleLogout() {
    adminLogout().then(() => {
      router.push("/admin/login");
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="rounded-xl border border-border p-2.5 md:hidden"
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
            className="font-serif text-lg font-semibold text-primary sm:text-xl"
          >
            Christian Lyrics Admin
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-section hover:text-foreground sm:inline-block"
          >
            View Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-section"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
