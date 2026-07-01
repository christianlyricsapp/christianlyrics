export default function BiblePage() {
  return (
    <div className="browse-page-wrapper" style={{ paddingBlock: "48px" }}>
      <div className="browse-container" style={{ maxWidth: "800px", margin: "0 auto", paddingInline: "16px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "3rem" }}>📖</span>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--foreground-color)", marginTop: "16px", marginBottom: "8px" }}>
            Holy Bible
          </h1>
          <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.1rem" }}>
            Bible reading feature is coming soon.
            </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Daily Verse Section */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "12px" }}>
              ✨ Verse of the Day
            </h3>
            <p style={{ fontStyle: "italic", fontSize: "1.05rem", color: "var(--foreground-color)", lineHeight: 1.6, marginBottom: "8px" }}>
              &ldquo;Thy word is a lamp unto my feet, and a light unto my path.&rdquo;
            </p>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
              Psalm 119:105
            </p>
          </div>

          {/* Old Testament Placeholders */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "8px" }}>
              📜 Old Testament
            </h3>
            <p style={{ color: "var(--muted-color)", fontSize: "0.95rem" }}>
              Genesis, Exodus, Psalms, Proverbs, Isaiah, and all 39 books of the Old Covenant scripture studies are coming in the next update.
            </p>
          </div>

          {/* New Testament Placeholders */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground-color)", marginBottom: "8px" }}>
              ✝️ New Testament
            </h3>
            <p style={{ color: "var(--muted-color)", fontSize: "0.95rem" }}>
              The Gospels, Acts, Epistles of Paul, and Revelation studies are currently being indexed.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
