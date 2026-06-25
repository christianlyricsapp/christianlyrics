"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LyricsPreview from "./LyricsPreview";
import { categories, languages } from "@/lib/demo-data";
import { createAdminSong, updateAdminSong, getAdminRole } from "@/lib/admin-store";
import {
  RIGHTS_STATUSES,
  SONG_STATUSES,
  canPublish,
  generateSlug,
  type AdminSong,
  type AdminSongFormData,
  type RightsStatus,
  type SongStatus,
} from "@/lib/admin-types";

type AdminSongFormProps = {
  song?: AdminSong;
  showPreviewOnLoad?: boolean;
};

type FormErrors = Partial<Record<keyof AdminSongFormData | "categories", string>>;

const emptyForm: AdminSongFormData = {
  title: "",
  slug: "",
  categories: [],
  language: "",
  lyrics: "",
  seoTitle: "",
  seoDescription: "",
  sourceUrl: "",
  rightsStatus: "unknown",
  status: "draft",
};

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-lg text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "mb-2 block text-base font-medium text-foreground";

const helperClass = "mt-1.5 text-sm text-muted";

export default function AdminSongForm({
  song,
  showPreviewOnLoad = false,
}: AdminSongFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AdminSongFormData>(
    song
      ? {
          title: song.title,
          slug: song.slug,
          categories: song.categories,
          language: song.language,
          lyrics: song.lyrics,
          seoTitle: song.seoTitle,
          seoDescription: song.seoDescription,
          sourceUrl: song.sourceUrl,
          rightsStatus: song.rightsStatus,
          status: song.status,
        }
      : emptyForm
  );
  const [slugManual, setSlugManual] = useState(!!song);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rightsWarning, setRightsWarning] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(showPreviewOnLoad);
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");

  useEffect(() => {
    getAdminRole().then(setRole);
  }, []);

  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title, slugManual]);

  function updateField<K extends keyof AdminSongFormData>(
    key: K,
    value: AdminSongFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleCategory(slug: string) {
    setForm((prev) => {
      const exists = prev.categories.includes(slug);
      const categories = exists
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug];
      return { ...prev, categories };
    });
    setErrors((prev) => ({ ...prev, categories: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!form.title.trim()) {
      next.title = "Song title is required.";
    }
    if (!form.slug.trim()) {
      next.slug = "Slug is required.";
    }
    if (form.categories.length === 0) {
      next.categories = "Select at least one category.";
    }
    if (!form.language) {
      next.language = "Please select a language.";
    }
    if (!form.lyrics.trim()) {
      next.lyrics = "Lyrics are required. Paste them from your phone.";
    }

    return next;
  }

  function handleSave(status: SongStatus) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const finalStatus = role === "volunteer" ? "needs-review" : status;

    if (finalStatus === "published" && !canPublish(form.rightsStatus)) {
      setRightsWarning(true);
      return;
    }

    setRightsWarning(false);
    const data: AdminSongFormData = {
      ...form,
      seoTitle: role === "volunteer" ? "" : form.seoTitle,
      seoDescription: role === "volunteer" ? "" : form.seoDescription,
      sourceUrl: role === "volunteer" ? "" : form.sourceUrl,
      rightsStatus: role === "volunteer" ? "unknown" : form.rightsStatus,
      status: finalStatus,
    };

    const action = song
      ? updateAdminSong(song.id, data)
      : createAdminSong(data);

    action.then(() => {
      router.push("/admin/songs");
    });
  }

  const publishBlocked = !canPublish(form.rightsStatus);

  return (
    <div className="pb-28 md:pb-10">
      {/* Mobile preview toggle */}
      <div className="mb-4 md:hidden">
        <button
          type="button"
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base font-medium transition-colors hover:bg-section"
        >
          {showMobilePreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>
              Song Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Morning Light Praise"
              className={inputClass}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className={labelClass}>
              URL Slug
            </label>
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugManual(true);
                updateField("slug", e.target.value);
              }}
              placeholder="auto-generated-from-title"
              className={inputClass}
            />
            <p className={helperClass}>
              Auto-generated from title. Edit only if needed.
            </p>
            {errors.slug && (
              <p className="mt-1.5 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className={labelClass}>
              Language <span className="text-red-500">*</span>
            </label>
            <select
              id="language"
              value={form.language}
              onChange={(e) => updateField("language", e.target.value)}
              className={inputClass}
            >
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang.slug} value={lang.slug}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1.5 text-sm text-red-600">{errors.language}</p>
            )}
          </div>

          {/* Categories */}
          <fieldset>
            <legend className={labelClass}>
              Categories <span className="text-red-500">*</span>
            </legend>
            <p className={helperClass}>
              Select all that apply — Praise, Worship, Communion.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {categories.map((cat) => {
                const checked = form.categories.includes(cat.slug);
                return (
                  <label
                    key={cat.slug}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-base transition-colors ${
                      checked
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-section"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat.slug)}
                      className="h-5 w-5 rounded accent-primary"
                    />
                    <span>
                      {cat.icon} {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.categories && (
              <p className="mt-1.5 text-sm text-red-600">{errors.categories}</p>
            )}
          </fieldset>

          {/* Lyrics */}
          <div>
            <label htmlFor="lyrics" className={labelClass}>
              Lyrics <span className="text-red-500">*</span>
            </label>
            <p className={helperClass}>
              Copy and paste lyrics from your phone. Use [Verse 1], [Chorus],
              etc. for sections.
            </p>
            <textarea
              id="lyrics"
              value={form.lyrics}
              onChange={(e) => updateField("lyrics", e.target.value)}
              rows={12}
              placeholder="[Verse 1]&#10;Paste lyrics here...&#10;&#10;[Chorus]&#10;Paste chorus here..."
              className={`${inputClass} mt-2 font-mono text-base leading-relaxed`}
            />
            {errors.lyrics && (
              <p className="mt-1.5 text-sm text-red-600">{errors.lyrics}</p>
            )}
          </div>

          {/* Advanced Meta Settings (Admins only) */}
          {role !== "volunteer" && (
            <>
              {/* SEO Title */}
              <div>
                <label htmlFor="seoTitle" className={labelClass}>
                  SEO Title
                </label>
                <input
                  id="seoTitle"
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  placeholder="Optional — shown in search results"
                  className={inputClass}
                />
                <p className={helperClass}>
                  Leave blank to use the song title.
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <label htmlFor="seoDescription" className={labelClass}>
                  SEO Description
                </label>
                <textarea
                  id="seoDescription"
                  value={form.seoDescription}
                  onChange={(e) => updateField("seoDescription", e.target.value)}
                  rows={3}
                  placeholder="Short description for search engines"
                  className={inputClass}
                />
              </div>

              {/* Source URL */}
              <div>
                <label htmlFor="sourceUrl" className={labelClass}>
                  Source Website / Link
                </label>
                <input
                  id="sourceUrl"
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => updateField("sourceUrl", e.target.value)}
                  placeholder="https://example.com/song-source"
                  className={inputClass}
                />
                <p className={helperClass}>
                  Where the lyrics came from, if applicable.
                </p>
              </div>

              {/* Rights Status */}
              <div>
                <label htmlFor="rightsStatus" className={labelClass}>
                  Rights / Permission Status
                </label>
                <select
                  id="rightsStatus"
                  value={form.rightsStatus}
                  onChange={(e) => {
                    updateField("rightsStatus", e.target.value as RightsStatus);
                    setRightsWarning(false);
                  }}
                  className={inputClass}
                >
                  {RIGHTS_STATUSES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {publishBlocked && (
                  <p className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Please verify that you have permission to publish these lyrics.
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className={labelClass}>
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value as SongStatus)
                  }
                  className={inputClass}
                >
                  {SONG_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {rightsWarning && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
              Please verify that you have permission to publish these lyrics.
            </div>
          )}
        </div>

        {/* Preview — desktop always visible, mobile toggle */}
        <div
          className={`lg:sticky lg:top-20 lg:self-start ${
            showMobilePreview ? "block" : "hidden lg:block"
          }`}
        >
          <LyricsPreview
            title={form.title}
            slug={form.slug}
            categories={form.categories}
            language={form.language}
            lyrics={form.lyrics}
            seoTitle={form.seoTitle}
            seoDescription={form.seoDescription}
            sourceUrl={form.sourceUrl}
            rightsStatus={form.rightsStatus}
            status={form.status}
          />
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-sm md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row">
          {role === "volunteer" ? (
            <button
              type="button"
              onClick={() => handleSave("needs-review")}
              className="w-full rounded-xl bg-primary px-5 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
            >
              Submit for Review
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSave("draft")}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-base font-medium transition-colors hover:bg-section"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave("needs-review")}
                className="flex-1 rounded-xl bg-accent px-4 py-3.5 text-base font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Submit for Review
              </button>
              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={publishBlocked}
                className="flex-1 rounded-xl bg-primary px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Publish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
