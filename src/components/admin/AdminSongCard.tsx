"use client";

import Link from "next/link";
import { getCategoryName, getLanguageName } from "@/lib/demo-data";
import ReviewStatusBadge from "./ReviewStatusBadge";
import type { AdminSong } from "@/lib/admin-types";

type AdminSongCardProps = {
  song: AdminSong;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminSongCard({ song }: AdminSongCardProps) {
  const categoryLabels = song.categories.map((c) => getCategoryName(c)).join(", ");

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground sm:text-xl">
            {song.title}
          </h3>
          <p className="mt-1 text-sm text-muted">/{song.slug}</p>
        </div>
        <ReviewStatusBadge status={song.status} />
      </div>

      <dl className="mt-4 grid gap-2 text-base sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Category</dt>
          <dd className="font-medium text-foreground">
            {categoryLabels || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Language</dt>
          <dd className="font-medium text-foreground">
            {getLanguageName(song.language) || "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm text-muted">Last updated</dt>
          <dd className="font-medium text-foreground">
            {formatDate(song.updatedAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/songs/${song.id}/edit`}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-primary-light sm:flex-none"
        >
          Edit
        </Link>
        <Link
          href={`/admin/songs/${song.id}/edit?preview=1`}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-base font-medium transition-colors hover:bg-section sm:flex-none"
        >
          Preview
        </Link>
      </div>
    </div>
  );
}
