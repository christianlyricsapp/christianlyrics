import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryName } from "@/lib/demo-data";
import {
  getAllSongs,
  getSongBySlug,
} from "@/lib/supabase-db";
import SongPageClient from "./SongPageClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const songs = await getAllSongs();
  if (songs.length === 0) {
    return [{ slug: "placeholder" }];
  }
  return songs.map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    return { title: "Song Not Found" };
  }

  return {
    title: `${song.title} Lyrics`,
    description: `Read the full lyrics for "${song.title}" ${
      song.artist ? `by ${song.artist}` : ""
    }. Categorized under ${getCategoryName(song.category)}.`,
  };
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  const allSongs = await getAllSongs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    "name": song.title,
    "composer": {
      "@type": "MusicGroup",
      "name": song.artist || "Unknown Artist"
    },
    "lyricist": {
      "@type": "Person",
      "name": song.artist || "Unknown Artist"
    },
    "lyrics": {
      "@type": "CreativeWork",
      "text": song.lyrics
    },
    "genre": getCategoryName(song.category)
  };

  return (
    <>
      {/* JSON-LD Schema Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SongPageClient initialSong={song} initialAllSongs={allSongs} />
    </>
  );
}
