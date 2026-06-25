"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LyricsFormatStep from "./LyricsFormatStep";
import LyricsPasteStep, { type PasteStepData } from "./LyricsPasteStep";
import LyricsReviewStep from "./LyricsReviewStep";
import { createAdminSong, updateAdminSong } from "@/lib/admin-store";
import {
  autoFormatLyrics,
  cleanRawLyrics,
  parseExistingLyrics,
} from "@/lib/lyrics-formatting";
import {
  canPublish,
  generateSlug,
  type AdminSong,
  type SongStatus,
} from "@/lib/admin-types";
import {
  blocksToLyricsString,
  rawToSingleBlock,
  type LyricsBlock,
} from "@/lib/lyrics-section-detector";

type AdminLyricsWorkflowProps = {
  song?: AdminSong;
};

type Step = 1 | 2 | 3;

const STEPS: { num: Step; label: string }[] = [
  { num: 1, label: "Paste" },
  { num: 2, label: "Format" },
  { num: 3, label: "Preview" },
];

export default function AdminLyricsWorkflow({ song }: AdminLyricsWorkflowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [pasteData, setPasteData] = useState<PasteStepData>({
    title: song?.title ?? "",
    language: song?.language ?? "",
    categories: song?.categories ?? [],
    sourceUrl: song?.sourceUrl ?? "",
    rightsStatus: song?.rightsStatus ?? "unknown",
    rawLyrics: song?.rawLyrics ?? song?.lyrics ?? "",
  });

  const [blocks, setBlocks] = useState<LyricsBlock[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [slug, setSlug] = useState(song?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(song?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(song?.seoDescription ?? "");
  const [rightsWarning, setRightsWarning] = useState(false);
  const [pasteErrors, setPasteErrors] = useState<
    Partial<Record<keyof PasteStepData, string>>
  >({});

  useEffect(() => {
    if (song?.slug) return;
    if (pasteData.title) {
      setSlug(generateSlug(pasteData.title));
    }
  }, [pasteData.title, song?.slug]);

  useEffect(() => {
    if (song && blocks.length === 0) {
      const parsed = parseExistingLyrics(song.lyrics);
      if (parsed.length > 0) {
        setBlocks(parsed);
      }
    }
  }, [song, blocks.length]);

  function validatePaste(): boolean {
    const errors: Partial<Record<keyof PasteStepData, string>> = {};
    if (!pasteData.title.trim()) errors.title = "Song title is required.";
    if (!pasteData.language) errors.language = "Please select a language.";
    if (pasteData.categories.length === 0)
      errors.categories = "Select at least one category.";
    if (!pasteData.rawLyrics.trim())
      errors.rawLyrics = "Please paste lyrics first.";
    setPasteErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function runAutoFormat() {
    if (!validatePaste()) return;
    const cleaned = cleanRawLyrics(pasteData.rawLyrics);
    setPasteData((prev) => ({ ...prev, rawLyrics: cleaned }));
    const result = autoFormatLyrics(cleaned);
    setBlocks(result.blocks);
    setDuplicateWarning(result.hasDuplicateWarning);
    setStep(2);
  }

  function continueWithoutFormat() {
    if (!validatePaste()) return;
    const cleaned = cleanRawLyrics(pasteData.rawLyrics);
    setPasteData((prev) => ({ ...prev, rawLyrics: cleaned }));
    setBlocks([rawToSingleBlock(cleaned)]);
    setDuplicateWarning(false);
    setStep(2);
  }

  function reformat() {
    const result = autoFormatLyrics(pasteData.rawLyrics);
    setBlocks(result.blocks);
    setDuplicateWarning(result.hasDuplicateWarning);
  }

  function continueToPreview() {
    const validBlocks = blocks.filter(
      (b) => b.lines.some((l) => l.trim()) || b.label.trim()
    );
    if (validBlocks.length === 0) {
      alert("Please add at least one block with lyrics.");
      return;
    }
    setBlocks(validBlocks);
    setStep(3);
  }

  function handleSave(status: SongStatus) {
    if (!pasteData.title.trim()) {
      setStep(1);
      setPasteErrors({ title: "Song title is required." });
      return;
    }

    const lyrics = blocksToLyricsString(blocks);
    if (!lyrics.trim()) {
      setStep(2);
      return;
    }

    if (status === "published" && !canPublish(pasteData.rightsStatus)) {
      setRightsWarning(true);
      return;
    }

    setRightsWarning(false);

    const data = {
      title: pasteData.title.trim(),
      slug: slug || generateSlug(pasteData.title),
      categories: pasteData.categories,
      language: pasteData.language,
      lyrics,
      rawLyrics: pasteData.rawLyrics,
      seoTitle,
      seoDescription,
      sourceUrl: pasteData.sourceUrl,
      rightsStatus: pasteData.rightsStatus,
      status,
    };

    if (song) {
      updateAdminSong(song.id, data);
    } else {
      createAdminSong(data);
    }

    router.push("/admin/songs");
  }

  return (
    <div>
      {/* Step indicator */}
      <nav
        className="mb-8 flex items-center justify-center gap-2 sm:gap-4"
        aria-label="Progress"
      >
        {STEPS.map(({ num, label }, index) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${
                step === num
                  ? "bg-primary text-white"
                  : step > num
                    ? "bg-primary/20 text-primary"
                    : "bg-section text-muted"
              }`}
            >
              {num}
            </div>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                step === num ? "text-foreground" : "text-muted"
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className="mx-1 text-muted sm:mx-2">→</span>
            )}
          </div>
        ))}
      </nav>

      {step === 1 && (
        <LyricsPasteStep
          data={pasteData}
          errors={pasteErrors}
          onChange={(data) => {
            setPasteData(data);
            setPasteErrors({});
          }}
          onAutoFormat={runAutoFormat}
          onContinue={continueWithoutFormat}
        />
      )}

      {step === 2 && (
        <LyricsFormatStep
          blocks={blocks}
          rawLyrics={pasteData.rawLyrics}
          duplicateWarning={duplicateWarning}
          onBlocksChange={setBlocks}
          onBack={() => setStep(1)}
          onContinue={continueToPreview}
          onReformat={reformat}
        />
      )}

      {step === 3 && (
        <LyricsReviewStep
          title={pasteData.title}
          slug={slug}
          categories={pasteData.categories}
          language={pasteData.language}
          blocks={blocks}
          rawLyrics={pasteData.rawLyrics}
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          sourceUrl={pasteData.sourceUrl}
          rightsStatus={pasteData.rightsStatus}
          status={song?.status ?? "draft"}
          rightsWarning={rightsWarning}
          onSeoTitleChange={setSeoTitle}
          onSeoDescriptionChange={setSeoDescription}
          onBack={() => setStep(2)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
