"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/admin-store";
import type { AdminStats } from "@/lib/admin-types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    published: 0,
    draft: 0,
    needsReview: 0,
  });

  useEffect(() => {
    setStats(getAdminStats());
  }, []);

  const statCards = [
    { label: "Total Songs", value: stats.total, color: "text-foreground" },
    { label: "Published", value: stats.published, color: "text-green-700" },
    { label: "Drafts", value: stats.draft, color: "text-gray-600" },
    { label: "Needs Review", value: stats.needsReview, color: "text-amber-700" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-2 text-lg text-muted">
        Welcome to the Christian Lyrics admin panel.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-base text-muted">{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/admin/songs/new"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-primary-light sm:w-auto"
        >
          ➕ Add New Lyrics
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/songs"
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-section"
        >
          <p className="text-lg font-semibold text-foreground">Manage Songs</p>
          <p className="mt-1 text-base text-muted">
            View, edit, and preview all songs.
          </p>
        </Link>
        <Link
          href="/admin/songs/new"
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-section"
        >
          <p className="text-lg font-semibold text-foreground">
            Quick Add Lyrics
          </p>
          <p className="mt-1 text-base text-muted">
            Paste lyrics from your phone and save.
          </p>
        </Link>
      </div>
    </div>
  );
}
