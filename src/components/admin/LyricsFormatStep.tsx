"use client";

import type { LyricsBlock } from "@/lib/lyrics-section-detector";
import LyricsBlockEditor from "./LyricsBlockEditor";

type LyricsFormatStepProps = {
  blocks: LyricsBlock[];
  rawLyrics: string;
  duplicateWarning: boolean;
  onBlocksChange: (blocks: LyricsBlock[]) => void;
  onBack: () => void;
  onContinue: () => void;
  onReformat: () => void;
};

export default function LyricsFormatStep({
  blocks,
  rawLyrics,
  duplicateWarning,
  onBlocksChange,
  onBack,
  onContinue,
  onReformat,
}: LyricsFormatStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-section px-4 py-3 text-base text-muted">
        <strong className="text-foreground">Step 2 of 3:</strong> Review and
        edit formatted blocks. Fix labels, merge, split, or reorder as needed.
      </div>

      <details className="rounded-xl border border-border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-base font-medium text-primary">
          View original pasted lyrics
        </summary>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap border-t border-border px-4 py-3 text-sm text-muted">
          {rawLyrics || "(empty)"}
        </pre>
      </details>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReformat}
          className="rounded-xl border border-border px-4 py-2.5 text-base font-medium transition-colors hover:bg-section"
        >
          Re-run Auto Format
        </button>
      </div>

      <LyricsBlockEditor
        blocks={blocks}
        onChange={onBlocksChange}
        duplicateWarning={duplicateWarning}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-lg font-medium transition-colors hover:bg-section"
        >
          ← Back to Paste
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-xl bg-primary px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-primary-light"
        >
          Continue to Preview →
        </button>
      </div>
    </div>
  );
}
