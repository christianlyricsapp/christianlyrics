"use client";

import { useEffect, useRef } from "react";
import { categories, languages } from "@/lib/demo-data";
import type { RightsStatus } from "@/lib/admin-types";
import { helperClass, inputClass, labelClass } from "./LyricsSourceFields";
import { cleanRawLyrics, toTitleCase } from "@/lib/lyrics-formatting";

export type PasteStepData = {
  title: string;
  language: string;
  categories: string[];
  sourceUrl: string;
  rightsStatus: RightsStatus;
  rawLyrics: string;
};

type PasteStepErrors = Partial<Record<keyof PasteStepData, string>>;

type LyricsPasteStepProps = {
  data: PasteStepData;
  errors: PasteStepErrors;
  onChange: (data: PasteStepData) => void;
  onAutoFormat: () => void;
  onContinue: () => void;
  hideSourceFields?: boolean;
};

export default function LyricsPasteStep({
  data,
  errors,
  onChange,
  onAutoFormat,
  onContinue,
  hideSourceFields = false,
}: LyricsPasteStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  }, [data.rawLyrics]);

  // Default rights status to "public-domain" for devotional/educational purpose
  useEffect(() => {
    if (!data.rightsStatus || data.rightsStatus === "unknown" || data.rightsStatus === "needs-verification") {
      onChange({ ...data, rightsStatus: "public-domain" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof PasteStepData>(key: K, value: PasteStepData[K]) {
    onChange({ ...data, [key]: value });
  }

  function toggleCategory(slug: string) {
    const exists = data.categories.includes(slug);
    let newCategories = exists
      ? data.categories.filter((c) => c !== slug)
      : [...data.categories, slug];

    // Praise and Worship are mutually exclusive
    if (slug === "worship" && !exists) {
      newCategories = newCategories.filter((c) => c !== "praise");
    } else if (slug === "praise" && !exists) {
      newCategories = newCategories.filter((c) => c !== "worship");
    }

    update("categories", newCategories);
  }

  const clipboardPastedRef = useRef(false);

  async function tryClipboardPaste() {
    if (clipboardPastedRef.current || data.rawLyrics.trim()) {
      return;
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          update("rawLyrics", text);
          clipboardPastedRef.current = true;
        }
      }
    } catch (err) {
      console.warn("Clipboard access denied or not supported:", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-base text-muted">
        <strong className="text-foreground">Step 1 of 3:</strong> Paste lyrics
        from your phone. Nothing goes live until you review and submit.
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Song Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="title"
            type="text"
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            onBlur={(e) => update("title", toTitleCase(e.target.value))}
            placeholder="e.g. Morning Light Praise"
            className={`${inputClass} pr-10`}
          />
          {data.title && (
            <button
              type="button"
              onClick={() => update("title", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white text-lg font-bold cursor-pointer"
              aria-label="Clear title"
            >
              ✕
            </button>
          )}
        </div>
        {errors.title && (
          <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* ── 2. Paste Lyrics (moved up) ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label htmlFor="rawLyrics" className="block text-base font-medium text-foreground">
            Paste Lyrics Here <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {!data.rawLyrics.trim() && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
                      const text = await navigator.clipboard.readText();
                      if (text && text.trim()) {
                        update("rawLyrics", text);
                        clipboardPastedRef.current = true;
                      }
                    }
                  } catch (err) {
                    console.warn("Clipboard access denied or not supported:", err);
                  }
                }}
                className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                📋 Paste
              </button>
            )}
            {data.rawLyrics.trim() && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const cleaned = cleanRawLyrics(data.rawLyrics);
                    update("rawLyrics", cleaned);
                  }}
                  className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
                >
                  🧹 Clean Pasted Text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    update("rawLyrics", "");
                    clipboardPastedRef.current = false;
                  }}
                  className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 cursor-pointer"
                >
                  ❌ Clear
                </button>
              </>
            )}
          </div>
        </div>
        <p className={helperClass}>
          Copy and paste directly from your phone. Original text is always
          saved.
        </p>
        <textarea
          ref={textareaRef}
          id="rawLyrics"
          value={data.rawLyrics}
          onChange={(e) => update("rawLyrics", e.target.value)}
          onMouseEnter={tryClipboardPaste}
          onFocus={tryClipboardPaste}
          placeholder={"Paste raw lyrics here...\n\nVerse 1\nLine one\nLine two\n\nChorus\nLine one..."}
          className={`${inputClass} mt-2 font-mono leading-relaxed overflow-hidden`}
        />
        {errors.rawLyrics && (
          <p className="mt-1.5 text-sm text-red-400">{errors.rawLyrics}</p>
        )}
        {data.rawLyrics.trim() && (
          <p className="mt-2 text-sm text-muted">
            {data.rawLyrics.split("\n").filter((l) => l.trim()).length} lines
            pasted · original saved
          </p>
        )}
      </div>

      {/* ── 3. Language ── */}
      <div>
        <label htmlFor="language" className={labelClass}>
          Language <span className="text-red-500">*</span>
        </label>
        <select
          id="language"
          value={data.language}
          onChange={(e) => update("language", e.target.value)}
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
          <p className="mt-1.5 text-sm text-red-400">{errors.language}</p>
        )}
      </div>

      {/* ── 4. Category ── */}
      <fieldset>
        <legend className={labelClass}>
          Category <span className="text-red-500">*</span>
        </legend>
        <p className={helperClass}>Select all that apply.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((cat) => {
            const checked = data.categories.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggleCategory(cat.slug)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all cursor-pointer ${
                  checked
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-md ring-2 ring-primary/20 scale-[1.02]"
                    : "border-border bg-card text-foreground hover:bg-section"
                }`}
              >
                <span className="text-3xl" role="img" aria-label={cat.name}>
                  {cat.icon}
                </span>
                <span className="text-sm font-semibold">{cat.name}</span>
              </button>
            );
          })}
        </div>
        {errors.categories && (
          <p className="mt-1.5 text-sm text-red-400">{errors.categories}</p>
        )}
      </fieldset>

      {/* Rights status is auto-defaulted to "public-domain" — no UI field needed */}

      <div className="flex flex-col gap-3 sm:flex-row pt-4">
        <button
          type="button"
          onClick={onAutoFormat}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-4 text-lg font-bold text-white transition-opacity hover:opacity-95 shadow-md shadow-primary/20"
        >
          Auto Format Lyrics
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-xl border border-border bg-card px-5 py-4 text-lg font-semibold transition-colors hover:bg-section"
        >
          Continue without formatting
        </button>
      </div>
    </div>
  );
}
