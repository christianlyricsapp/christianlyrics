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

function formatFullPublishedDate(dateStr: string): string {
  const date = new Date(dateStr);
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes}${ampm}`;
  
  const day = date.getDate();
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";
  const dayStr = `${day}${suffix}`;
  
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  
  return `${timeStr} ${dayStr} ${monthName} ${year}`;
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
        <div className="flex flex-col items-end gap-1.5 text-right">
          <ReviewStatusBadge status={song.status} />
          {song.status === "published" && (
            <span className="text-xs font-semibold text-muted">
              Published {formatFullPublishedDate(song.updatedAt)}
            </span>
          )}
        </div>
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
          href={`/admin/songs/edit?id=${song.id}`}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-primary-light sm:flex-none"
        >
          Edit
        </Link>
        <Link
          href={`/admin/songs/edit?id=${song.id}&preview=1`}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-base font-medium transition-colors hover:bg-section sm:flex-none"
        >
          Preview
        </Link>
      </div>
    </div>
  );
}
