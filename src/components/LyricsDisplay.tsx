"use client";

import { useEffect, useState } from "react";
import { getCategoryName, getLanguageName } from "@/lib/demo-data";
import { toPng } from "html-to-image";

type LyricsDisplayProps = {
  title: string;
  artist?: string;
  category: string;
  language: string;
  lyrics: string;
};

/* ── Lord / God name highlighting ───────────────────────────── */
const LORD_NAMES = [
  "Jesus", "Yeshu", "Yeshua", "Yahweh", "Jehovah",
  "God", "Lord", "Christ", "Krist", "Krista",
  "Prabhu", "Ishwar", "Khuda", "Masih", "Masiha",
  "Holy Spirit", "Pavitra Atma", "Pavitra Aatma",
];

// Build a regex that matches any of the names, case-insensitive, whole-word
const LORD_REGEX = new RegExp(
  `(${LORD_NAMES.map((n) => n.replace(/ /g, "\\s+")).join("|")})`,
  "gi"
);

function highlightLordNames(line: string): React.ReactNode {
  if (!LORD_REGEX.test(line)) return line;
  LORD_REGEX.lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LORD_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    parts.push(
      <mark key={match.index} className="lord-highlight">
        {match[0]}
      </mark>
    );
    lastIndex = LORD_REGEX.lastIndex;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return <>{parts}</>;
}

export default function LyricsDisplay({
  title,
  artist,
  category,
  language,
  lyrics,
}: LyricsDisplayProps) {
  const [fontSize, setFontSize] = useState(18);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      showToast("Lyrics copied");
    } catch {
      showToast("Failed to copy lyrics");
    }
  }

  function handleScreenshot() {
    const node = document.getElementById("lyrics-capture-area");
    if (!node) {
      showToast("Could not find lyrics area to capture.");
      return;
    }

    showToast("Generating screenshot...");
    
    // Render only the lyrics capture area into image at high resolution (3x)
    toPng(node, {
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      style: {
        padding: "32px",
        margin: "0",
        background: "#ffffff",
        borderRadius: "0px",
        width: "100%",
        maxWidth: "600px",
        display: "block",
      }
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        link.download = `${slug}-lyrics.png`;
        link.href = dataUrl;
        link.click();
        showToast("Screenshot downloaded!");
      })
      .catch((err) => {
        console.error("Screenshot failed", err);
        showToast("Screenshot failed. Please try again.");
      });
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
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied");
      } catch {
        showToast("Failed to copy link");
      }
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* ─── Premium Action Row ─────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "28px",
          alignItems: "center",
        }}
      >
        {/* Copy Lyrics */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn hover:translate-y-[-1px]"
        >
          📋 Copy Lyrics
        </button>

        {/* Screenshot */}
        <button
          type="button"
          onClick={handleScreenshot}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn hover:translate-y-[-1px]"
        >
          📸 Screenshot
        </button>

        {/* Transpose */}
        <button
          type="button"
          onClick={() => showToast("Transpose feature coming soon.")}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn hover:translate-y-[-1px]"
        >
          🎼 Transpose
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn hover:translate-y-[-1px]"
        >
          🔗 Share
        </button>

        {/* Presenter */}
        <button
          type="button"
          onClick={() => setIsPresenterMode(true)}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn hover:translate-y-[-1px]"
        >
          📺 Presenter
        </button>

        {/* Chords */}
        <button
          type="button"
          onClick={() => showToast("Chords feature coming soon.")}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="browse-reset-btn hover:translate-y-[-1px]"
        >
          🎸 Chords
        </button>
      </div>

      {/* ─── Capture Area wrapping metadata + lyrics ─── */}
      <div 
        id="lyrics-capture-area" 
        style={{ 
          background: "#ffffff", 
          border: "1.5px solid #C7DDF2", 
          borderRadius: "16px", 
          padding: "24px",
          marginTop: "16px",
          boxShadow: "0 4px 20px rgba(10, 37, 64, 0.02)"
        }}
      >
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

        {/* ─── Lyrics Text Block ─────────────────────────── */}
        <div
          className="lyrics-text-container"
          style={{
            fontSize: `${fontSize}px`,
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
                marginTop: line.startsWith("[") ? "24px" : "0px",
                height: line === "" ? "16px" : "auto",
                letterSpacing: line.startsWith("[") ? "0.02em" : "normal",
              }}
            >
              {line.startsWith("[") ? line : highlightLordNames(line)}
            </p>
          ))}
        </div>
      </div>

      {/* ─── Font Size Controls ─── */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          alignItems: "center", 
          gap: "8px", 
          marginTop: "16px",
          marginBottom: "16px"
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--muted-color)", fontWeight: 600 }}>Font Size:</span>
        <button
          type="button"
          onClick={() => setFontSize((s) => Math.max(s - 2, 14))}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          className="browse-reset-btn"
        >
          A−
        </button>
        <button
          type="button"
          onClick={() => setFontSize((s) => Math.min(s + 2, 28))}
          style={{
            background: "#ffffff",
            border: "1.5px solid #C7DDF2",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#0A2540",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          className="browse-reset-btn"
        >
          A+
        </button>
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

      {/* Presenter Fullscreen Overlay */}
      {isPresenterMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#051224",
            color: "#ffffff",
            zIndex: 10000,
            overflowY: "auto",
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Close button and title at the top */}
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "16px",
              marginBottom: "32px",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>{title}</span>
              {artist && <span style={{ fontSize: "0.95rem", color: "var(--accent)", marginLeft: "12px" }}>by {artist}</span>}
            </div>
            <button
              type="button"
              onClick={() => setIsPresenterMode(false)}
              className="browse-reset-btn"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✕ Exit Presenter
            </button>
          </div>

          {/* Centered lyrics view */}
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              textAlign: "center",
              fontSize: "2rem",
              lineHeight: "1.8",
              color: "#ffffff",
              paddingBottom: "60px",
            }}
          >
            {lyrics.split("\n").map((line, index) => (
              <p
                key={index}
                style={{
                  margin: 0,
                  fontWeight: line.startsWith("[") ? 700 : 400,
                  color: line.startsWith("[") ? "var(--accent)" : "#ffffff",
                  opacity: line.startsWith("[") ? 0.75 : 1,
                  marginTop: line.startsWith("[") ? "32px" : line === "" ? "0px" : "0px",
                  height: line === "" ? "24px" : "auto",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0A2540",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "30px",
            fontSize: "0.9rem",
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
