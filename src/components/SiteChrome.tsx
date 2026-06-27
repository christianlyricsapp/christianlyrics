"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

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

  if (isAdmin) {
    return <>{children}</>;
  }

  const isHomeActive = pathname === "/";
  const isBrowseActive = pathname.startsWith("/songs");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">{children}</main>
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
          onClick={() => router.push("/")}
          className={`nav-tab ${isHomeActive && !isBrowseActive ? "active" : ""}`}
          type="button"
        >
          <HomeIcon />
          <span>Home</span>
        </button>
        <button
          onClick={() => router.push("/?search=")}
          className={`nav-tab ${isBrowseActive ? "active" : ""}`}
          type="button"
        >
          <SearchIcon />
          <span>Browse</span>
        </button>
        <button
          onClick={() => setModalContent({
            title: "Worship Library",
            message: "Your personal library, custom bookmarks, and user worship playlists are coming soon in our next update!"
          })}
          className="nav-tab"
          type="button"
        >
          <LibraryIcon />
          <span>Library</span>
        </button>
        <button
          onClick={() => setModalContent({
            title: "Holy Bible",
            message: "Daily devotionals, cross-referenced scripture reading plans, and verse-of-the-day are coming soon!"
          })}
          className="nav-tab"
          type="button"
        >
          <BibleIcon />
          <span>Bible</span>
        </button>
        <a
          href="https://wa.me/919920360570"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-tab"
        >
          <UsersIcon />
          <span>Community</span>
        </a>
      </nav>

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
