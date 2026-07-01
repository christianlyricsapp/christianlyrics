"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createAdminSong } from "@/lib/admin-store";
import { autoFormatLyrics } from "@/lib/lyrics-formatting";
import { blocksToLyricsString } from "@/lib/lyrics-section-detector";
import { generateSlug } from "@/lib/admin-types";

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */
type ParsedSong = {
  id: string;              // temp local key
  title: string;
  rawLyrics: string;
  formattedLyrics: string;
  status: "pending" | "saving" | "saved" | "error";
  error?: string;
};

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

/**
 * Split a wall of text (from a .docx file) into individual songs.
 * Songs are separated by:
 *   – A blank line followed by an ALL-CAPS / Title-Case heading that looks
 *     like a song name (≥2 words OR a single word ≥4 chars with no verbs).
 *   – Three or more consecutive dashes / asterisks / equals signs.
 */
function splitIntoSongs(text: string): { title: string; rawLyrics: string }[] {
  // Normalise line-endings
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const SEPARATOR = /^[-*=]{3,}\s*$/;

  const songs: { title: string; rawLyrics: string }[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  function flush() {
    const raw = currentLines.join("\n").trim();
    if (currentTitle && raw) {
      songs.push({ title: currentTitle.trim(), rawLyrics: raw });
    }
    currentLines = [];
    currentTitle = "";
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Explicit separator line
    if (SEPARATOR.test(line)) {
      flush();
      continue;
    }

    // Detect a song title: a short non-empty line preceded by a blank line
    // (or at the very start) that looks like a title (not all lowercase prose)
    const prevIsBlank = i === 0 || lines[i - 1].trim() === "";
    const nextIsBlank =
      i === lines.length - 1 || lines[i + 1].trim() === "";
    const looksLikeTitle =
      line.trim().length > 0 &&
      line.trim().length < 80 &&
      !/[.!?,]$/.test(line.trim()) && // doesn't end with punctuation
      /[A-Z]/.test(line) &&            // contains at least one capital
      prevIsBlank;

    if (looksLikeTitle && currentLines.length > 0) {
      // We hit a new title while already collecting a song → flush old one
      flush();
    }

    if (looksLikeTitle && currentTitle === "") {
      currentTitle = line.trim();
      continue;
    }

    if (currentTitle) {
      currentLines.push(line);
    } else if (line.trim()) {
      // Text before any title – treat first non-blank line as title
      currentTitle = line.trim();
    }
  }

  flush();
  return songs;
}

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */
export default function BulkUploadClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [songs, setSongs] = useState<ParsedSong[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [publishingAll, setPublishingAll] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ── Parse uploaded file ── */
  async function handleFile(file: File) {
    if (!file) return;
    setParseError("");
    setIsParsing(true);
    setSongs([]);
    setSelected(new Set());

    try {
      let plainText = "";

      if (file.name.endsWith(".docx")) {
        // Dynamically import mammoth only when needed
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        plainText = result.value;
      } else if (file.name.endsWith(".txt")) {
        plainText = await file.text();
      } else {
        setParseError("Unsupported file. Please upload a .docx or .txt file.");
        setIsParsing(false);
        return;
      }

      const parsed = splitIntoSongs(plainText);

      if (parsed.length === 0) {
        setParseError(
          "Could not detect any songs. Make sure each song starts with its title on its own line, separated by blank lines or --- dividers."
        );
        setIsParsing(false);
        return;
      }

      const songList: ParsedSong[] = parsed.map((s, i) => {
        const result = autoFormatLyrics(s.rawLyrics);
        const formattedLyrics = blocksToLyricsString(result.blocks);
        return {
          id: `song-${Date.now()}-${i}`,
          title: s.title,
          rawLyrics: s.rawLyrics,
          formattedLyrics,
          status: "pending" as const,
        };
      });

      setSongs(songList);
      setSelected(new Set(songList.map((s) => s.id)));
    } catch (err) {
      console.error(err);
      setParseError("Failed to read the file. Please try again.");
    } finally {
      setIsParsing(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  /* ── Save selected songs as drafts ── */
  const saveSongs = useCallback(
    async (ids: Set<string>, asDraft: boolean) => {
      const toSave = songs.filter((s) => ids.has(s.id) && s.status === "pending");
      if (toSave.length === 0) return;

      for (const song of toSave) {
        setSongs((prev) =>
          prev.map((s) => (s.id === song.id ? { ...s, status: "saving" } : s))
        );

        const result = await createAdminSong({
          title: song.title,
          slug: generateSlug(song.title),
          artist: "",
          categories: ["worship"],
          language: "english",
          lyrics: song.formattedLyrics,
          rawLyrics: song.rawLyrics,
          seoTitle: `${song.title} Lyrics`,
          seoDescription: song.formattedLyrics.split("\n").filter(Boolean).slice(0, 2).join(" ").slice(0, 155),
          sourceUrl: "",
          rightsStatus: "public-domain",
          status: asDraft ? "draft" : "published",
        });

        setSongs((prev) =>
          prev.map((s) =>
            s.id === song.id
              ? {
                  ...s,
                  status: result ? "saved" : "error",
                  error: result ? undefined : "Failed to save",
                }
              : s
          )
        );
      }
    },
    [songs]
  );

  async function handleSaveAsDrafts() {
    await saveSongs(selected, true);
  }

  async function handlePublishAll() {
    setPublishingAll(true);
    await saveSongs(selected, false);
    setPublishingAll(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pending = songs.filter((s) => s.status === "pending").map((s) => s.id);
    if (selected.size === pending.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pending));
    }
  }

  function updateTitle(id: string, title: string) {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }

  const savedCount = songs.filter((s) => s.status === "saved").length;
  const pendingCount = songs.filter((s) => s.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            📄 Bulk Upload Lyrics
          </h1>
          <p className="mt-1 text-base text-muted">
            Upload a <strong>.docx</strong> or <strong>.txt</strong> file containing
            multiple songs. Each song title should be on its own line, separated by a
            blank line or <code className="rounded bg-section px-1">---</code> divider.
          </p>
        </div>
        <Link
          href="/admin/songs"
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-section"
        >
          ← Back to Songs
        </Link>
      </div>

      {/* ── Upload Zone ── */}
      {songs.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-section/40"
          } ${isParsing ? "pointer-events-none opacity-60" : ""}`}
        >
          <span className="text-6xl">📂</span>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isParsing ? "Parsing file..." : "Drop your file here"}
            </p>
            <p className="mt-1 text-sm text-muted">
              or click to browse · .docx and .txt supported
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".docx,.txt"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      {parseError && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {parseError}
        </div>
      )}

      {/* ── Songs Table ── */}
      {songs.length > 0 && (
        <>
          {/* Stats bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3.5">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold text-foreground">{songs.length} songs detected</span>
              {savedCount > 0 && <span className="text-green-400">✓ {savedCount} saved</span>}
              {pendingCount > 0 && <span className="text-muted">{pendingCount} pending</span>}
              {songs.filter((s) => s.status === "error").length > 0 && (
                <span className="text-red-400">
                  ✗ {songs.filter((s) => s.status === "error").length} failed
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSongs([]);
                setSelected(new Set());
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-xs text-muted underline hover:text-foreground"
            >
              Upload another file
            </button>
          </div>

          {/* Action bar */}
          {pendingCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-section px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selected.size === pendingCount && pendingCount > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
                <label htmlFor="select-all" className="text-sm font-medium text-foreground cursor-pointer">
                  Select all ({pendingCount})
                </label>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  onClick={handleSaveAsDrafts}
                  disabled={selected.size === 0}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-40"
                >
                  💾 Save as Drafts ({selected.size})
                </button>
                <button
                  onClick={handlePublishAll}
                  disabled={selected.size === 0 || publishingAll}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-40"
                >
                  {publishingAll ? "Publishing..." : `🚀 Publish All (${selected.size})`}
                </button>
              </div>
            </div>
          )}

          {/* Song list */}
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-section">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">#</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Song Title</th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell">Lines</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {songs.map((song, i) => (
                  <tr
                    key={song.id}
                    className={`transition-colors ${
                      song.status === "saved"
                        ? "opacity-50"
                        : selected.has(song.id)
                          ? "bg-primary/5"
                          : "hover:bg-section/40"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      {song.status === "pending" && (
                        <input
                          type="checkbox"
                          checked={selected.has(song.id)}
                          onChange={() => toggleSelect(song.id)}
                          className="h-4 w-4 accent-primary cursor-pointer"
                        />
                      )}
                    </td>

                    {/* Number */}
                    <td className="px-4 py-3 text-muted font-medium">{i + 1}</td>

                    {/* Editable Title */}
                    <td className="px-4 py-3">
                      {song.status === "pending" ? (
                        <input
                          type="text"
                          value={song.title}
                          onChange={(e) => updateTitle(song.id, e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border"
                        />
                      ) : (
                        <span className="font-semibold text-foreground">{song.title}</span>
                      )}
                      <div className="mt-0.5 text-xs text-muted">/{generateSlug(song.title)}</div>
                    </td>

                    {/* Lines count */}
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted sm:table-cell">
                      {song.rawLyrics.split("\n").filter((l) => l.trim()).length} lines
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {song.status === "pending" && (
                        <span className="rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-500/20">
                          Pending
                        </span>
                      )}
                      {song.status === "saving" && (
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                          Saving…
                        </span>
                      )}
                      {song.status === "saved" && (
                        <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400 border border-green-500/20">
                          ✓ Saved
                        </span>
                      )}
                      {song.status === "error" && (
                        <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20" title={song.error}>
                          ✗ Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Done message */}
          {savedCount === songs.length && songs.length > 0 && (
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-center">
              <p className="text-lg font-semibold text-green-400">
                🎉 All {savedCount} songs saved!
              </p>
              <div className="mt-3 flex justify-center gap-3">
                <Link
                  href="/admin/songs"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light"
                >
                  View Songs
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
