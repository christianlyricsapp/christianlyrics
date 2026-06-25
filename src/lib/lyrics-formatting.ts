import {
  createBlockId,
  detectDuplicateLines,
  detectSectionLabel,
  isLikelyAllCaps,
  suggestBlockLabel,
  type LyricsBlock,
} from "./lyrics-section-detector";

export { detectDuplicateLines };

const SACRED_WORDS: Record<string, string> = {
  god: "God",
  jesus: "Jesus",
  lord: "Lord",
  christ: "Christ",
  bible: "Bible",
  amen: "Amen",
  "holy spirit": "Holy Spirit",
};

export function cleanRawLyrics(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function smartCaseLine(line: string): string {
  if (!line.trim()) return line;
  if (!isLikelyAllCaps(line)) return line;

  let result = line.toLowerCase();

  for (const [lower, proper] of Object.entries(SACRED_WORDS)) {
    const regex = new RegExp(`\\b${lower.replace(" ", "\\s+")}\\b`, "gi");
    result = result.replace(regex, proper);
  }

  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => {
    return prefix + char.toUpperCase();
  });

  if (/^[a-z]/.test(result)) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

export function formatLine(line: string): string {
  return smartCaseLine(line.trim());
}

export type FormatResult = {
  blocks: LyricsBlock[];
  hasDuplicateWarning: boolean;
};

export function autoFormatLyrics(raw: string): FormatResult {
  const cleaned = cleanRawLyrics(raw);
  const lines = cleaned.split("\n");

  const blocks: LyricsBlock[] = [];
  let currentLabel = "";
  let currentLines: string[] = [];

  function flushBlock() {
    const formattedLines = currentLines
      .map(formatLine)
      .filter((l) => l.length > 0);
    if (formattedLines.length > 0 || currentLabel) {
      blocks.push({
        id: createBlockId(),
        label: currentLabel || "",
        lines: formattedLines,
      });
    }
    currentLabel = "";
    currentLines = [];
  }

  for (const line of lines) {
    const detected = detectSectionLabel(line);
    if (detected) {
      flushBlock();
      currentLabel = detected;
    } else if (line.trim() === "") {
      if (currentLines.length > 0) {
        flushBlock();
      }
    } else {
      currentLines.push(line);
    }
  }
  flushBlock();

  const nonEmptyBlocks = blocks.filter((b) => b.lines.length > 0);

  if (nonEmptyBlocks.length === 0) {
    return { blocks: [], hasDuplicateWarning: false };
  }

  const foundExplicitLabels = blocks.some((b) => b.label !== "");

  let finalBlocks: LyricsBlock[];

  if (!foundExplicitLabels) {
    finalBlocks = chunkLinesIntoBlocks(
      nonEmptyBlocks.flatMap((b) => b.lines)
    );
  } else {
    finalBlocks = nonEmptyBlocks.map((b) => ({
      ...b,
      label: b.label || "Verse 1",
    }));
  }

  const allLines = finalBlocks.flatMap((b) => b.lines);

  return {
    blocks: finalBlocks,
    hasDuplicateWarning: detectDuplicateLines(allLines),
  };
}

function chunkLinesIntoBlocks(lines: string[]): LyricsBlock[] {
  const formatted = lines.map(formatLine).filter((l) => l.length > 0);
  if (formatted.length === 0) return [];

  const chunkSize = formatted.length <= 6 ? 4 : 5;
  const totalChunks = Math.ceil(formatted.length / chunkSize);
  const blocks: LyricsBlock[] = [];

  for (let i = 0; i < formatted.length; i += chunkSize) {
    const chunk = formatted.slice(i, i + chunkSize);
    const blockIndex = blocks.length;
    blocks.push({
      id: createBlockId(),
      label: suggestBlockLabel(blockIndex, totalChunks),
      lines: chunk,
    });
  }

  return blocks;
}

export function parseExistingLyrics(lyrics: string): LyricsBlock[] {
  const result = autoFormatLyrics(lyrics);
  if (result.blocks.length > 0) return result.blocks;
  return [];
}
