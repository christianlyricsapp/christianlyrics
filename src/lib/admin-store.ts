import {
  type AdminSong,
  type AdminSongFormData,
  type AdminStats,
  generateSlug,
} from "./admin-types";

const SONGS_KEY = "christian-lyrics-admin-songs";
const AUTH_KEY = "christian-lyrics-admin-auth";

const DEMO_EMAIL = "admin@christianlyrics.app";
const DEMO_PASSWORD = "admin123";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readSongs(): AdminSong[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(SONGS_KEY);
    return raw ? (JSON.parse(raw) as AdminSong[]) : [];
  } catch {
    return [];
  }
}

function writeSongs(songs: AdminSong[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function getAdminSongs(): AdminSong[] {
  return readSongs().sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function getAdminSongById(id: string): AdminSong | undefined {
  return readSongs().find((s) => s.id === id);
}

export function getAdminStats(): AdminStats {
  const songs = readSongs();
  return {
    total: songs.length,
    published: songs.filter((s) => s.status === "published").length,
    draft: songs.filter((s) => s.status === "draft").length,
    needsReview: songs.filter((s) => s.status === "needs-review").length,
  };
}

export function createAdminSong(data: AdminSongFormData): AdminSong {
  const now = new Date().toISOString();
  const song: AdminSong = {
    ...data,
    id: crypto.randomUUID(),
    slug: data.slug || generateSlug(data.title),
    createdAt: now,
    updatedAt: now,
  };

  const songs = readSongs();
  songs.push(song);
  writeSongs(songs);
  return song;
}

export function updateAdminSong(
  id: string,
  data: AdminSongFormData
): AdminSong | null {
  const songs = readSongs();
  const index = songs.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updated: AdminSong = {
    ...songs[index],
    ...data,
    slug: data.slug || generateSlug(data.title),
    updatedAt: new Date().toISOString(),
  };

  songs[index] = updated;
  writeSongs(songs);
  return updated;
}

export function isAdminLoggedIn(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function adminLogin(email: string, password: string): boolean {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_KEY);
}
