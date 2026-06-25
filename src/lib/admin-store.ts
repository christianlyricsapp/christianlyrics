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

  let createdBy: string | null = null;
  let createdByName: string | null = null;

  if (isBrowser()) {
    createdBy = localStorage.getItem(VOLUNTEER_ID_KEY);
    createdByName = localStorage.getItem(VOLUNTEER_NAME_KEY);
  }

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
