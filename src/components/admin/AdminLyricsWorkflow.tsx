"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import LyricsFormatStep from "./LyricsFormatStep";
import LyricsPasteStep, { type PasteStepData } from "./LyricsPasteStep";
import LyricsReviewStep from "./LyricsReviewStep";
import { createAdminSong, updateAdminSong, getAdminRole } from "@/lib/admin-store";
import {
  autoFormatLyrics,
  cleanRawLyrics,
  parseExistingLyrics,
  detectTitle,
  detectLanguage,
  toTitleCase,
} from "@/lib/lyrics-formatting";
import { categories, languages } from "@/lib/demo-data";
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
  initialStep?: Step;
};

type Step = 1 | 2 | 3;

const STEPS: { num: Step; label: string }[] = [
  { num: 1, label: "Paste" },
  { num: 2, label: "Format" },
  { num: 3, label: "Preview" },
];

export default function AdminLyricsWorkflow({ song, initialStep = 1 }: AdminLyricsWorkflowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");

  useEffect(() => {
    getAdminRole().then(setRole);
  }, []);

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

  // Auto-detect language when title changes and language is empty
  useEffect(() => {
    if (!pasteData.title.trim() || pasteData.language) return;
    const detected = detectLanguage(pasteData.title);
    if (detected) {
      setPasteData((prev) => ({ ...prev, language: detected }));
    }
  }, [pasteData.title, pasteData.language]);

  const autoFilledSeoRef = useRef({ seoTitle: false, seoDescription: false });

  // Auto-generate SEO values if empty when entering step 3
  useEffect(() => {
    if (step !== 3) return;

    if (!pasteData.title) {
      autoFilledSeoRef.current.seoTitle = false;
      autoFilledSeoRef.current.seoDescription = false;
      return;
    }

    if (!seoTitle.trim() && !autoFilledSeoRef.current.seoTitle) {
      setSeoTitle(`${toTitleCase(pasteData.title)} Lyrics`);
      autoFilledSeoRef.current.seoTitle = true;
    }

    if (!seoDescription.trim() && !autoFilledSeoRef.current.seoDescription && blocks.length > 0) {
      const categoryNames = pasteData.categories
        .map((c) => {
          const cat = categories.find((cat) => cat.slug === c);
          return cat ? cat.name : c;
        })
        .join(", ");

      const lang = languages.find((l) => l.slug === pasteData.language);
      const languageName = lang ? lang.name : pasteData.language;

      // Extract the first 2 lines of lyrics for a nice snippet
      const lyricsBody = blocks
        .flatMap((b) => b.lines)
        .filter((l) => l.trim() && !l.startsWith("["))
        .slice(0, 2)
        .join(" / ");

      const snippet = lyricsBody ? ` "${lyricsBody}"` : "";

      const desc = `Read the full lyrics for "${toTitleCase(pasteData.title)}" Christian song.${snippet} Categorized under ${categoryNames || "Worship"} in ${languageName || "English"}.`;
      setSeoDescription(desc.slice(0, 160));
      autoFilledSeoRef.current.seoDescription = true;
    }
  }, [step, pasteData.title, pasteData.language, pasteData.categories, blocks, seoTitle, seoDescription]);

  const lastDetectedRef = useRef("");

  useEffect(() => {
    const raw = pasteData.rawLyrics.trim();
    if (!raw) {
      lastDetectedRef.current = "";
      return;
    }
    
    if (raw === lastDetectedRef.current) return;
    lastDetectedRef.current = raw;

    const updates: Partial<PasteStepData> = {};
    
    if (!pasteData.title.trim()) {
      const detected = detectTitle(raw);
      if (detected) updates.title = detected;
    }
    
    if (!pasteData.language) {
      updates.language = detectLanguage(raw);
    }
    
    if (pasteData.categories.length === 0) {
      updates.categories = ["worship"];
    }

    if (Object.keys(updates).length > 0) {
      setPasteData((prev) => ({ ...prev, ...updates }));
    }
  }, [pasteData.rawLyrics, pasteData.title, pasteData.language, pasteData.categories.length]);

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

  function handleSave(status: SongStatus, finalBlocks?: LyricsBlock[]) {
    if (!pasteData.title.trim()) {
      setStep(1);
      setPasteErrors({ title: "Song title is required." });
      return;
    }

    const blocksToUse = finalBlocks || blocks;
    const lyrics = blocksToLyricsString(blocksToUse);
    if (!lyrics.trim()) {
      setStep(2);
      return;
    }

    const finalStatus = role === "volunteer" ? "needs-review" : status;

    if (finalStatus === "published" && !canPublish(pasteData.rightsStatus)) {
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
      seoTitle: role === "volunteer" ? "" : seoTitle,
      seoDescription: role === "volunteer" ? "" : seoDescription,
      sourceUrl: role === "volunteer" ? "" : pasteData.sourceUrl,
      rightsStatus: role === "volunteer" ? "unknown" : pasteData.rightsStatus,
      status: finalStatus,
    };

    const action = song
      ? updateAdminSong(song.id, data)
      : createAdminSong(data);

    action.then(() => {
      router.push("/admin/songs");
    });
  }

  return (
    <div>
      {/* Step indicator */}
      <nav
        className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
        aria-label="Progress"
      >
        {STEPS.map(({ num, label }, index) => (
          <div key={num} className="flex flex-1 items-center justify-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                step === num
                  ? "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110"
                  : step > num
                    ? "bg-green-500/20 text-green-400"
                    : "bg-section text-muted"
              }`}
            >
              {step > num ? "✓" : num}
            </div>
            <span
              className={`text-sm font-semibold transition-colors duration-300 ${
                step === num ? "text-foreground" : "text-muted"
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className="mx-2 text-muted/30">/</span>
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
          hideSourceFields={role === "volunteer"}
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
          hideAdvancedFields={role === "volunteer"}
          onTitleChange={(t) => setPasteData((prev) => ({ ...prev, title: t }))}
          onBlocksChange={setBlocks}
        />
      )}
    </div>
  );
}
