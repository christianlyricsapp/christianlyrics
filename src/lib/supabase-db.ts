import { supabase } from "./supabase";
import { songs as demoSongs, type Song } from "./demo-data";

const isPlaceholder =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");

export function mapDbSongToSong(dbSong: any): Song {
  return {
    slug: dbSong.slug,
    title: dbSong.title,
    category: dbSong.category,
    language: dbSong.language,
    artist: dbSong.artist || undefined,
    excerpt: dbSong.excerpt,
    lyrics: dbSong.lyrics,
    addedDate: dbSong.created_at || new Date().toISOString(),
    isPopular: dbSong.is_popular || false,
  };
}

// Fetch all songs from Supabase (published only)
export async function getAllSongs(): Promise<Song[]> {
  if (isPlaceholder) {
    console.log("Using local demo-data songs fallback.");
    return demoSongs;
  }

  try {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("status", "published")
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching songs from Supabase:", error);
      return demoSongs;
    }

    return (data || []).map(mapDbSongToSong);
  } catch (err) {
    console.error("Unexpected error fetching songs:", err);
    return demoSongs;
  }
}

// Fetch single song by slug from Supabase (published only)
export async function getSongBySlug(slug: string): Promise<Song | null> {
  if (isPlaceholder) {
    return demoSongs.find((s) => s.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error(`Error fetching song ${slug} from Supabase:`, error);
      return demoSongs.find((s) => s.slug === slug) || null;
    }

    return data ? mapDbSongToSong(data) : null;
  } catch (err) {
    console.error("Unexpected error fetching song:", err);
    return demoSongs.find((s) => s.slug === slug) || null;
  }
}

// Get related songs based on category and language
export function getRelatedSongs(song: Song, allSongs: Song[]): Song[] {
  return allSongs
    .filter(
      (s) =>
        s.slug !== song.slug &&
        (s.category === song.category || s.language === song.language)
    )
    .slice(0, 3);
}
