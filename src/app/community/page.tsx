export default function CommunityPage() {
  return (
    <div className="browse-page-wrapper" style={{ paddingBlock: "64px" }}>
      <div className="browse-container" style={{ maxWidth: "600px", margin: "0 auto", paddingInline: "16px", textAlign: "center" }}>
        
        <span style={{ fontSize: "3.5rem" }}>🤝</span>
        
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--foreground-color)", marginTop: "24px", marginBottom: "12px" }}>
          Community Fellowship
        </h1>
        
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", padding: "32px 24px", marginTop: "24px" }}>
          <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "12px" }}>
            Community features are coming soon.
          </p>
          <p style={{ color: "var(--muted-color)", fontSize: "1rem", lineHeight: 1.6 }}>
            Soon you’ll be able to connect, share, and grow together with believers around the world, creating shared worship setlists and lyrics boards.
          </p>
        </div>

      </div>
    </div>
  );
}
