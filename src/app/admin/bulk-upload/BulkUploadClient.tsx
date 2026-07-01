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
type ImportStatus = "pending" | "needs-review" | "saving" | "saved" | "error" | "skipped";

type ParsedSong = {
  id: string;
  title: string;
  artist: string;
  language: string;
  category: string;
  rawLyrics: string;
  formattedLyrics: string;
  status: ImportStatus;
  error?: string;
};

/* ─────────────────────────────────────────────────────────────
   Prompt-detection (same logic as LyricsPasteStep)
   ───────────────────────────────────────────────────────────── */
const PROMPT_SIGNALS = [
  "you are gemini", "you are working inside", "safety rules",
  "do not push", "do not deploy", "do not merge", "npm run",
  "commit message", "final report format", "antigravity",
  "part 1 —", "part 2 —", "exact next step",
];

function looksLikePrompt(text: string): boolean {
  if (!text || text.length < 80) return false;
  const lower = text.toLowerCase();
  return PROMPT_SIGNALS.filter((s) => lower.includes(s)).length >= 2;
}

/* ─────────────────────────────────────────────────────────────
   Parse manual paste (Title:/Artist:/Language:/Category: + --- sep)
   ───────────────────────────────────────────────────────────── */
function parseManualPaste(text: string): ParsedSong[] {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n---+\n?/);

  const songs: ParsedSong[] = [];

  blocks.forEach((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split("\n");

    let title = "";
    let artist = "";
    let language = "english";
    let category = "worship";
    let needsReview = false;
    const lyricsLines: string[] = [];
    let headerDone = false;

    for (const line of lines) {
      if (!headerDone) {
        const tl = line.match(/^Title:\s*(.+)$/i);
        const al = line.match(/^Artist:\s*(.+)$/i);
        const ll = line.match(/^Language:\s*(.+)$/i);
        const cl = line.match(/^Category:\s*(.+)$/i);

        if (tl) { title = tl[1].trim(); continue; }
        if (al) { artist = al[1].trim(); continue; }
        if (ll) { language = ll[1].trim().toLowerCase(); continue; }
        if (cl) { category = cl[1].trim().toLowerCase(); continue; }

        // Once we see a non-header line, the header section is done
        headerDone = true;
      }
      lyricsLines.push(line);
    }

    const rawLyrics = lyricsLines.join("\n").trim();

    // If no title, use first non-empty lyric line
    if (!title) {
      const firstLine = lyricsLines.find((l) => l.trim());
      title = firstLine?.trim() || `Untitled Song ${i + 1}`;
      needsReview = true;
    }

    if (!rawLyrics) return; // skip empty blocks

    const result = autoFormatLyrics(rawLyrics);
    const formattedLyrics = blocksToLyricsString(result.blocks);

    songs.push({
      id: `manual-${Date.now()}-${i}`,
      title,
      artist,
      language,
      category,
      rawLyrics,
      formattedLyrics,
      status: needsReview ? "needs-review" : "pending",
    });
  });

  return songs;
}

/* ─────────────────────────────────────────────────────────────
   File-upload helper (unchanged from original)
   ───────────────────────────────────────────────────────────── */
function splitIntoSongs(text: string): { title: string; rawLyrics: string }[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const SEPARATOR = /^[-*=]{3,}\s*$/;
  const songs: { title: string; rawLyrics: string }[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  function flush() {
    const raw = currentLines.join("\n").trim();
    if (currentTitle && raw) songs.push({ title: currentTitle.trim(), rawLyrics: raw });
    currentLines = [];
    currentTitle = "";
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SEPARATOR.test(line)) { flush(); continue; }
    const prevIsBlank = i === 0 || lines[i - 1].trim() === "";
    const looksLikeTitle =
      line.trim().length > 0 &&
      line.trim().length < 80 &&
      !/[.!?,]$/.test(line.trim()) &&
      /[A-Z]/.test(line) &&
      prevIsBlank;
    if (looksLikeTitle && currentLines.length > 0) flush();
    if (looksLikeTitle && currentTitle === "") { currentTitle = line.trim(); continue; }
    if (currentTitle) currentLines.push(line);
    else if (line.trim()) currentTitle = line.trim();
  }
  flush();
  return songs;
}

/* ─────────────────────────────────────────────────────────────
   Song Card (shared between file-upload and manual-paste)
   ───────────────────────────────────────────────────────────── */
