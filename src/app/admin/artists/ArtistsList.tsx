"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUniqueArtists, type ArtistInfo } from "@/lib/admin-store";

export default function ArtistsList() {
  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUniqueArtists().then((data) => {
      setArtists(data);
      setLoading(false);
    });
  }, []);

  const filtered = search.trim()
    ? artists.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : artists;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Artists & Musicians
          </h1>
          <p className="mt-2 text-base text-muted">
            {artists.length} artist{artists.length !== 1 ? "s" : ""} found across your songs
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.25)] p-4 text-sm text-muted">
        💡 Artists are auto-detected from the songs in your library. To add a new artist, add a song with that artist name. You can also set the artist field when editing any song.
      </div>

      {/* Search */}
      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists..."
          className="form-input-premium w-full rounded-xl px-4 py-3 text-base"
        />
      </div>

      {loading ? (
        <div className="mt-8 text-center text-muted">Loading artists...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-muted">
            {search.trim() ? "No artists match your search." : "No artists found. Add songs with artist names to see them here."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artist) => (
            <Link
              key={artist.name}
              href={`/songs?artist=${encodeURIComponent(artist.name)}`}
              className="rounded-2xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-5 shadow-sm hover:border-[var(--accent)] hover:bg-[#0A2540] transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎤</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white group-hover:text-[var(--accent)] truncate transition-colors">
                    {artist.name}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {artist.songCount} song{artist.songCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-muted group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
