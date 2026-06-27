"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LyricsDisplay from "@/components/LyricsDisplay";
import { getCategoryName, type Song } from "@/lib/demo-data";
import { getSongBySlug, getAllSongs, getRelatedSongs } from "@/lib/supabase-db";

type SongPageClientProps = {
  initialSong: Song;
  initialAllSongs: Song[];
};

export default function SongPageClient({ initialSong, initialAllSongs }: SongPageClientProps) {
  const [song, setSong] = useState<Song>(initialSong);
  const [allSongs, setAllSongs] = useState<Song[]>(initialAllSongs);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    // 1. Fetch the latest song status in real-time to handle edits or deletes
    getSongBySlug(initialSong.slug).then((latestSong) => {
      if (!latestSong) {
        // Song is deleted or no longer published in Supabase
        setIsDeleted(true);
      } else {
        setSong(latestSong);
      }
    });

    // 2. Fetch all songs for related songs real-time update
    getAllSongs().then((latestAllSongs) => {
      if (latestAllSongs && latestAllSongs.length > 0) {
        setAllSongs(latestAllSongs);
      }
    });
  }, [initialSong.slug]);

  const relatedSongs = getRelatedSongs(song, allSongs);

  if (isDeleted) {
    return (
      <div style={{ background: "#F8FBFF", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "480px", background: "#ffffff", padding: "32px", borderRadius: "20px", border: "1.5px solid #C7DDF2", boxShadow: "0 10px 30px rgba(10, 37, 64, 0.03)" }}>
          <span style={{ fontSize: "3.5rem" }} role="img" aria-label="Deleted Warning">⚠️</span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0A2540", marginTop: "16px", marginBottom: "8px" }}>Lyrics Unavailable</h2>
          <p style={{ color: "#3a5a7c", fontSize: "1rem", lineHeight: "1.5", marginBottom: "24px" }}>
            This song has been removed or is no longer published.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--navy)",
              color: "var(--accent)",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "0.95rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "opacity 0.2s ease",
            }}
            className="search-submit-btn"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F8FBFF", minHeight: "100vh" }}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ─── Back to Browse Button ───────────────────── */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1.5px solid #C7DDF2",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#0A2540",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            className="browse-reset-btn"
          >
            <span style={{ fontSize: "1.1rem" }}>←</span> Back to Browse Songs
          </Link>
        </div>

        {/* ─── Lyrics Display ─────────────────────────── */}
        <LyricsDisplay
          title={song.title}
          artist={song.artist}
          category={song.category}
          language={song.language}
          lyrics={song.lyrics}
        />

        {/* ─── Related Songs ──────────────────────────── */}
        {relatedSongs.length > 0 && (
          <section
            style={{
              marginTop: "48px",
              borderTop: "1.5px solid #C7DDF2",
              paddingTop: "32px",
            }}
          >
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#0A2540",
                marginBottom: "20px",
                letterSpacing: "-0.015em",
              }}
            >
              Related Songs
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {relatedSongs.map((related) => (
                <div
                  key={related.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid #D8E8F7",
                    gap: "12px",
                  }}
                >
                  <Link
                    href={`/songs/${related.slug}`}
                    style={{
                      flex: 1,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#0A2540",
                      textDecoration: "none",
                    }}
                    className="browse-song-title-link"
                  >
                    {related.title}
                  </Link>
                  {related.artist && (
                    <span style={{ fontSize: "0.85rem", color: "#3a5a7c" }}>
                      by {related.artist}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