function SongCard({
  song,
  index,
  selected,
  onToggle,
  onUpdate,
  onSkip,
}: {
  song: ParsedSong;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<ParsedSong>) => void;
  onSkip: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<ImportStatus, string> = {
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    "needs-review": "bg-amber-50 text-amber-700 border-amber-200",
    saving: "bg-blue-50 text-blue-600 border-blue-200",
    saved: "bg-green-50 text-green-600 border-green-200",
    error: "bg-red-50 text-red-600 border-red-200",
    skipped: "bg-gray-50 text-gray-400 border-gray-200",
  };

  const statusLabel: Record<ImportStatus, string> = {
    pending: "Ready to import",
    "needs-review": "⚠️ Needs review",
    saving: "Saving…",
    saved: "✓ Saved",
    error: "✗ Error",
    skipped: "Skipped",
  };

  const isEditable = song.status === "pending" || song.status === "needs-review";

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        song.status === "saved"
          ? "opacity-50 border-border bg-card"
          : song.status === "skipped"
          ? "opacity-40 border-border bg-card"
          : selected
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:shadow-sm"
      }`}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          {isEditable ? (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>

        {/* Number */}
        <span className="pt-1 text-sm font-bold text-muted min-w-[1.5rem]">{index + 1}.</span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {isEditable ? (
            <input
              type="text"
              value={song.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Song title"
              className="w-full rounded-lg border border-border bg-section px-3 py-1.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <span className="font-semibold text-foreground">{song.title}</span>
          )}
          <div className="mt-0.5 text-xs text-muted">/{generateSlug(song.title)}</div>
        </div>

        {/* Status badge */}
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor[song.status]}`}>
          {statusLabel[song.status]}
        </span>

        {/* Skip / expand */}
        <div className="flex gap-1.5 shrink-0">
          {isEditable && (
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:bg-section"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:bg-section"
          >
            {expanded ? "▲ Less" : "▼ More"}
          </button>
        </div>
      </div>

      {/* Expanded detail editor */}
      {expanded && isEditable && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Artist</label>
              <input
                type="text"
                value={song.artist}
                onChange={(e) => onUpdate({ artist: e.target.value })}
                placeholder="Artist name"
                className="w-full rounded-lg border border-border bg-section px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Language</label>
              <input
                type="text"
                value={song.language}
                onChange={(e) => onUpdate({ language: e.target.value })}
                placeholder="e.g. english"
                className="w-full rounded-lg border border-border bg-section px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Category</label>
              <input
                type="text"
                value={song.category}
                onChange={(e) => onUpdate({ category: e.target.value })}
                placeholder="e.g. worship"
                className="w-full rounded-lg border border-border bg-section px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Lyrics</label>
            <textarea
              value={song.formattedLyrics}
              onChange={(e) => onUpdate({ formattedLyrics: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-border bg-section px-3 py-2 font-mono text-xs leading-relaxed text-foreground focus:border-primary focus:outline-none resize-y"
            />
          </div>
        </div>
      )}

      {/* Expanded view-only */}
      {expanded && !isEditable && (
        <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-border bg-section px-3 py-2 text-xs leading-relaxed text-muted whitespace-pre-wrap">
          {song.formattedLyrics || song.rawLyrics}
        </pre>
      )}

      {song.status === "error" && song.error && (
        <p className="mt-2 text-xs text-red-500">{song.error}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */
type Tab = "file" | "paste";

export default function BulkUploadClient() {
  const [activeTab, setActiveTab] = useState<Tab>("paste");

  /* ── File-upload state ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  /* ── Manual paste state ── */
  const [pasteText, setPasteText] = useState("");
  const [promptWarning, setPromptWarning] = useState(false);

  /* ── Shared song list ── */
  const [songs, setSongs] = useState<ParsedSong[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  /* ── Parse manual paste ── */
  function handlePreviewPaste() {
    if (!pasteText.trim()) return;

    if (looksLikePrompt(pasteText)) {
      setPromptWarning(true);
      return;
    }

    runParse(pasteText);
  }

  function runParse(text: string) {
    setPromptWarning(false);
    const parsed = parseManualPaste(text);
    if (parsed.length === 0) {
      setParseError("No songs detected. Use --- to separate songs.");
      return;
    }
    setParseError("");
    setSongs(parsed);
    setSelected(new Set(parsed.filter((s) => s.status === "pending").map((s) => s.id)));
  }

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

      const fileParsed = splitIntoSongs(plainText);
      if (fileParsed.length === 0) {
        setParseError("Could not detect any songs. Make sure each song title is on its own line, separated by blank lines or --- dividers.");
        setIsParsing(false);
        return;
      }

      const songList: ParsedSong[] = fileParsed.map((s, i) => {
        const result = autoFormatLyrics(s.rawLyrics);
        const formattedLyrics = blocksToLyricsString(result.blocks);
        return {
          id: `file-${Date.now()}-${i}`,
          title: s.title,
          artist: "",
          language: "english",
          category: "worship",
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

  /* ── Song list helpers ── */
  function updateSong(id: string, updates: Partial<ParsedSong>) {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const activePending = songs.filter(
    (s) => s.status === "pending" || s.status === "needs-review"
  );

  function toggleSelectAll() {
    if (selected.size === activePending.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activePending.map((s) => s.id)));
    }
  }

  /* ── Save songs ── */
  const saveSongs = useCallback(async () => {
    const toSave = songs.filter(
      (s) => selected.has(s.id) && (s.status === "pending" || s.status === "needs-review")
    );
    if (toSave.length === 0) return;

    setIsSaving(true);

    for (const song of toSave) {
      setSongs((prev) =>
        prev.map((s) => (s.id === song.id ? { ...s, status: "saving" } : s))
      );

      // Generate a safe unique slug
      const baseSlug = generateSlug(song.title);
      const safeSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

      try {
        const result = await createAdminSong({
          title: song.title,
          slug: safeSlug,
          artist: song.artist || "",
          categories: [song.category || "worship"],
          language: song.language || "english",
          lyrics: song.formattedLyrics || song.rawLyrics,
          rawLyrics: song.rawLyrics,
          seoTitle: `${song.title} Lyrics`,
          seoDescription: (song.formattedLyrics || song.rawLyrics)
            .split("\n")
            .filter(Boolean)
            .slice(0, 2)
            .join(" ")
            .slice(0, 155),
          sourceUrl: "",
          rightsStatus: "public-domain",
          // Always draft — never auto-publish
          status: "draft",
        });

        setSongs((prev) =>
          prev.map((s) =>
            s.id === song.id
              ? { ...s, status: result ? "saved" : "error", error: result ? undefined : "Failed to save" }
              : s
          )
        );
      } catch (err) {
        setSongs((prev) =>
          prev.map((s) =>
            s.id === song.id ? { ...s, status: "error", error: String(err) } : s
          )
        );
      }
    }

    setIsSaving(false);
  }, [songs, selected]);

  function resetAll() {
    setSongs([]);
    setSelected(new Set());
    setPasteText("");
    setParseError("");
    setPromptWarning(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const savedCount = songs.filter((s) => s.status === "saved").length;
  const pendingCount = activePending.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            📄 Bulk Lyrics Upload
          </h1>
          <p className="mt-1 text-sm text-muted">
            Paste multiple songs at once or upload a file. All imported songs are saved as <strong>Draft</strong>.
          </p>
        </div>
        <Link
          href="/admin/songs"
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-section"
        >
          ← Back to Songs
        </Link>
      </div>

      {/* ── Tabs ── */}
      {songs.length === 0 && (
        <div className="mb-6 flex rounded-xl border border-border bg-card overflow-hidden">
          {(["paste", "file"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setParseError(""); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-section"
              }`}
            >
              {tab === "paste" ? "✏️ Manual Paste" : "📂 Upload File"}
            </button>
          ))}
        </div>
      )}

      {/* ── Manual Paste Tab ── */}
      {activeTab === "paste" && songs.length === 0 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted">
            <strong className="text-foreground">Format guide:</strong> Paste lyrics for multiple songs. Separate songs with <code className="rounded bg-section px-1">---</code> on its own line.
            Optionally start each song with <code className="rounded bg-section px-1">Title:</code>, <code className="rounded bg-section px-1">Artist:</code>, <code className="rounded bg-section px-1">Language:</code>, <code className="rounded bg-section px-1">Category:</code> lines.
          </div>

          <details className="rounded-xl border border-border bg-card text-sm">
            <summary className="cursor-pointer px-4 py-3 font-medium text-primary">
              View example format
            </summary>
            <pre className="border-t border-border px-4 py-3 text-xs text-muted whitespace-pre-wrap">{`Title: Change My Heart
Artist: Unknown
Language: English
Category: Worship

Verse 1
Change my heart oh God
Make it ever true

Chorus 1
You are the potter
I am the clay

---

Title: Amazing Grace
Artist: Unknown
Language: English
Category: Hymn

Verse 1
Amazing grace how sweet the sound
That saved a wretch like me`}</pre>
          </details>

          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setPromptWarning(false);
              setParseError("");
            }}
            rows={18}
            placeholder={"Title: Song Name\nArtist: Artist Name\nLanguage: English\nCategory: Worship\n\nVerse 1\nLyrics line one\nLyrics line two\n\n---\n\nTitle: Another Song\n..."}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm leading-relaxed text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[280px]"
          />

          {/* Prompt warning */}
          {promptWarning && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
              <p className="text-sm font-semibold text-amber-800">
                ⚠️ This looks like instructions or a prompt, not song lyrics. Please confirm before continuing.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => runParse(pasteText)}
                  className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                >
                  This is lyrics — continue
                </button>
                <button
                  type="button"
                  onClick={() => { setPasteText(""); setPromptWarning(false); }}
                  className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Clear and re-paste
                </button>
              </div>
            </div>
          )}

          {parseError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              ⚠️ {parseError}
            </p>
          )}

          <button
            type="button"
            onClick={handlePreviewPaste}
            disabled={!pasteText.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🔍 Preview Import
          </button>
        </div>
      )}

      {/* ── File Upload Tab ── */}
      {activeTab === "file" && songs.length === 0 && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-section/40"
            } ${isParsing ? "pointer-events-none opacity-60" : ""}`}
          >
            <span className="text-6xl">📂</span>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {isParsing ? "Parsing file…" : "Drop your file here"}
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

          {parseError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              ⚠️ {parseError}
            </p>
          )}
        </div>
      )}

      {/* ── Review list ── */}
      {songs.length > 0 && (
        <>
          {/* Stats + reset bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3.5">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold text-foreground">{songs.length} songs detected</span>
              {savedCount > 0 && <span className="text-green-600">✓ {savedCount} saved</span>}
              {pendingCount > 0 && <span className="text-muted">{pendingCount} pending</span>}
              {songs.filter((s) => s.status === "error").length > 0 && (
                <span className="text-red-500">✗ {songs.filter((s) => s.status === "error").length} failed</span>
              )}
              {songs.filter((s) => s.status === "skipped").length > 0 && (
                <span className="text-muted">{songs.filter((s) => s.status === "skipped").length} skipped</span>
              )}
            </div>
            <button
              onClick={resetAll}
              className="text-xs text-muted underline hover:text-foreground"
            >
              Start over
            </button>
          </div>

          {/* Action bar */}
          {pendingCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-section px-4 py-3">
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
                  onClick={saveSongs}
                  disabled={selected.size === 0 || isSaving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-40"
                >
                  {isSaving ? "Saving…" : `💾 Import as Draft (${selected.size})`}
                </button>
              </div>
            </div>
          )}

          {/* Note — always draft */}
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            All songs will be saved as <strong>Draft</strong>. They will not appear publicly until you publish them from Songs list.
          </div>

          {/* Song cards */}
          <div className="space-y-3">
            {songs.map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                index={i}
                selected={selected.has(song.id)}
                onToggle={() => toggleSelect(song.id)}
                onUpdate={(updates) => updateSong(song.id, updates)}
                onSkip={() => {
                  updateSong(song.id, { status: "skipped" });
                  setSelected((prev) => {
                    const next = new Set(prev);
                    next.delete(song.id);
                    return next;
                  });
                }}
              />
            ))}
          </div>

          {/* Done message */}
          {savedCount === songs.filter((s) => s.status !== "skipped").length &&
            savedCount > 0 && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
                <p className="text-lg font-semibold text-green-700">
                  🎉 {savedCount} song{savedCount !== 1 ? "s" : ""} imported as Draft!
                </p>
                <div className="mt-3 flex justify-center gap-3">
                  <Link
                    href="/admin/songs"
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light"
                  >
                    View Songs
                  </Link>
                  <button
                    onClick={resetAll}
                    className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-section"
                  >
                    Import more
                  </button>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
