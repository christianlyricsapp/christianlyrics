"use client";

import { useState } from "react";
import { SECTION_LABELS, createBlockId, type LyricsBlock } from "@/lib/lyrics-section-detector";
import { getBlockSpellingWarnings } from "@/lib/spellcheck-placeholder";
import { inputClass, labelClass } from "./LyricsSourceFields";

type LyricsBlockEditorProps = {
  blocks: LyricsBlock[];
  onChange: (blocks: LyricsBlock[]) => void;
  duplicateWarning?: boolean;
};

export default function LyricsBlockEditor({
  blocks,
  onChange,
  duplicateWarning = false,
}: LyricsBlockEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(
    new Set()
  );

  function updateBlock(index: number, updates: Partial<LyricsBlock>) {
    const next = blocks.map((b, i) =>
      i === index ? { ...b, ...updates } : b
    );
    onChange(next);
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function deleteBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function addBlockBelow(index: number) {
    const next = [...blocks];
    next.splice(index + 1, 0, {
      id: createBlockId(),
      label: "Other",
      lines: [""],
    });
    onChange(next);
  }

  function mergeWithNext(index: number) {
    if (index >= blocks.length - 1) return;
    const current = blocks[index];
    const nextBlock = blocks[index + 1];
    const merged: LyricsBlock = {
      id: current.id,
      label: current.label,
      lines: [
        ...current.lines.filter(Boolean),
        ...nextBlock.lines.filter(Boolean),
      ],
    };
    const next = [...blocks];
    next.splice(index, 2, merged);
    onChange(next);
  }

  function splitBlock(index: number) {
    const block = blocks[index];
    const nonEmpty = block.lines.filter((l) => l.trim());
    if (nonEmpty.length < 2) return;

    const mid = Math.ceil(nonEmpty.length / 2);
    const first: LyricsBlock = {
      id: block.id,
      label: block.label,
      lines: nonEmpty.slice(0, mid),
    };
    const second: LyricsBlock = {
      id: createBlockId(),
      label: "Other",
      lines: nonEmpty.slice(mid),
    };
    const next = [...blocks];
    next.splice(index, 1, first, second);
    onChange(next);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...blocks];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(index);
    onChange(next);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  function dismissWarning(key: string) {
    setDismissedWarnings((prev) => new Set(prev).add(key));
  }

  if (blocks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-lg text-muted">
        No blocks yet. Go back and paste lyrics, then tap Auto Format.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {duplicateWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-800">
          ⚠️ Many duplicate lines were found. This may be intentional (e.g.
          repeated chorus). Please review before submitting.
        </div>
      )}

      {blocks.map((block, index) => {
        const text = block.lines.join("\n");
        const warnings = getBlockSpellingWarnings(block.lines).filter(
          (w) => !dismissedWarnings.has(`${block.id}-${w.word}-${w.lineIndex}`)
        );

        return (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`rounded-2xl border bg-card p-4 transition-shadow ${
              dragIndex === index
                ? "border-primary shadow-md"
                : "border-border"
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="hidden cursor-grab text-muted md:inline"
                aria-hidden="true"
              >
                ⠿
              </span>
              <label className="sr-only" htmlFor={`label-${block.id}`}>
                Section label
              </label>
              <select
                id={`label-${block.id}`}
                value={
                  SECTION_LABELS.includes(
                    block.label as (typeof SECTION_LABELS)[number]
                  )
                    ? block.label
                    : "Other"
                }
                onChange={(e) => updateBlock(index, { label: e.target.value })}
                className="rounded-xl border border-border bg-section px-3 py-2 text-base font-medium"
              >
                {SECTION_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {(!SECTION_LABELS.includes(
                block.label as (typeof SECTION_LABELS)[number]
              ) ||
                block.label === "Other") && (
                <input
                  type="text"
                  value={block.label === "Other" ? "" : block.label}
                  onChange={(e) =>
                    updateBlock(index, {
                      label: e.target.value.trim() || "Other",
                    })
                  }
                  placeholder="Custom label"
                  className="min-w-[120px] flex-1 rounded-xl border border-border px-3 py-2 text-base"
                />
              )}
            </div>

            <textarea
              value={text}
              onChange={(e) =>
                updateBlock(index, { lines: e.target.value.split("\n") })
              }
              rows={Math.max(4, block.lines.length + 1)}
              className={`${inputClass} font-mono leading-relaxed`}
              placeholder="Edit lyrics lines..."
            />

            {warnings.length > 0 && (
              <div className="mt-3 space-y-2">
                {warnings.map((w) => {
                  const key = `${block.id}-${w.word}-${w.lineIndex}`;
                  return (
                    <div
                      key={key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-900"
                    >
                      <span>
                        Possible spelling issue: <strong>{w.word}</strong>
                        {w.suggestion !== "Check spelling" && (
                          <> — did you mean &quot;{w.suggestion}&quot;?</>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => dismissWarning(key)}
                        className="rounded-lg border border-yellow-300 px-2 py-1 text-xs font-medium hover:bg-yellow-100"
                      >
                        Ignore
                      </button>
                    </div>
                  );
                })}
                <p className="text-xs text-muted">
                  Spelling suggestions are not auto-applied. Edit manually if
                  needed.
                </p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-40 md:hidden"
              >
                ↑ Up
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-40 md:hidden"
              >
                ↓ Down
              </button>
              <button
                type="button"
                onClick={() => addBlockBelow(index)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-section"
              >
                + Add below
              </button>
              <button
                type="button"
                onClick={() => splitBlock(index)}
                disabled={block.lines.filter((l) => l.trim()).length < 2}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-section disabled:opacity-40"
              >
                Split
              </button>
              {index < blocks.length - 1 && (
                <button
                  type="button"
                  onClick={() => mergeWithNext(index)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-section"
                >
                  Merge next
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteBlock(index)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...blocks,
            { id: createBlockId(), label: "Other", lines: [""] },
          ])
        }
        className="w-full rounded-xl border border-dashed border-border py-3 text-base font-medium text-muted transition-colors hover:border-primary hover:text-primary"
      >
        + Add new block
      </button>

      <p className="text-sm text-muted md:hidden">
        Use ↑ ↓ buttons to reorder blocks. On desktop, drag blocks by the ⠿
        handle.
      </p>
    </div>
  );
}
