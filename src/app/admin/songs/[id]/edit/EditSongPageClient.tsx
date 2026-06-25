"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AdminLyricsWorkflow from "@/components/admin/AdminLyricsWorkflow";
import { getAdminSongById } from "@/lib/admin-store";
import type { AdminSong } from "@/lib/admin-types";

function EditSongContent() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<AdminSong | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      setSong(getAdminSongById(id) ?? null);
    }
  }, [id]);

  if (song === undefined) {
    return <p className="text-lg text-muted">Loading...</p>;
  }

  if (song === null) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <h2 className="text-xl font-semibold">Song not found</h2>
        <p className="mt-2 text-lg text-muted">
          This song may have been removed.
        </p>
        <Link
          href="/admin/songs"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-base font-medium text-white"
        >
          Back to Songs
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        Edit Song
      </h1>
      <p className="mt-2 text-lg text-muted">{song.title}</p>
      <div className="mt-6">
        <AdminLyricsWorkflow song={song} />
      </div>
    </>
  );
}

export default function EditSongPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Suspense fallback={<p className="text-lg text-muted">Loading...</p>}>
        <EditSongContent />
      </Suspense>
    </div>
  );
}
