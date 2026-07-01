"use client";

import { useState, useCallback } from "react";
import { SECTION_LABELS, createBlockId, type LyricsBlock } from "@/lib/lyrics-section-detector";

type LyricsBlockEditorProps = {
  blocks: LyricsBlock[];
  onChange: (blocks: LyricsBlock[]) => void;
  duplicateWarning?: boolean;
};

const MAX_HISTORY = 20;

export default function LyricsBlockEditor({
  blocks,
  onChange,
  duplicateWarning = false,
}: LyricsBlockEditorProps) {
  const [history, setHistory] = useState<LyricsBlock[][]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Push current state to undo history before a mutating action
  const commit = useCallback(
    (next: LyricsBlock[]) => {
      setHistory((prev) => [...prev.slice(-MAX_HISTORY + 1), blocks]);
      onChange(next);
    },
    [blocks, onChange]
  );

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    onChange(prev);
  }

  function updateBlock(index: number, updates: Partial<LyricsBlock>) {
    commit(blocks.map((b, i) => (i === index ? { ...b, ...updates } : b)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  function deleteBlock(index: number) {
    commit(blocks.filter((_, i) => i !== index));
  }

  function addBlockBelow(index: number) {
    const next = [...blocks];
    next.splice(index + 1, 0, {
      id: createBlockId(),
      label: "Verse 1",
      lines: [""],
    });
    commit(next);
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
    commit(next);
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
      label: "Verse 1",
      lines: nonEmpty.slice(mid),
    };
    const next = [...blocks];
    next.splice(index, 1, first, second);
    commit(next);
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
    onChange(next); // live drag — don't commit to history on every drag step
  }

  function handleDragEnd() {
    setHistory((prev) => [...prev.slice(-MAX_HISTORY + 1), blocks]);
    setDragIndex(null);
  }

  if (blocks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-base text-muted">
        No sections yet. Go back and paste lyrics, then tap <strong>Auto Format Lyrics</strong>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <span className="text-sm font-semibold text-foreground">
          {blocks.length} section{blocks.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-section active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            title="Undo last action"
          >
            ↩ Undo
          </button>
        </div>
      </div>

      {duplicateWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Many duplicate lines detected. This may be intentional (e.g. repeated chorus). Please review before saving.
        </div>
      )}

      {blocks.map((block, index) => {
        const text = block.lines.join("\n");
        const rows = Math.max(6, block.lines.length + 2);

        return (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`rounded-2xl border bg-card p-4 transition-shadow ${
              dragIndex === index
                ? "border-primary shadow-md opacity-70"
                : "border-border hover:shadow-sm"
            }`}
          >
            {/* Label row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="hidden cursor-grab text-muted md:inline select-none"
                aria-hidden="true"
                title="Drag to reorder"
              >
                ⠿
              </span>
              <label className="sr-only" htmlFor={`label-${block.id}`}>
                Section label
              </label>
              <select
                id={`label-${block.id}`}
                value={
                  SECTION_LABELS.includes(block.label as (typeof SECTION_LABELS)[number])
                    ? block.label
                    : "Other"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  updateBlock(index, { label: val });
                }}
                className="rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SECTION_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              {/* Custom label input when "Other" or unrecognised label */}
              {(!SECTION_LABELS.includes(block.label as (typeof SECTION_LABELS)[number]) ||
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
                  className="min-w-[120px] flex-1 rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}

              <span className="ml-auto text-xs text-muted">
                {block.lines.filter((l) => l.trim()).length} lines
              </span>
            </div>

            {/* Lyrics textarea — large and clean */}
            <textarea
              value={text}
              onChange={(e) =>
                updateBlock(index, { lines: e.target.value.split("\n") })
              }
              rows={rows}
              className="w-full rounded-xl border border-border bg-section px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              placeholder="Edit lyrics lines here..."
            />

            {/* Action buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Mobile reorder */}
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold transition-all hover:bg-section active:scale-95 disabled:opacity-30 disabled:pointer-events-none md:hidden"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold transition-all hover:bg-section active:scale-95 disabled:opacity-30 disabled:pointer-events-none md:hidden"
                title="Move down"
              >
                ↓
              </button>

              <button
                type="button"
                onClick={() => addBlockBelow(index)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold transition-all hover:bg-section active:scale-95"
              >
                ➕ Add below
              </button>
              <button
                type="button"
                onClick={() => splitBlock(index)}
                disabled={block.lines.filter((l) => l.trim()).length < 2}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold transition-all hover:bg-section active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                ✂️ Split
              </button>
              {index < blocks.length - 1 && (
                <button
                  type="button"
                  onClick={() => mergeWithNext(index)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold transition-all hover:bg-section active:scale-95"
                >
                  🔗 Merge next
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteBlock(index)}
                className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        );
      })}

      {/* Add new block at the end */}
      <button
        type="button"
        onClick={() =>
          commit([...blocks, { id: createBlockId(), label: "Verse 1", lines: [""] }])
        }
        className="w-full rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
      >
        + Add new section
      </button>

      <p className="text-xs text-muted md:hidden">
        Tap ↑ ↓ to reorder sections on mobile. On desktop, drag by the ⠿ handle.
      </p>
    </div>
  );
}
