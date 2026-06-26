"use client";

import { useState, useEffect } from "react";
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
import { parseExistingLyrics, toTitleCase } from "@/lib/lyrics-formatting";

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
  onSave: (status: SongStatus, finalBlocks?: LyricsBlock[]) => void;
  hideAdvancedFields?: boolean;
  onTitleChange: (value: string) => void;
  onBlocksChange: (blocks: LyricsBlock[]) => void;
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
  onTitleChange,
  onBlocksChange,
}: LyricsReviewStepProps) {
  const formattedLyrics = blocksToLyricsString(blocks);
  const publishBlocked = !canPublish(rightsStatus);
  const displaySeoTitle = seoTitle.trim() || title;

  const [localLyrics, setLocalLyrics] = useState(formattedLyrics);

  useEffect(() => {
    setLocalLyrics(formattedLyrics);
  }, [formattedLyrics]);

  function handleLyricsChange(text: string) {
    setLocalLyrics(text);
  }

  function handleLyricsBlur() {
    const newBlocks = parseExistingLyrics(localLyrics);
    onBlocksChange(newBlocks);
  }

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
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            Public Lyrics Preview
          </p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-section active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            ✏️ Edit Formats
          </button>
        </div>
        <div className="mt-3">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={(e) => onTitleChange(toTitleCase(e.target.value))}
            className="w-full bg-transparent border-b border-border/20 hover:border-border/60 focus:border-primary text-2xl font-bold text-foreground focus:outline-none pb-1"
            placeholder="Song Title"
          />
        </div>
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

        <textarea
          value={localLyrics}
          onChange={(e) => handleLyricsChange(e.target.value)}
          onBlur={handleLyricsBlur}
          rows={Math.max(12, localLyrics.split("\n").length + 2)}
          className="mt-6 w-full rounded-2xl border border-border bg-section p-4 sm:p-5 font-mono text-base leading-relaxed text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
          placeholder="Edit lyrics here..."
        />
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
          className="flex-1 rounded-xl border border-border bg-card px-4 py-4 text-lg font-semibold transition-all hover:bg-section active:scale-95 cursor-pointer"
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
              onClick={() => {
                const finalBlocks = parseExistingLyrics(localLyrics);
                onSave("needs-review", finalBlocks);
              }}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-4 text-lg font-bold text-white transition-opacity hover:opacity-95 shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
            >
              Submit for Review
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const finalBlocks = parseExistingLyrics(localLyrics);
                  onSave("draft", finalBlocks);
                }}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-4 text-base font-semibold transition-all hover:bg-section active:scale-95 cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalBlocks = parseExistingLyrics(localLyrics);
                  onSave("needs-review", finalBlocks);
                }}
                className="flex-1 rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-4 text-base font-semibold text-purple-400 transition-all hover:bg-purple-500/30 active:scale-95 cursor-pointer"
              >
                Submit for Review
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalBlocks = parseExistingLyrics(localLyrics);
                  onSave("published", finalBlocks);
                }}
                disabled={publishBlocked}
                className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-4 text-base font-bold text-white transition-all hover:opacity-95 shadow-md shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 cursor-pointer"
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
