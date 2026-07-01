"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { getAllSongs } from "@/lib/supabase-db";
import { type Song } from "@/lib/demo-data";

/* ─── Floating WhatsApp Icon SVG Component ────────── */
function WhatsappIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/* ─── Bottom Navigation Icons ──────────────────────── */
function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}

function BibleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M10 6v10" />
      <path d="M8 9h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const [modalContent, setModalContent] = useState<{ title: string; message: string } | null>(null);
  
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isSearchOpen && allSongs.length === 0) {
      getAllSongs().then((songs) => {
        if (songs) {
          setAllSongs(songs);
        }
      });
    }
  }, [isSearchOpen, allSongs]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)]">
      <Header />
      <main className="flex-1 bg-[var(--bg-page)]">{children}</main>
      <Footer />

      {/* Floating Sticky WhatsApp Button */}
      <a
        href="https://wa.me/919920360570"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Contact on WhatsApp"
      >
        <WhatsappIcon style={{ width: "24px", height: "24px" }} />
      </a>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile bottom tabs">
        <button
          onClick={() => {
            setIsSearchOpen(false);
            router.push("/");
          }}
          className={`nav-tab ${pathname === "/" && !isSearchOpen ? "active" : ""}`}
          type="button"
        >
          <HomeIcon />
          <span>Home</span>
        </button>
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`nav-tab ${isSearchOpen ? "active" : ""}`}
          type="button"
        >
          <SearchIcon />
          <span>Search</span>
        </button>
        <button
          onClick={() => {
            setIsSearchOpen(false);
            router.push("/library");
          }}
          className={`nav-tab ${pathname.startsWith("/library") && !isSearchOpen ? "active" : ""}`}
          type="button"
        >
          <LibraryIcon />
          <span>Library</span>
        </button>
        <button
          onClick={() => {
            setIsSearchOpen(false);
            router.push("/bible");
          }}
          className={`nav-tab ${pathname.startsWith("/bible") && !isSearchOpen ? "active" : ""}`}
          type="button"
        >
          <BibleIcon />
          <span>Bible</span>
        </button>
        <button
          onClick={() => {
            setIsSearchOpen(false);
            router.push("/community");
          }}
          className={`nav-tab ${pathname.startsWith("/community") && !isSearchOpen ? "active" : ""}`}
          type="button"
        >
          <UsersIcon />
          <span>Community</span>
        </button>
      </nav>

      {/* Global Search Overlay Modal */}
      {isSearchOpen && (
        <div
          onClick={() => setIsSearchOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "60px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "500px",
              background: "var(--card-bg)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.18)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Header / Input Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "8px", background: "var(--bg-page)", border: "1.5px solid var(--border-color)", borderRadius: "10px", padding: "8px 12px" }}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search your gospel lyrics here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "0.95rem",
                    color: "var(--foreground-color)",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="browse-reset-btn"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--muted-color)",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Suggestions list */}
            {searchQuery.trim().length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "300px", overflowY: "auto" }}>
                {allSongs
                  .filter((song) => {
                    const q = searchQuery.toLowerCase();
                    const titleMatch = song.title?.toLowerCase().includes(q);
                    const artistMatch = song.artist?.toLowerCase().includes(q);
                    const lyricsMatch = song.lyrics?.toLowerCase().includes(q);
                    return titleMatch || artistMatch || lyricsMatch;
                  })
                  .slice(0, 8)
                  .map((song) => (
                    <div
                      key={song.slug}
                      onClick={() => {
                        router.push(`/songs/${song.slug}`);
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        transition: "background 0.15s ease",
                      }}
                      className="public-list-row hover:bg-[var(--bg-page)]"
                    >
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#007aff" }}>
                        {song.title}
                      </span>
                      {song.artist && (
                        <span style={{ fontSize: "0.8rem", color: "var(--muted-color)" }}>
                          by {song.artist}
                        </span>
                      )}
                    </div>
                  ))}
                {allSongs.filter((song) => {
                  const q = searchQuery.toLowerCase();
                  return song.title?.toLowerCase().includes(q) || song.artist?.toLowerCase().includes(q) || song.lyrics?.toLowerCase().includes(q);
                }).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "var(--muted-color)", fontSize: "0.9rem" }}>
                    No matching songs found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Coming Soon Modals */}
      {modalContent && (
        <div className="custom-modal-overlay" onClick={() => setModalContent(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-icon">✨</div>
            <h3 className="custom-modal-title">{modalContent.title}</h3>
            <p className="custom-modal-message">{modalContent.message}</p>
            <button
              className="custom-modal-close-btn"
              onClick={() => setModalContent(null)}
              type="button"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
