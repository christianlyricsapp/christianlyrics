import { supabase } from "./supabase";
import {
  type AdminSong,
  type AdminSongFormData,
  type AdminStats,
  type RightsStatus,
  type SongStatus,
  generateSlug,
} from "./admin-types";

const AUTH_KEY = "christian-lyrics-admin-auth";
const ROLE_KEY = "christian-lyrics-admin-role";
const DEMO_EMAIL = "admin@christianlyrics.app";
const DEMO_PASSWORD = "admin123";
const VOLUNTEER_EMAIL = "volunteer@christianlyrics.app";
const VOLUNTEER_PASSWORD = "volunteer123";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function mapDbSongToAdminSong(dbSong: any): AdminSong {
  return {
    id: dbSong.id,
    title: dbSong.title,
    slug: dbSong.slug,
    categories: dbSong.category ? [dbSong.category] : [],
    language: dbSong.language,
    lyrics: dbSong.lyrics,
    rawLyrics: dbSong.raw_lyrics || dbSong.lyrics,
    seoTitle: dbSong.seo_title || "",
    seoDescription: dbSong.seo_description || "",
    sourceUrl: dbSong.source_url || "",
    rightsStatus: (dbSong.rights_status || "unknown") as RightsStatus,
    status: (dbSong.status || "draft") as SongStatus,
    createdAt: dbSong.created_at || new Date().toISOString(),
    updatedAt: dbSong.updated_at || new Date().toISOString(),
  };
}

function generateExcerpt(lyrics: string): string {
  const clean = lyrics
    .replace(/\[[^\]]+\]/g, "") // remove [Verse 1], [Chorus] etc.
    .replace(/\s+/g, " ")
    .trim();
  return clean.slice(0, 150) + (clean.length > 150 ? "..." : "");
}

export async function getAdminSongs(): Promise<AdminSong[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin songs:", error);
    return [];
  }
  return (data || []).map(mapDbSongToAdminSong);
}

export async function getAdminSongById(id: string): Promise<AdminSong | null> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching song ${id}:`, error);
    return null;
  }
  return data ? mapDbSongToAdminSong(data) : null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase
    .from("songs")
    .select("status");

  if (error) {
    console.error("Error fetching admin stats:", error);
    return { total: 0, published: 0, draft: 0, needsReview: 0 };
  }

  const songs = data || [];
  return {
    total: songs.length,
    published: songs.filter((s) => s.status === "published").length,
    draft: songs.filter((s) => s.status === "draft").length,
    needsReview: songs.filter((s) => s.status === "needs-review").length,
  };
}

export async function createAdminSong(data: AdminSongFormData): Promise<AdminSong | null> {
  const now = new Date().toISOString();
  const excerpt = generateExcerpt(data.lyrics);
  const firstCategory = data.categories[0] || "worship";

  const dbData = {
    title: data.title,
    slug: data.slug || generateSlug(data.title),
    category: firstCategory,
    language: data.language,
    lyrics: data.lyrics,
    raw_lyrics: data.rawLyrics || data.lyrics,
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
    source_url: data.sourceUrl,
    rights_status: data.rightsStatus,
    status: data.status,
    excerpt,
    created_at: now,
    updated_at: now,
  };

  const { data: insertedData, error } = await supabase
    .from("songs")
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error("Error creating song:", error);
    return null;
  }

  return mapDbSongToAdminSong(insertedData);
}

export async function updateAdminSong(
  id: string,
  data: AdminSongFormData
): Promise<AdminSong | null> {
  const now = new Date().toISOString();
  const excerpt = generateExcerpt(data.lyrics);
  const firstCategory = data.categories[0] || "worship";

  const dbData = {
    title: data.title,
    slug: data.slug || generateSlug(data.title),
    category: firstCategory,
    language: data.language,
    lyrics: data.lyrics,
    raw_lyrics: data.rawLyrics || data.lyrics,
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
    source_url: data.sourceUrl,
    rights_status: data.rightsStatus,
    status: data.status,
    excerpt,
    updated_at: now,
  };

  const { data: updatedData, error } = await supabase
    .from("songs")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating song ${id}:`, error);
    return null;
  }

  return mapDbSongToAdminSong(updatedData);
}

export async function getAdminRole(): Promise<"admin" | "volunteer"> {
  if (!isBrowser()) return "volunteer";
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      return session.user.email === DEMO_EMAIL ? "admin" : "volunteer";
    }
  } catch {}
  
  const role = localStorage.getItem(ROLE_KEY);
  return role === "admin" ? "admin" : "volunteer";
}

export async function isAdminLoggedIn(): Promise<boolean> {
  if (!isBrowser()) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;
  } catch {}
  return localStorage.getItem(AUTH_KEY) === "true";
}

export async function adminLogin(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session) {
      if (isBrowser()) {
        const role = email === DEMO_EMAIL ? "admin" : "volunteer";
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(ROLE_KEY, role);
      }
      return true;
    }
  } catch (e) {
    console.error("Supabase Auth error:", e);
  }

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    if (isBrowser()) {
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(ROLE_KEY, "admin");
    }
    return true;
  }

  if (email === VOLUNTEER_EMAIL && password === VOLUNTEER_PASSWORD) {
    if (isBrowser()) {
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(ROLE_KEY, "volunteer");
    }
    return true;
  }

  return false;
}

export async function adminLogout(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {}
  if (isBrowser()) {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
}

export async function triggerRebuild(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("rebuilds")
      .insert([{}]);
    if (error) {
      console.error("Error inserting rebuild trigger:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to trigger rebuild:", err);
    return false;
  }
}
