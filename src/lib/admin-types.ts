export const RIGHTS_STATUSES = [
  { value: "original", label: "Original" },
  { value: "public-domain", label: "Public Domain" },
  { value: "permission-received", label: "Permission Received" },
  { value: "licensed", label: "Licensed" },
  { value: "needs-verification", label: "Needs Verification" },
  { value: "unknown", label: "Unknown" },
] as const;

export const SONG_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "needs-review", label: "Needs Review" },
  { value: "changes-requested", label: "Changes Requested" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export type RightsStatus = (typeof RIGHTS_STATUSES)[number]["value"];
export type SongStatus = (typeof SONG_STATUSES)[number]["value"];

export type AdminSong = {
  id: string;
  title: string;
  slug: string;
  artist: string;
  categories: string[];
  language: string;
  lyrics: string;
  rawLyrics?: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
  rightsStatus: RightsStatus;
  status: SongStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdByName: string | null;
  lastModifiedByName: string | null;
};

export type AdminSongFormData = Omit<
  AdminSong,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "createdByName" | "lastModifiedByName"
>;

export type AdminStats = {
  total: number;
  published: number;
  draft: number;
  needsReview: number;
};

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getRightsStatusLabel(status: RightsStatus): string {
  return RIGHTS_STATUSES.find((r) => r.value === status)?.label ?? status;
}

export function getSongStatusLabel(status: SongStatus): string {
  return SONG_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function canPublish(rightsStatus: RightsStatus): boolean {
  return rightsStatus !== "unknown" && rightsStatus !== "needs-verification";
}

export type Volunteer = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
};

export type VolunteerStats = Volunteer & {
  totalUploads: number;
  totalDurationMinutes: number;
  lastActive: string | null;
};
