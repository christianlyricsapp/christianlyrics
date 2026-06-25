"use client";

import { useEffect, useState } from "react";
import { getCategoryName, getLanguageName } from "@/lib/demo-data";

type LyricsDisplayProps = {
  title: string;
  artist?: string;
  category: string;
  language: string;
  lyrics: string;
};

export default function LyricsDisplay({
  title,
  artist,
  category,
  language,
  lyrics,
}: LyricsDisplayProps) {
  const [fontSize, setFontSize] = useState(18);
  const [copied, setCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 300);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    const shareData = {
      title,
      text: `Read "${title}" lyrics on Christian Lyrics`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Share cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* ─── Apple-style Metadata Header ───────────────── */}
      <div
        style={{
          borderBottom: "1.5px solid #C7DDF2",
          paddingBottom: "20px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#0A2540",
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {title}
        </h1>
        
        {artist && (
          <p
            style={{
              fontSize: "1.15rem",
              fontWeight: 500,
              color: "#3a5a7c",
              margin: "6px 0 0",
            }}
          >
            by {artist}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "14px",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#0A2540",
              background: "#EEF6FF",
              border: "1px solid #C7DDF2",
              padding: "4px 10px",
              borderRadius: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {getCategoryName(category)}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#0A2540",
              background: "#EEF6FF",
              border: "1px solid #C7DDF2",
              padding: "4px 10px",
              borderRadius: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {getLanguageName(language)}
          </span>
        </div>
      </div>

      {/* ─── Apple-style Control Panel ─────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "32px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn"
        >
          {copied ? "✓ Copied!" : "📋 Copy Lyrics"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn"
        >
          🔗 Share
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(s - 2, 14))}
            aria-label="Decrease font size"
            style={{
              background: "#ffffff",
              border: "1.5px solid #C7DDF2",
              borderRadius: "10px",
              width: "36px",
              height: "36px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#0A2540",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="browse-reset-btn"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(s + 2, 28))}
            aria-label="Increase font size"
            style={{
              background: "#ffffff",
              border: "1.5px solid #C7DDF2",
              borderRadius: "10px",
              width: "36px",
              height: "36px",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#0A2540",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="browse-reset-btn"
          >
            A+
          </button>
        </div>
      </div>

      {/* ─── Lyrics Text Block ─────────────────────────── */}
      <div
        className="glass-strong"
        style={{
          background: "#ffffff",
          border: "1px solid #D8E8F7",
          boxShadow: "0 10px 30px rgba(8, 43, 102, 0.04)",
          borderRadius: "18px",
          padding: "36px 28px",
          fontSize: `${fontSize}px`,
          lineHeight: 1.85,
          color: "#0A2540",
          marginBottom: "40px",
          maxWidth: "720px", /* Narrow width for reading comfort */
          marginInline: "auto",
        }}
      >
        {lyrics.split("\n").map((line, index) => (
          <p
            key={index}
            style={{
              margin: 0,
              fontWeight: line.startsWith("[") ? 700 : 400,
              color: line.startsWith("[") ? "#082B66" : "#0A2540",
              opacity: line.startsWith("[") ? 0.75 : 1,
              marginTop: line.startsWith("[") ? "24px" : line === "" ? "0px" : "0px",
              height: line === "" ? "16px" : "auto",
              letterSpacing: line.startsWith("[") ? "0.02em" : "normal",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* ─── Back to Top Button ────────────────────────── */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "90px",
            right: "28px",
            zIndex: 90,
            background: "#0A2540",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(8, 43, 102, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease, background-color 0.2s ease",
          }}
          className="back-to-top-btn"
          aria-label="Back to top of lyrics"
        >
          ↑
        </button>
      )}
    </div>
  );
}
