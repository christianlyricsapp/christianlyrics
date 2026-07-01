import Link from "next/link";
import { languages } from "@/lib/demo-data";

export default function LanguagesPage() {
  return (
    <div className="browse-page-wrapper" style={{ paddingBlock: "48px" }}>
      <div className="browse-container" style={{ maxWidth: "800px", margin: "0 auto", paddingInline: "16px" }}>
        
        {/* Back button */}
        <Link 
          href="/" 
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--accent)",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: 700,
            marginBottom: "28px",
            transition: "all 0.15s ease",
          }}
          className="hover:translate-x-[-2px] browse-reset-btn"
        >
          ← Back to Library
        </Link>

        {/* Hero title */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "8px" }}>
            Browse by Language
          </h1>
          <p style={{ color: "var(--muted-color)", fontSize: "1.05rem" }}>
            Select a language below to view and filter Christian worship lyrics, praise songs, and hymns.
          </p>
        </div>

        {/* List of languages */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
            gap: "14px" 
          }}
        >
          {languages.map((lang) => (
            <Link
              key={lang.slug}
              href={`/language/${lang.slug}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 22px",
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              className="public-song-card hover:translate-y-[-2px] hover:shadow-md"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground-color)" }}>
                  {lang.name}
                </span>
                {lang.nativeName && lang.nativeName !== lang.name && (
                  <span style={{ fontSize: "0.82rem", color: "var(--muted-color)" }}>
                    {lang.nativeName}
                  </span>
                )}
              </div>
              <span style={{ color: "#007aff", fontWeight: "bold", fontSize: "1.1rem" }}>
                →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
