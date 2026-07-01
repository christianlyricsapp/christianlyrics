import { supabase } from "./supabase";
import {
  type AdminSong,
  type AdminSongFormData,
  type AdminStats,
  type RightsStatus,
  type SongStatus,
  type Volunteer,
  type VolunteerStats,
  generateSlug,
} from "./admin-types";

const AUTH_KEY = "christian-lyrics-admin-auth";
const ROLE_KEY = "christian-lyrics-admin-role";
const VOLUNTEER_ID_KEY = "christian-lyrics-volunteer-id";
const VOLUNTEER_NAME_KEY = "christian-lyrics-volunteer-name";
const SESSION_ID_KEY = "christian-lyrics-volunteer-session-id";

// Shadow localStorage with sessionStorage to enforce temporary login lifetimes (clears on tab close)
const localStorage = typeof window !== "undefined" ? window.sessionStorage : null as unknown as Storage;

const DEMO_EMAIL = "admin@christianlyrics.app";
const DEMO_PASSWORD = "admin123";
const VOLUNTEER_EMAIL = "volunteer@christianlyrics.app";
const VOLUNTEER_PASSWORD = "volunteer123";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isValidUuid(id: string | null): boolean {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

function mapDbSongToAdminSong(dbSong: any): AdminSong {
  return {
    id: dbSong.id,
    title: dbSong.title,
    slug: dbSong.slug,
    artist: dbSong.artist || "",
    categories: dbSong.category
      ? dbSong.category.split(",").map((c: string) => c.trim())
      : [],
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
    deletedAt: dbSong.deleted_at || null,
    createdByName: dbSong.created_by_name || null,
    lastModifiedByName: dbSong.last_modified_by_name || null,
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
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin songs:", error);
    return [];
  }
  return (data || []).map(mapDbSongToAdminSong);
}

export async function getTrashedSongs(): Promise<AdminSong[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    console.error("Error fetching trashed songs:", error);
    return [];
  }
  return (data || []).map(mapDbSongToAdminSong);
}

export async function softDeleteSongs(ids: string[]): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("songs")
    .update({ deleted_at: now })
    .in("id", ids);

  if (error) {
    console.error("Error soft-deleting songs:", error);
    return false;
  }
  return true;
}

export async function restoreSongs(ids: string[]): Promise<boolean> {
  const { error } = await supabase
    .from("songs")
    .update({ deleted_at: null })
    .in("id", ids);

  if (error) {
    console.error("Error restoring songs:", error);
    return false;
  }
  return true;
}

export async function permanentDeleteSongs(ids: string[]): Promise<boolean> {
  const { error } = await supabase
    .from("songs")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error permanently deleting songs:", error);
    return false;
  }
  return true;
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
    .select("id, title, status, category, artist, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin stats:", error);
    return { total: 0, published: 0, draft: 0, needsReview: 0, totalCategories: 0, totalArtists: 0, recentSongs: [] };
  }

  const songs = data || [];

  // Count unique categories across all songs
  const categorySet = new Set<string>();
  songs.forEach((s) => {
    if (s.category) {
      s.category.split(",").map((c: string) => c.trim()).filter(Boolean).forEach((c: string) => categorySet.add(c));
    }
  });

  // Count unique artists
  const artistSet = new Set<string>();
  songs.forEach((s) => {
    if (s.artist && s.artist.trim()) {
      artistSet.add(s.artist.trim().toLowerCase());
    }
  });

  // Recent 5 songs
  const recentSongs = songs.slice(0, 5).map((s) => ({
    id: s.id,
    title: s.title,
    status: (s.status || "draft") as import("./admin-types").SongStatus,
    updatedAt: s.updated_at || new Date().toISOString(),
  }));

  return {
    total: songs.length,
    published: songs.filter((s) => s.status === "published").length,
    draft: songs.filter((s) => s.status === "draft").length,
    needsReview: songs.filter((s) => s.status === "needs-review").length,
    totalCategories: categorySet.size,
    totalArtists: artistSet.size,
    recentSongs,
  };
}

export type ArtistInfo = {
  name: string;
  songCount: number;
};

