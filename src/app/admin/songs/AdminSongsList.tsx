"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminSongCard from "@/components/admin/AdminSongCard";
import { getAdminSongs } from "@/lib/admin-store";
import type { AdminSong } from "@/lib/admin-types";

export default function AdminSongsList() {
  const [songs, setSongs] = useState<AdminSong[]>([]);

  useEffect(() => {
    setSongs(getAdminSongs());
  }, []);

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

      {songs.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {songs.map((song) => (
            <AdminSongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎵
          </p>
          <h2 className="mt-4 text-xl font-semibold">No songs yet</h2>
          <p className="mt-2 text-lg text-muted">
            Add your first song by pasting lyrics from your phone.
          </p>
          <Link
            href="/admin/songs/new"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-light"
          >
            Add New Lyrics
          </Link>
        </div>
      )}
    </div>
  );
}
