import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LyricsDisplay from "@/components/LyricsDisplay";
import {
  getRelatedSongs,
  getSongBySlug,
  songs,
  getCategoryName,
} from "@/lib/demo-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return songs.map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song = getSongBySlug(slug);

  if (!song) {
    return { title: "Song Not Found" };
  }

  return {
    title: `${song.title} Lyrics`,
    description: `Read the full lyrics for "${song.title}" ${
      song.artist ? `by ${song.artist}` : ""
    }. Categorized under ${getCategoryName(song.category)}.`,
  };
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  const song = getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  const relatedSongs = getRelatedSongs(song);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    "name": song.title,
    "composer": {
      "@type": "MusicGroup",
      "name": song.artist || "Unknown Artist"
    },
    "lyricist": {
      "@type": "Person",
      "name": song.artist || "Unknown Artist"
    },
    "lyrics": {
      "@type": "CreativeWork",
      "text": song.lyrics
    },
    "genre": getCategoryName(song.category)
  };

  return (
    <div style={{ background: "#F8FBFF", minHeight: "100vh" }}>
      {/* JSON-LD Schema Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