export async function getUniqueArtists(): Promise<ArtistInfo[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("artist")
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching artists:", error);
    return [];
  }

  const artistMap = new Map<string, number>();
  (data || []).forEach((s) => {
    if (s.artist && s.artist.trim()) {
      const name = s.artist.trim();
      artistMap.set(name, (artistMap.get(name) || 0) + 1);
    }
  });

  return Array.from(artistMap.entries())
    .map(([name, songCount]) => ({ name, songCount }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createAdminSong(data: AdminSongFormData): Promise<AdminSong | null> {
  const now = new Date().toISOString();
  const excerpt = generateExcerpt(data.lyrics);
  const categoriesString =
    data.categories && data.categories.length > 0
      ? data.categories.join(",")
      : "worship";

  let createdBy: string | null = null;
  let createdByName: string | null = null;

  if (isBrowser()) {
    const rawId = localStorage.getItem(VOLUNTEER_ID_KEY);
    createdBy = isValidUuid(rawId) ? rawId : null;
    createdByName = localStorage.getItem(VOLUNTEER_NAME_KEY);
  }

  // Fetch existing slugs to avoid collision
  const { data: existingSongs } = await supabase.from("songs").select("slug");
  const existingSlugs = new Set((existingSongs || []).map((s) => s.slug));

  const baseSlug = data.slug || generateSlug(data.title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (existingSlugs.has(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const dbData = {
    title: data.title,
    slug: finalSlug,
    artist: data.artist || "",
    category: categoriesString,
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
    created_by: createdBy,
    created_by_name: createdByName,
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
  const categoriesString =
    data.categories && data.categories.length > 0
      ? data.categories.join(",")
      : "worship";

  let modifiedByName: string | null = null;
  if (isBrowser()) {
    modifiedByName = localStorage.getItem(VOLUNTEER_NAME_KEY);
  }

  // Fetch other songs' slugs to avoid collision
  const { data: existingSongs } = await supabase
    .from("songs")
    .select("slug")
    .neq("id", id);
  const existingSlugs = new Set((existingSongs || []).map((s) => s.slug));

  const baseSlug = data.slug || generateSlug(data.title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (existingSlugs.has(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const dbData: Record<string, unknown> = {
    title: data.title,
    slug: finalSlug,
    artist: data.artist || "",
    category: categoriesString,
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
    last_modified_by_name: modifiedByName,
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

export async function createAdminSongsBatch(songs: AdminSongFormData[]): Promise<boolean> {
  const now = new Date().toISOString();
  let createdBy: string | null = null;
  let createdByName: string | null = null;

  if (isBrowser()) {
    const rawId = localStorage.getItem(VOLUNTEER_ID_KEY);
    createdBy = isValidUuid(rawId) ? rawId : null;
    createdByName = localStorage.getItem(VOLUNTEER_NAME_KEY);
  }

  // Fetch existing slugs to avoid collision
  const { data: existingSongs } = await supabase.from("songs").select("slug");
  const existingSlugs = new Set((existingSongs || []).map((s) => s.slug));

  const dbData = [];
  for (const data of songs) {
    const excerpt = generateExcerpt(data.lyrics);
    const categoriesString =
      data.categories && data.categories.length > 0
        ? data.categories.join(",")
        : "worship";

    const baseSlug = data.slug || generateSlug(data.title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(finalSlug);

    dbData.push({
      title: data.title,
      slug: finalSlug,
      artist: data.artist || "",
      category: categoriesString,
      language: data.language,
      lyrics: data.lyrics,
      raw_lyrics: data.rawLyrics || data.lyrics,
      seo_title: data.seoTitle || "",
      seo_description: data.seoDescription || "",
      source_url: data.sourceUrl || "",
      rights_status: data.rightsStatus || "unknown",
      status: data.status,
      excerpt,
      created_at: now,
      updated_at: now,
      created_by: createdBy,
      created_by_name: createdByName,
    });
  }

  const { error } = await supabase
    .from("songs")
    .insert(dbData);

  if (error) {
    console.error("Error batch creating songs:", error);
    return false;
  }

  return true;
}

export async function updateSongsStatus(ids: string[], status: SongStatus): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("songs")
    .update({
      status,
      updated_at: now,
    })
    .in("id", ids);

  if (error) {
    console.error(`Error updating status for songs to ${status}:`, error);
    return false;
  }
  return true;
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

export function getLoggedInUserName(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(VOLUNTEER_NAME_KEY) || "Admin";
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
  // 1. Try Custom Volunteer Credentials
  try {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("email", email.trim())
      .eq("passcode", password)
      .eq("status", "active")
      .maybeSingle();

    if (!error && data) {
      if (isBrowser()) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(ROLE_KEY, "volunteer");
        localStorage.setItem(VOLUNTEER_ID_KEY, data.id);
        localStorage.setItem(VOLUNTEER_NAME_KEY, data.name);
        
        // Asynchronously start time tracking session
        startVolunteerSession(data.id);
      }
      return true;
    }
  } catch (e) {
    console.error("Custom volunteer login error:", e);
  }

  // 2. Try Supabase Auth (for standard admins/users)
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

  // 3. Admin demo login fallback
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    if (isBrowser()) {
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(ROLE_KEY, "admin");
      localStorage.setItem(VOLUNTEER_NAME_KEY, "Sachin");
    }
    return true;
  }

  // 4. Volunteer demo login fallback
  if (email === VOLUNTEER_EMAIL && password === VOLUNTEER_PASSWORD) {
    if (isBrowser()) {
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(ROLE_KEY, "volunteer");
      localStorage.setItem(VOLUNTEER_ID_KEY, "demo-volunteer-id");
      localStorage.setItem(VOLUNTEER_NAME_KEY, "Demo Helper");
      startVolunteerSession("demo-volunteer-id");
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
    localStorage.removeItem(VOLUNTEER_ID_KEY);
    localStorage.removeItem(VOLUNTEER_NAME_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
  }
}

export async function triggerRebuild(): Promise<boolean> {
  try {
    // Try inserting into rebuilds table; if table doesn't exist, treat as success
    // since the main purpose is to signal a rebuild to the CI/CD pipeline.
    const { error } = await supabase
      .from("rebuilds")
      .insert([{ created_at: new Date().toISOString() }]);
    if (error) {
      // If the table doesn't exist (42P01), log a warning but don't fail
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn("Rebuilds table not found. Skipping rebuild trigger — changes are saved to the database.");
        return true;
      }
      console.error("Error inserting rebuild trigger:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to trigger rebuild:", err);
    return false;
  }
}

// --- Volunteer Tracking Analytics ---

export async function startVolunteerSession(volunteerId: string): Promise<void> {
  if (!isBrowser()) return;
  // If demo ID, don't write to DB
  if (volunteerId === "demo-volunteer-id") {
    localStorage.setItem(SESSION_ID_KEY, "demo-session-id");
    return;
  }
  try {
    const { data, error } = await supabase
      .from("volunteer_sessions")
      .insert([{ volunteer_id: volunteerId, duration_minutes: 0 }])
      .select()
      .single();
      
    if (!error && data) {
      localStorage.setItem(SESSION_ID_KEY, data.id);
    }
  } catch (err) {
    console.error("Failed to start volunteer session:", err);
  }
}

export async function updateVolunteerSessionHeartbeat(): Promise<void> {
  if (!isBrowser()) return;
  const sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId || sessionId === "demo-session-id") return;
  
  try {
    const { data: sessionData, error: fetchError } = await supabase
      .from("volunteer_sessions")
      .select("duration_minutes")
      .eq("id", sessionId)
      .maybeSingle();
      
    if (!fetchError && sessionData) {
      const newDuration = (sessionData.duration_minutes || 0) + 1;
      await supabase
        .from("volunteer_sessions")
        .update({
          duration_minutes: newDuration,
          last_active: new Date().toISOString()
        })
        .eq("id", sessionId);
    }
  } catch (err) {
    console.error("Failed to update volunteer session heartbeat:", err);
  }
}

export async function createVolunteer(name: string, email: string, passcode: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("volunteers")
      .insert([{
        name,
        email: email.toLowerCase().trim(),
        passcode,
        status: "active"
      }]);
    if (error) {
      console.error("Error inserting volunteer:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to create volunteer:", err);
    return false;
  }
}

export async function toggleVolunteerStatus(id: string, currentStatus: "active" | "inactive"): Promise<boolean> {
  try {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("volunteers")
      .update({ status: nextStatus })
      .eq("id", id);
    if (error) {
      console.error("Error updating status:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to toggle status:", err);
    return false;
  }
}

export async function getVolunteerStats(): Promise<VolunteerStats[]> {
  try {
    // 1. Fetch volunteers
    const { data: volunteers, error: volError } = await supabase
      .from("volunteers")
      .select("*")
      .order("name", { ascending: true });

    if (volError || !volunteers) {
      console.error("Error fetching volunteers:", volError);
      return [];
    }

    // 2. Fetch song upload counts
    const { data: songsData, error: songError } = await supabase
      .from("songs")
      .select("created_by");

    // 3. Fetch session analytics
    const { data: sessionsData, error: sessError } = await supabase
      .from("volunteer_sessions")
      .select("volunteer_id, duration_minutes, last_active");

    const uploadsMap: Record<string, number> = {};
    if (!songError && songsData) {
      songsData.forEach((s) => {
        if (s.created_by) {
          uploadsMap[s.created_by] = (uploadsMap[s.created_by] || 0) + 1;
        }
      });
    }

    const durationMap: Record<string, number> = {};
    const lastActiveMap: Record<string, string | null> = {};
    if (!sessError && sessionsData) {
      sessionsData.forEach((s) => {
        if (s.volunteer_id) {
          durationMap[s.volunteer_id] = (durationMap[s.volunteer_id] || 0) + s.duration_minutes;
          const dateStr = s.last_active;
          if (dateStr) {
            const current = lastActiveMap[s.volunteer_id];
            if (!current || dateStr > current) {
              lastActiveMap[s.volunteer_id] = dateStr;
            }
          }
        }
      });
    }

    return volunteers.map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      status: v.status as "active" | "inactive",
      createdAt: v.created_at,
      totalUploads: uploadsMap[v.id] || 0,
      totalDurationMinutes: durationMap[v.id] || 0,
      lastActive: lastActiveMap[v.id] || null,
    }));
  } catch (err) {
    console.error("Failed to gather volunteer stats:", err);
    return [];
  }
}
