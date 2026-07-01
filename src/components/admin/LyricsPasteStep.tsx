"use client";

import { useEffect, useRef, useState } from "react";
import { categories, languages } from "@/lib/demo-data";
import type { RightsStatus } from "@/lib/admin-types";
import { helperClass, inputClass, labelClass } from "./LyricsSourceFields";
import { cleanRawLyrics, toTitleCase } from "@/lib/lyrics-formatting";

export type PasteStepData = {
  title: string;
  artist: string;
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

/* ── Prompt / instruction text detection ─────────────────────── */
const PROMPT_SIGNALS = [
  "you are gemini",
  "you are working inside",
  "safety rules",
  "do not push",
  "do not deploy",
  "do not merge",
  "run npm",
  "npm run",
  "commit message",
  "final report format",
  "this is version",
  "antigravity",
  "part 1 —",
  "part 2 —",
  "part 3 —",
  "important about publish",
  "exact next step",
  "do not break",
];

function looksLikePrompt(text: string): boolean {
  if (!text || text.length < 80) return false;
  const lower = text.toLowerCase();
  const matchCount = PROMPT_SIGNALS.filter((sig) => lower.includes(sig)).length;
  return matchCount >= 2;
}

/* ── Special-character cleaning ──────────────────────────────── */
function cleanSpecialChars(text: string): string {
  // Keep: letters (A-Z, a-z), digits, spaces, line-breaks,
  //       Unicode letters (covers Hindi/Marathi/vernacular scripts),
  //       common punctuation used in lyrics: ' " - ,
  // Remove: decorative/technical symbols unlikely in lyrics
  return text
    .split("\n")
    .map((line) =>
      line
        // Remove HTML-like tags
        .replace(/<[^>]*>/g, "")
        // Remove URLs
        .replace(/https?:\/\/\S+/g, "")
        // Remove characters that are definitely NOT lyrics:
        // @ # $ % ^ & * ( ) _ = + { } [ ] | \ : ; < > / ~ `
        // Keep: ' " - , . ! ?  (common in lyrics)
        .replace(/[@#$%^&*()\-_+={}[\]|\\:;<>\/~`]/g, " ")
        // Collapse multiple spaces into one
        .replace(/ {2,}/g, " ")
        .trim()
    )
    .join("\n");
}

export default function LyricsPasteStep({
  data,
  errors,
  onChange,
  onAutoFormat,
  onContinue,
  hideSourceFields = false,
}: LyricsPasteStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [promptWarning, setPromptWarning] = useState(false);
  const [cleanedNotice, setCleanedNotice] = useState(false);
  const clipboardPastedRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight + 2, 600)}px`;
  }, [data.rawLyrics]);

  // Default rights status to public-domain
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
    if (slug === "worship" && !exists) {
      newCategories = newCategories.filter((c) => c !== "praise");
    } else if (slug === "praise" && !exists) {
      newCategories = newCategories.filter((c) => c !== "worship");
    }
    update("categories", newCategories);
  }

  async function tryClipboardPaste() {
    if (clipboardPastedRef.current || data.rawLyrics.trim()) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text?.trim()) {
          handleLyricsPaste(text);
          clipboardPastedRef.current = true;
        }
      }
    } catch (err) {
      console.warn("Clipboard access denied:", err);
    }
  }

  function handleLyricsPaste(text: string) {
    if (looksLikePrompt(text)) {
      update("rawLyrics", text);
      setPromptWarning(true);
      setCleanedNotice(false);
    } else {
      update("rawLyrics", text);
      setPromptWarning(false);
    }
  }

  function handleCleanClick() {
    const cleaned = cleanSpecialChars(data.rawLyrics);
    update("rawLyrics", cleaned);
    setCleanedNotice(true);
    setTimeout(() => setCleanedNotice(false), 4000);
  }

  function handleConfirmPrompt() {
    setPromptWarning(false);
  }

  function handleClearLyrics() {
    update("rawLyrics", "");
    setPromptWarning(false);
    setCleanedNotice(false);
    clipboardPastedRef.current = false;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted">
        <strong className="text-foreground">Step 1 of 3:</strong> Paste lyrics
        from your phone or document. Nothing goes live until you review and submit.
      </div>

      {/* Song Title */}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-base font-bold cursor-pointer"
              aria-label="Clear title"
            >
              ✕
            </button>
          )}
        </div>
        {errors.title && (
          <p className="mt-1.5 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Artist */}
      <div>
        <label htmlFor="artist" className={labelClass}>
          Artist / Band / Sung By
        </label>
        <div className="relative">
          <input
            id="artist"
            type="text"
            value={data.artist}
            onChange={(e) => update("artist", e.target.value)}
            onBlur={(e) => update("artist", toTitleCase(e.target.value))}
            placeholder="e.g. Bethel Music, Chris Tomlin"
            className={`${inputClass} pr-10`}
          />
          {data.artist && (
            <button
              type="button"
              onClick={() => update("artist", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-base font-bold cursor-pointer"
              aria-label="Clear artist"
            >
              ✕
            </button>
          )}
        </div>
        <p className={helperClass}>
          Auto-detected if lyrics start with a dash (e.g. &quot;- Bethel Music&quot;)
        </p>
      </div>

      {/* Paste Lyrics */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label htmlFor="rawLyrics" className="block text-sm font-semibold text-foreground">
            Paste Lyrics Here <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {!data.rawLyrics.trim() && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
                      const text = await navigator.clipboard.readText();
                      if (text?.trim()) {
                        handleLyricsPaste(text);
                        clipboardPastedRef.current = true;
                      }
                    }
                  } catch (err) {
                    console.warn("Clipboard access denied:", err);
                  }
                }}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                📋 Paste from clipboard
              </button>
            )}
            {data.rawLyrics.trim() && (
              <>
                <button
                  type="button"
                  onClick={handleCleanClick}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
                >
                  🧹 Clean symbols
                </button>
                <button
                  type="button"
                  onClick={handleClearLyrics}
                  className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20 cursor-pointer"
                >
                  ❌ Clear
                </button>
              </>
            )}
          </div>
        </div>
        <p className={helperClass}>
          Copy and paste directly from your phone. Original text is always saved.
        </p>

        <textarea
          ref={textareaRef}
          id="rawLyrics"
          value={data.rawLyrics}
          onChange={(e) => {
            handleLyricsPaste(e.target.value);
          }}
          onMouseEnter={tryClipboardPaste}
          onFocus={tryClipboardPaste}
          placeholder={
            "Paste raw lyrics here...\n\nVerse 1\nLine one\nLine two\n\nChorus\nLine one..."
          }
          className={`${inputClass} mt-2 font-mono leading-relaxed overflow-hidden min-h-[200px]`}
        />

        {errors.rawLyrics && (
          <p className="mt-1.5 text-sm text-red-500">{errors.rawLyrics}</p>
        )}

        {/* Cleaned notice */}
        {cleanedNotice && (
          <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 flex items-center gap-2">
            ✓ Special symbols were cleaned automatically.
          </div>
        )}

        {/* Prompt / instruction warning */}
        {promptWarning && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
            <p className="text-sm font-semibold text-amber-800">
              ⚠️ This looks like instructions or a prompt, not song lyrics. Please confirm before continuing.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmPrompt}
                className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                This is lyrics — continue
              </button>
              <button
                type="button"
                onClick={handleClearLyrics}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Clear and re-paste
              </button>
            </div>
          </div>
        )}

        {data.rawLyrics.trim() && !promptWarning && (
          <p className="mt-2 text-xs text-muted">
            {data.rawLyrics.split("\n").filter((l) => l.trim()).length} lines pasted · original saved
          </p>
        )}
      </div>

      {/* Language */}
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
          <p className="mt-1.5 text-sm text-red-500">{errors.language}</p>
        )}
      </div>

      {/* Category */}
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
          <p className="mt-1.5 text-sm text-red-500">{errors.categories}</p>
        )}
      </fieldset>

      {/* Rights status is auto-defaulted to "public-domain" — no UI field needed */}

      <div className="flex flex-col gap-3 sm:flex-row pt-4">
        <button
          type="button"
          onClick={promptWarning ? undefined : onAutoFormat}
          disabled={promptWarning}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-4 text-base font-bold text-white transition-opacity hover:opacity-95 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✨ Auto Format Lyrics
        </button>
        <button
          type="button"
          onClick={promptWarning ? undefined : onContinue}
          disabled={promptWarning}
          className="flex-1 rounded-xl border border-border bg-card px-5 py-4 text-base font-semibold transition-colors hover:bg-section disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue without formatting
        </button>
      </div>
    </div>
  );
}
