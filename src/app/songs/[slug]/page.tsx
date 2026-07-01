import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryName } from "@/lib/demo-data";
import {
  getAllSongs,
  getSongBySlug,
} from "@/lib/supabase-db";
import SongPageClient from "./SongPageClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://christianlyrics.app";

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

  const title = `${song.title} Lyrics`;
  const description = `Read the full lyrics for "${song.title}"${
    song.artist ? ` by ${song.artist}` : ""
  }. Categorized under ${getCategoryName(song.category)}.`;
  const url = `${BASE_URL}/songs/${song.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Christian Lyrics",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  let song = await getSongBySlug(slug);

  // If the song doesn't exist at build-time (e.g. placeholder route or new song),
  // return a loading skeleton to let the client component mount and fetch from Supabase dynamically
  if (!song) {
    song = {
      slug: slug,
      title: "Loading...",
      lyrics: "Loading song details...",
      category: "worship",
      language: "english",
      isPopular: false,
      addedDate: new Date().toISOString(),
      excerpt: "Loading...",
    };
  }

  const allSongs = await getAllSongs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: song.title,
    ...(song.artist && {
      composer: { "@type": "MusicGroup", name: song.artist },
      lyricist: { "@type": "Person", name: song.artist },
    }),
    lyrics: {
      "@type": "CreativeWork",
      text: song.lyrics,
    },
    genre: getCategoryName(song.category),
    url: `${BASE_URL}/songs/${song.slug}`,
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
