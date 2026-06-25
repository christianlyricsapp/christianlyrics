import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseSongs from "@/components/BrowseSongs";
import { getAllSongs } from "@/lib/supabase-db";

export const metadata: Metadata = {
  title: "Browse Songs - Christian Lyrics",
  description:
    "Search and browse Christian worship, praise, communion, and festival song lyrics by alphabet, language, category, and artist.",
};

export default async function SongsPage() {
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
