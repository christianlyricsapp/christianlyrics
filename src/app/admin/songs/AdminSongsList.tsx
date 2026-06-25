"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import AdminSongCard from "@/components/admin/AdminSongCard";
import { getAdminSongs } from "@/lib/admin-store";
import type { AdminSong } from "@/lib/admin-types";

type TabType = "all" | "published" | "draft" | "needs-review";

export default function AdminSongsList() {
  const [songs, setSongs] = useState<AdminSong[]>([]);
  const [tab, setTab] = useState<TabType>("all");

  useEffect(() => {
    getAdminSongs().then(setSongs);
  }, []);

  const filteredSongs = useMemo(() => {
    if (tab === "all") return songs;
    return songs.filter((s) => s.status === tab);
  }, [songs, tab]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Songs
          </h1>
          <p className="mt-2 text-lg text-muted">
            {songs.length} song{songs.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <Link
          href="/admin/songs/new"
          className="rounded-xl bg-primary px-5 py-3 text-base font-medium text-white transition-colors hover:bg-primary-light"
        >
          Add New
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap border-b border-border gap-1">
        {(["all", "published", "draft", "needs-review"] as const).map((t) => {
          const count = songs.filter((s) => t === "all" || s.status === t).length;
          const label =
            t === "all"
              ? "All Songs"
              : t === "published"
                ? "Published"
                : t === "draft"
                  ? "Drafts"
                  : "Review Queue ⏳";
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-2.5 text-base font-medium transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filteredSongs.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {filteredSongs.map((song) => (
            <AdminSongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎵
          </p>
          <h2 className="mt-4 text-xl font-semibold">No songs found</h2>
          <p className="mt-2 text-lg text-muted">
            {tab === "all"
              ? "Add your first song by pasting lyrics from your phone."
              : "No songs match this status."}
          </p>
          {tab === "all" && (
            <Link
              href="/admin/songs/new"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-light"
            >
              Add New Lyrics
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
