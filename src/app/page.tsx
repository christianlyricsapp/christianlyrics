import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseSongs from "@/components/BrowseSongs";
import { getAllSongs } from "@/lib/supabase-db";

export const metadata: Metadata = {
  title: "Christian Lyrics - Browse Songs",
  description:
    "Find and explore Christian praise, worship, and communion song lyrics easily. Search and browse songs alphabetically.",
};

export default async function HomePage() {
  const initialSongs = await getAllSongs();

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "#8fa8c4" }}>Loading…</p>
        </div>
      }
    >
      <BrowseSongs initialSongs={initialSongs} />
    </Suspense>
  );
}
