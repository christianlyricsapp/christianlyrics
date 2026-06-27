"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories, languages } from "@/lib/demo-data";
import { createAdminSongsBatch } from "@/lib/admin-store";
import { parseDocx } from "@/lib/docx-parser";
import { splitSongsFromText } from "@/lib/song-splitter";
import { autoFormatLyrics, detectLanguage } from "@/lib/lyrics-formatting";
import { blocksToLyricsString, type LyricsBlock } from "@/lib/lyrics-section-detector";
import LyricsBlockEditor from "@/components/admin/LyricsBlockEditor";

type UploadedFileStatus = {
  name: string;
  status: "pending" | "parsing" | "success" | "error";
  errorMsg?: string;
  extractedCount: number;
  file?: File;
};

type ExtractedSongItem = {
  id: string;
  fileName: string;
  title: string;
  slug: string;
  artist: string;
  language: string;
  categories: string[];
  lyricsBlocks: LyricsBlock[];
  rawLyrics: string;
  selected: boolean;
};

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-base text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "mb-1 block text-sm font-semibold text-foreground";

export default function BulkImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "processing" | "review" | "success">("upload");
  const [filesStatus, setFilesStatus] = useState<UploadedFileStatus[]>([]);
  const [songs, setSongs] = useState<ExtractedSongItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [editingSongIndex, setEditingSongIndex] = useState<number | null>(null);

  // ── Handle file selection ──
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const list: UploadedFileStatus[] = selectedFiles.map((file) => {
      if (file.name.toLowerCase().endsWith(".doc")) {
        return {
          name: file.name,
          status: "error",
          errorMsg: "DOC format is legacy binary. Please convert to DOCX, or copy-paste directly.",
          extractedCount: 0,
        };
      }
      return {
        name: file.name,
        status: "pending",
        extractedCount: 0,
        file,
      };
    });

    setFilesStatus(list);
    setStep("processing");
    processFiles(list);
  }

  // ── Batch Process Files ──
  async function processFiles(filesToProcess: UploadedFileStatus[]) {
    const extractedList: ExtractedSongItem[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const current = filesToProcess[i];
      if (current.status === "error" || !current.file) continue;

      setFilesStatus((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "parsing" } : item))
      );

      try {
        const rawText = await parseDocx(current.file);
        const splitSongs = splitSongsFromText(rawText);

        if (splitSongs.length === 0) {
          throw new Error("No lyrics or clear paragraphs detected in file.");
        }

        const processedSongs = splitSongs.map((s, index) => {
          const autoFormatted = autoFormatLyrics(s.rawLyrics);
          // Try language detection on song title/content
          let detectedLang = detectLanguage(s.title);
          if (!detectedLang) {
            detectedLang = detectLanguage(s.rawLyrics) || "english";
          }

          return {
            id: `${i}-${index}-${Math.random()}`,
            fileName: current.name,
            title: s.title,
            slug: s.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-"),
            artist: autoFormatted.detectedArtist || "",
            language: detectedLang,
            categories: ["worship"],
            lyricsBlocks: autoFormatted.blocks,
            rawLyrics: s.rawLyrics,
            selected: true,
          };
        });

        extractedList.push(...processedSongs);

        setFilesStatus((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: "success", extractedCount: splitSongs.length }
              : item
          )
        );
      } catch (err: any) {
        setFilesStatus((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: "error",
                  errorMsg: err.message || "Failed to extract lyrics from DOCX.",
                }
              : item
          )
        );
      }
    }

    setSongs(extractedList);
    setStep("review");
  }

  // ── Song Edit Fields Handlers ──
  function updateSongField<K extends keyof ExtractedSongItem>(
    index: number,
    key: K,
    value: ExtractedSongItem[K]
  ) {
    setSongs((prev) =>
      prev.map((s, idx) => {
        if (idx !== index) return s;
        const updated = { ...s, [key]: value };
        if (key === "title" && typeof value === "string") {
          updated.slug = value
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        }
        return updated;
      })
    );
  }

  function toggleSongCategory(index: number, categorySlug: string) {
    setSongs((prev) =>
      prev.map((s, idx) => {
        if (idx !== index) return s;
        const exists = s.categories.includes(categorySlug);
        let nextCategories = exists
          ? s.categories.filter((c) => c !== categorySlug)
          : [...s.categories, categorySlug];

        // Praise & Worship mutual exclusion
        if (categorySlug === "worship" && !exists) {
          nextCategories = nextCategories.filter((c) => c !== "praise");
        } else if (categorySlug === "praise" && !exists) {
          nextCategories = nextCategories.filter((c) => c !== "worship");
        }

        return { ...s, categories: nextCategories };
      })
    );
  }

  function toggleSongSelection(index: number) {
    setSongs((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, selected: !s.selected } : s))
    );
  }

  function deleteExtractedSong(index: number) {
    setSongs((prev) => prev.filter((_, idx) => idx !== index));
  }

  // ── Import / Save Batch to DB ──
  async function handleImportAll() {
    const selectedSongs = songs.filter((s) => s.selected);
    if (selectedSongs.length === 0) {
      alert("No songs are selected for import.");
      return;
    }

    // Basic Validation check
    const invalidSongs = selectedSongs.filter(
      (s) => !s.title.trim() || !s.language || s.categories.length === 0 || s.lyricsBlocks.length === 0
    );

    if (invalidSongs.length > 0) {
      alert("Some selected songs have empty title, language, or empty lyrics blocks. Please check and correct them.");
      return;
    }

    setIsSaving(true);
    setSaveErrors([]);

    // Transform local ExtractedSongItem to AdminSongFormData
    const dataBatch = selectedSongs.map((s) => {
      const lyrics = blocksToLyricsString(s.lyricsBlocks);
      return {
        title: s.title.trim(),
        slug: s.slug || s.title.toLowerCase().replace(/\s+/g, "-"),
        artist: s.artist.trim(),
        categories: s.categories,
        language: s.language,
        lyrics,
        rawLyrics: s.rawLyrics || lyrics,
        seoTitle: `${s.title.trim()} Lyrics`,
        seoDescription: `Read the full lyrics for "${s.title.trim()}" Christian song in ${s.language}.`,
        sourceUrl: "",
        rightsStatus: "public-domain" as const,
        status: "needs-review" as const, // Save as "Pending Review"
      };
    });

    const success = await createAdminSongsBatch(dataBatch);
    setIsSaving(false);

    if (success) {
      setStep("success");
    } else {
      setSaveErrors(["Failed to save songs to Supabase database. Please check console/network logs."]);
    }
  }

  const selectedCount = songs.filter((s) => s.selected).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Bulk Lyrics Importer</h1>
          <p className="mt-2 text-lg text-muted">
            Upload multiple DOCX lyric sheets to automatically segment, clean, and queue songs.
          </p>
        </div>
        <Link
          href="/admin/songs"
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-base font-semibold text-foreground hover:bg-section"
        >
          Cancel
        </Link>
      </div>

      {/* ── STEP 1: UPLOAD SCREEN ── */}
      {step === "upload" && (
        <div className="mt-8">
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
            <span className="text-5xl" role="img" aria-label="Upload docx files">
              📁
            </span>
            <h2 className="mt-4 text-xl font-semibold">Select DOCX lyrics files</h2>
            <p className="mx-auto mt-2 max-w-md text-base text-muted">
              Select one or multiple `.docx` files. If a file contains multiple songs, they will be split
              automatically.
            </p>
            <label className="mt-6 inline-block cursor-pointer rounded-xl bg-primary px-6 py-3.5 text-lg font-semibold text-white shadow-md shadow-primary/10 transition-colors hover:bg-primary-light active:scale-95">
              Choose Files
              <input
                type="file"
                multiple
                accept=".docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="mt-4 text-sm text-muted">Supported formats: DOCX only. Legacy DOC is validated.</p>
          </div>
        </div>
      )}

      {/* ── STEP 2: PROCESSING SCREEN ── */}
      {step === "processing" && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Parsing Uploaded Documents...</h2>
          <div className="divide-y divide-border">
            {filesStatus.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <div>
                  <span className="font-semibold text-foreground">{file.name}</span>
                  {file.status === "error" && (
                    <p className="mt-1 text-sm text-red-500">{file.errorMsg}</p>
                  )}
                </div>
                <div>
                  {file.status === "pending" && <span className="text-muted">Waiting...</span>}
                  {file.status === "parsing" && (
                    <span className="text-primary font-medium animate-pulse">Extracting text...</span>
                  )}
                  {file.status === "success" && (
                    <span className="text-green-600 font-semibold">
                      ✓ Done ({file.extractedCount} song{file.extractedCount !== 1 ? "s" : ""})
                    </span>
                  )}
                  {file.status === "error" && <span className="text-red-500 font-semibold">⚠ Error</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: REVIEW / EDIT WORKSPACE ── */}
      {step === "review" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl bg-section px-4 py-3 text-base text-muted flex items-center justify-between">
            <span>
              <strong>Review Queue:</strong> {songs.length} song{songs.length !== 1 ? "s" : ""} extracted.
              Select songs to import. By default, they save as <strong>Pending Review</strong> status.
            </span>
            <span className="text-sm font-semibold text-primary">{selectedCount} Selected</span>
          </div>

          {songs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-lg text-muted">No songs could be extracted from the uploaded files.</p>
              <button
                onClick={() => setStep("upload")}
                className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-base font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`rounded-2xl border bg-card p-5 transition-all shadow-sm flex flex-col gap-4 relative ${
                    song.selected ? "border-primary/40 ring-1 ring-primary/10" : "border-border opacity-70"
                  }`}
                >
                  {/* Select checkmark and file tag */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={song.selected}
                        onChange={() => toggleSongSelection(index)}
                        className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-muted max-w-[180px] truncate">
                        File: {song.fileName}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => deleteExtractedSong(index)}
                      className="text-muted hover:text-red-500 text-sm font-medium transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Title, Artist & Language */}
                  <div className="grid gap-3 grid-cols-3">
                    <div>
                      <label htmlFor={`title-${song.id}`} className={labelClass}>
                        Song Title
                      </label>
                      <input
                        id={`title-${song.id}`}
                        type="text"
                        value={song.title}
                        onChange={(e) => updateSongField(index, "title", e.target.value)}
                        placeholder="Untitled Song"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`artist-${song.id}`} className={labelClass}>
                        Artist / Band
                      </label>
                      <input
                        id={`artist-${song.id}`}
                        type="text"
                        value={song.artist || ""}
                        onChange={(e) => updateSongField(index, "artist", e.target.value)}
                        placeholder="e.g. Bethel Music"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`lang-${song.id}`} className={labelClass}>
                        Language
                      </label>
                      <select
                        id={`lang-${song.id}`}
                        value={song.language}
                        onChange={(e) => updateSongField(index, "language", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Language</option>
                        {languages.map((lang) => (
                          <option key={lang.slug} value={lang.slug}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <span className={labelClass}>Category</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {categories.map((cat) => {
                        const checked = song.categories.includes(cat.slug);
                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => toggleSongCategory(index, cat.slug)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all cursor-pointer ${
                              checked
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border bg-card text-muted hover:bg-section"
                            }`}
                          >
                            {cat.icon} {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lyrics Preview Block */}
                  <div className="bg-section/60 border border-border/40 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-xs text-muted leading-normal whitespace-pre-wrap">
                    {song.lyricsBlocks.length > 0
                      ? song.lyricsBlocks.map((b) => `[${b.label}]\n${b.lines.join("\n")}`).join("\n\n")
                      : "(No lyrics)"}
                  </div>

                  {/* Edit blocks triggers */}
                  <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/30">
                    <button
                      type="button"
                      onClick={() => setEditingSongIndex(index)}
                      className="text-sm font-semibold text-primary hover:text-primary-light flex items-center gap-1 cursor-pointer"
                    >
                      ✏️ Edit Lyric Blocks ({song.lyricsBlocks.length})
                    </button>
                    <span className="text-xs text-muted font-medium">
                      {song.lyricsBlocks.flatMap((b) => b.lines).length} lines total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error messages */}
          {saveErrors.map((err, idx) => (
            <div key={idx} className="rounded-xl bg-red-50 border border-red-200 p-4 text-base text-red-700">
              {err}
            </div>
          ))}

          {/* Action button */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
            <button
              onClick={handleImportAll}
              disabled={isSaving || selectedCount === 0}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-6 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
            >
              {isSaving ? "Saving batch..." : `Import ${selectedCount} Songs as Pending Review`}
            </button>
            <button
              onClick={() => setStep("upload")}
              className="rounded-xl border border-border bg-card px-5 py-4 text-base font-semibold text-foreground hover:bg-section transition-colors"
            >
              Upload More Files
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: SUCCESS PAGE ── */}
      {step === "success" && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center shadow-sm max-w-xl mx-auto">
          <span className="text-5xl" role="img" aria-label="Success check">
            🎉
          </span>
          <h2 className="mt-4 text-2xl font-semibold">Bulk Lyrics Imported!</h2>
          <p className="mt-2 text-base text-muted">
            The songs have been successfully processed, split, formatted, and saved to the database. They are
            now in the Review Queue waiting for moderator approval.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin/songs"
              className="rounded-xl bg-primary px-5 py-3 text-base font-bold text-white shadow-md shadow-primary/10 transition-colors hover:bg-primary-light"
            >
              Go to Songs List
            </Link>
            <button
              onClick={() => {
                setSongs([]);
                setFilesStatus([]);
                setStep("upload");
              }}
              className="rounded-xl border border-border bg-card px-5 py-3 text-base font-semibold text-foreground hover:bg-section"
            >
              Import More Songs
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL WORKSPACE FOR EDITING LYRICS BLOCKS ── */}
      {editingSongIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between border-b border-border p-4 bg-section">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Edit Blocks: {songs[editingSongIndex].title || "Untitled Song"}
                </h3>
                <p className="text-xs text-muted">File source: {songs[editingSongIndex].fileName}</p>
              </div>
              <button
                onClick={() => setEditingSongIndex(null)}
                className="rounded-xl p-2 hover:bg-border/60 text-muted hover:text-foreground text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 text-sm text-muted">
                Rearrange blocks, change labels, edit spelling and stanza line splits directly below.
              </div>
              <LyricsBlockEditor
                blocks={songs[editingSongIndex].lyricsBlocks}
                onChange={(nextBlocks) => {
                  setSongs((prev) =>
                    prev.map((s, idx) => (idx === editingSongIndex ? { ...s, lyricsBlocks: nextBlocks } : s))
                  );
                }}
              />
            </div>

            <div className="border-t border-border p-4 bg-section flex justify-end">
              <button
                onClick={() => setEditingSongIndex(null)}
                className="rounded-xl bg-primary px-6 py-2.5 text-base font-semibold text-white shadow-md shadow-primary/10 transition-colors hover:bg-primary-light cursor-pointer"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
