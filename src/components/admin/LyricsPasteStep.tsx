"use client";

import { categories, languages } from "@/lib/demo-data";
import type { RightsStatus } from "@/lib/admin-types";
import LyricsSourceFields from "./LyricsSourceFields";
import { helperClass, inputClass, labelClass } from "./LyricsSourceFields";

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
};

export default function LyricsPasteStep({
  data,
  errors,
  onChange,
  onAutoFormat,
  onContinue,
}: LyricsPasteStepProps) {
  function update<K extends keyof PasteStepData>(key: K, value: PasteStepData[K]) {
    onChange({ ...data, [key]: value });
  }

  function toggleCategory(slug: string) {
    const exists = data.categories.includes(slug);
    update(
      "categories",
      exists
        ? data.categories.filter((c) => c !== slug)
        : [...data.categories, slug]
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-section px-4 py-3 text-base text-muted">
        <strong className="text-foreground">Step 1 of 3:</strong> Paste lyrics
        from your phone. Nothing goes live until you review and submit.
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Song Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Morning Light Praise"
          className={inputClass}
        />
        {errors.title && (
          <p className="mt-1.5 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

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
          <p className="mt-1.5 text-sm text-red-600">{errors.language}</p>
        )}
      </div>

      <fieldset>
        <legend className={labelClass}>
          Category <span className="text-red-500">*</span>
        </legend>
        <p className={helperClass}>Select all that apply.</p>
        <div className="mt-3 flex flex-col gap-2">
          {categories.map((cat) => {
            const checked = data.categories.includes(cat.slug);
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

      <LyricsSourceFields
        sourceUrl={data.sourceUrl}
        rightsStatus={data.rightsStatus}
        onSourceUrlChange={(v) => update("sourceUrl", v)}
        onRightsStatusChange={(v) => update("rightsStatus", v)}
      />

      <div>
        <label htmlFor="rawLyrics" className={labelClass}>
          Paste Lyrics Here <span className="text-red-500">*</span>
        </label>
        <p className={helperClass}>
          Copy and paste directly from your phone. Original text is always
          saved.
        </p>
        <textarea
          id="rawLyrics"
          value={data.rawLyrics}
          onChange={(e) => update("rawLyrics", e.target.value)}
          rows={14}
          placeholder="Paste raw lyrics here...&#10;&#10;Verse 1&#10;Line one&#10;Line two&#10;&#10;Chorus&#10;Line one..."
          className={`${inputClass} mt-2 font-mono leading-relaxed`}
        />
        {errors.rawLyrics && (
          <p className="mt-1.5 text-sm text-red-600">{errors.rawLyrics}</p>
        )}
        {data.rawLyrics.trim() && (
          <p className="mt-2 text-sm text-muted">
            {data.rawLyrics.split("\n").filter((l) => l.trim()).length} lines
            pasted · original saved
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAutoFormat}
          className="flex-1 rounded-xl bg-primary px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-primary-light"
        >
          Auto Format Lyrics
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-lg font-medium transition-colors hover:bg-section"
        >
          Continue without formatting
        </button>
      </div>
    </div>
  );
}
