"use client";

import {
  canPublish,
  getRightsStatusLabel,
  type RightsStatus,
  type SongStatus,
} from "@/lib/admin-types";
import { getCategoryName, getLanguageName } from "@/lib/demo-data";
import { blocksToLyricsString, type LyricsBlock } from "@/lib/lyrics-section-detector";
import ReviewStatusBadge from "./ReviewStatusBadge";
import { helperClass, inputClass, labelClass } from "./LyricsSourceFields";

type LyricsReviewStepProps = {
  title: string;
  slug: string;
  categories: string[];
  language: string;
  blocks: LyricsBlock[];
  rawLyrics: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
  rightsStatus: RightsStatus;
  status: SongStatus;
  rightsWarning: boolean;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onBack: () => void;
  onSave: (status: SongStatus) => void;
  hideAdvancedFields?: boolean;
};

export default function LyricsReviewStep({
  title,
  slug,
  categories: selectedCategories,
  language,
  blocks,
  rawLyrics,
  seoTitle,
  seoDescription,
  sourceUrl,
  rightsStatus,
  status,
  rightsWarning,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onBack,
  onSave,
  hideAdvancedFields = false,
}: LyricsReviewStepProps) {
  const formattedLyrics = blocksToLyricsString(blocks);
  const publishBlocked = !canPublish(rightsStatus);
  const displaySeoTitle = seoTitle.trim() || title;

  return (
    <div className="space-y-6 pb-28 md:pb-6">
      <div className="rounded-xl bg-section px-4 py-3 text-base text-muted">
        <strong className="text-foreground">Step 3 of 3:</strong> Preview
        everything before saving. Default flow is Submit for Review — not
        immediate publish.
      </div>

      <details className="rounded-xl border border-border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-base font-medium text-primary">
          View original pasted lyrics
        </summary>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap border-t border-border px-4 py-3 text-sm text-muted">
          {rawLyrics || "(empty)"}
        </pre>
      </details>

      {/* Public lyrics preview */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          Public Lyrics Preview
        </p>
        {title ? (
          <h2 className="mt-3 text-2xl font-semibold text-foreground">
            {title}
          </h2>
        ) : (
          <p className="mt-3 text-lg text-muted italic">No title</p>
        )}
        {slug && <p className="mt-1 text-sm text-muted">/songs/{slug}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <ReviewStatusBadge status={status} />
          {selectedCategories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              {getCategoryName(cat)}
            </span>
          ))}
          {language && (
            <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium">
              {getLanguageName(language)}
            </span>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-section p-4 sm:p-5">
          {formattedLyrics ? (
            formattedLyrics.split("\n").map((line, index) => (
              <p
                key={index}
                className={
                  line.startsWith("[")
                    ? "mt-4 font-semibold text-primary first:mt-0"
                    : line === ""
                      ? "h-3"
                      : "text-base leading-relaxed text-foreground"
                }
              >
                {line}
              </p>
            ))
          ) : (
            <p className="text-muted italic">No formatted lyrics yet.</p>
          )}
        </div>
      </div>

      {/* SEO fields (Admins only) */}
      {!hideAdvancedFields && (
        <>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-foreground">SEO Settings</h3>
            <div>
              <label htmlFor="seoTitle" className={labelClass}>
                SEO Title
              </label>
              <input
                id="seoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                placeholder="Leave blank to use song title"
                className={inputClass}
              />
              <p className={helperClass}>Shown in search engine results.</p>
            </div>
            <div>
              <label htmlFor="seoDescription" className={labelClass}>
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                rows={3}
                placeholder="Short description for search engines"
                className={inputClass}
              />
            </div>
          </div>

          {/* SEO preview card */}
          <div className="rounded-2xl border border-dashed border-border bg-card p-5">
            <p className="text-xs font-medium uppercase text-muted">SEO Preview</p>
            <p className="mt-2 text-lg font-medium text-primary">
              {displaySeoTitle} | Christian Lyrics
            </p>
            <p className="mt-1 text-sm text-green-700">
              christianlyrics.app/songs/{slug || "..."}
            </p>
            <p className="mt-1 text-sm text-muted">
              {seoDescription ||
                "No description set. Add one for better search results."}
            </p>
          </div>
        </>
      )}

      {/* Meta info */}
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        {!hideAdvancedFields && (
          <>
            <div>
              <p className="text-sm text-muted">Source URL</p>
              <p className="mt-1 text-base font-medium break-all">
                {sourceUrl || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">Rights / Permission</p>
              <p className="mt-1 text-base font-medium">
                {getRightsStatusLabel(rightsStatus)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">Review Status</p>
              <p className="mt-2">
                <ReviewStatusBadge status={status} />
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-sm text-muted">Blocks / Sections</p>
          <p className="mt-1 text-base font-medium">
            {blocks.length} section{blocks.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {publishBlocked && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-base text-amber-800">
          Please verify that you have permission to publish these lyrics.
        </div>
      )}

      {rightsWarning && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
          Please verify that you have permission to publish these lyrics.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-lg font-medium transition-colors hover:bg-section"
        >
          ← Back to Format
        </button>
      </div>

      {/* Sticky bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row">
          {hideAdvancedFields ? (
            <button
              type="button"
              onClick={() => onSave("needs-review")}
              className="w-full rounded-xl bg-primary px-5 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
            >
              Submit for Review
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSave("draft")}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-base font-medium transition-colors hover:bg-section"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => onSave("needs-review")}
                className="flex-1 rounded-xl bg-accent px-4 py-3.5 text-base font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Submit for Review
              </button>
              <button
                type="button"
                onClick={() => onSave("published")}
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
