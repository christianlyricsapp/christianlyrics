import Link from "next/link";
import { getAllSongs } from "@/lib/supabase-db";
import { languages } from "@/lib/demo-data";

const CATEGORIES = ["praise", "worship", "communion", "christmas", "new_year", "easter", "good_friday", "revival", "youth", "funeral"];
const CATEGORY_NAMES: Record<string, string> = {
  praise: "Praise",
  worship: "Worship",
  communion: "Communion",
  christmas: "Christmas",
  new_year: "New Year",
  easter: "Easter",
  good_friday: "Good Friday",
  revival: "Revival",
  youth: "Youth",
  funeral: "Funeral"
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default async function BrowsePage() {
  const songs = await getAllSongs();
  
  // Extract unique artists
  const artists = Array.from(
    new Set(songs.map((s) => s.artist).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="browse-page-wrapper" style={{ paddingBlock: "40px" }}>
      <div className="browse-container" style={{ maxWidth: "800px", margin: "0 auto", paddingInline: "16px" }}>
        
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "8px" }}>
            Browse Songs
          </h1>
          <p style={{ color: "var(--muted-color)", fontSize: "1.05rem" }}>
            Find your favorite worship lyrics by categories, languages, artists, or index.
          </p>
        </div>

        {/* 1. Browse by Category */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "16px" }}>
            📁 Categories
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "rgba(197, 157, 79, 0.08)",
                  border: "1px solid var(--border-color)",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  textTransform: "capitalize",
                }}
                className="hover:scale-105 transition-all"
              >
                {CATEGORY_NAMES[cat] || cat}
              </Link>
            ))}
          </div>
        </div>

        {/* 2. Browse by Language */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "16px" }}>
            🌐 Languages
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {languages.slice(0, 8).map((lang) => (
              <Link
                key={lang.slug}
                href={`/language/${lang.slug}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#007aff",
                  background: "rgba(0, 122, 255, 0.06)",
                  border: "1px solid var(--border-color)",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  textDecoration: "none",
                }}
                className="hover:scale-105 transition-all"
              >
                {lang.name}
              </Link>
            ))}
            <Link
              href="/languages"
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#007aff",
                padding: "8px 16px",
                textDecoration: "underline",
              }}
            >
              View all languages →
            </Link>
          </div>
        </div>

        {/* 3. Browse by A-Z */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "16px" }}>
            🔤 Alphabetical Index
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {ALPHABET.map((letter) => (
              <Link
                key={letter}
                href={`/?letter=${letter}`}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--foreground-color)",
                  textDecoration: "none",
                }}
                className="hover:bg-[var(--bg-page)]"
              >
                {letter}
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Browse by Artist */}
        {artists.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "16px" }}>
              🎤 Artists & Musicians
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {artists.map((artist) => (
                <Link
                  key={artist}
                  href={`/?artist=${encodeURIComponent(artist)}`}
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--foreground-color)",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    textDecoration: "none",
                  }}
                  className="hover:bg-[var(--bg-page)]"
                >
                  {artist}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
