import Link from "next/link";
import { getAllSongs } from "@/lib/supabase-db";

export default async function LibraryPage() {
  const songs = await getAllSongs();
  const sortedSongs = [...songs].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="browse-page-wrapper" style={{ paddingBlock: "40px" }}>
      <div className="browse-container" style={{ maxWidth: "800px", margin: "0 auto", paddingInline: "16px" }}>
        
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "8px" }}>
            Lyrics Library Database
          </h1>
          <p style={{ color: "var(--muted-color)", fontSize: "1.05rem" }}>
            Browse all {sortedSongs.length} Christian lyrics and hymns in alphabetical order.
          </p>
        </div>

        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            overflow: "hidden"
          }}
        >
          {sortedSongs.map((song, index) => {
            const isLast = index === sortedSongs.length - 1;
            return (
              <div
                key={song.slug}
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderBottom: isLast ? "none" : "1px solid var(--border-color)",
                }}
                className="public-list-row"
              >
                <span style={{ fontSize: "1.02rem", fontWeight: 700, color: "var(--accent)", width: "28px", flexShrink: 0, textAlign: "left" }}>
                  {index + 1}.
                </span>
                
                <Link 
                  href={`/songs/${song.slug}`}
                  style={{ 
                    fontSize: "1.06rem", 
                    fontWeight: 700, 
                    color: "#007aff", 
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                  }}
                  className="hover:underline"
                >
                  {song.title}
                </Link>

                {song.artist && (
                  <span style={{ fontSize: "0.85rem", color: "var(--muted-color)", marginLeft: "auto" }}>
                    by {song.artist}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
