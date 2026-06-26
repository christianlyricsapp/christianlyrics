import { toTitleCase } from "./lyrics-formatting";

export type ExtractedSong = {
  title: string;
  rawLyrics: string;
};

/**
 * Splits extracted document text into individual songs based on dividers, titles, or numbering.
 */
export function splitSongsFromText(text: string): ExtractedSong[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  // 1. Try splitting by explicit divider lines (e.g. ---, ===, ***, ___ with optional spaces)
  const dividerRegex = /\n\s*(?:-{3,}|={3,}|\*{3,}|_{3,})\s*\n/g;
  if (dividerRegex.test(normalized)) {
    const parts = normalized.split(dividerRegex);
    return parts
      .map((part) => parseSongFromTextChunk(part))
      .filter((song): song is ExtractedSong => song !== null);
  }

  // 2. Try splitting by lines starting with explicit prefixes (e.g. Title: or Song:)
  const titlePrefixRegex = /(?:^|\n)(?=(?:Title|Song|Song\s+Name|Name)\s*:\s*)/i;
  if (titlePrefixRegex.test(normalized)) {
    const splitByPrefix = normalized.split(titlePrefixRegex);
    return splitByPrefix
      .map((part) => parseSongFromTextChunk(part))
      .filter((song): song is ExtractedSong => song !== null);
  }

  // 3. Try splitting by numbered song titles on new lines (e.g. "1. Song Name" or "1) Song Name")
  const numberedTitleRegex = /(?:^|\n)(?=\d+[\s.\-)]+\s*[A-Z])/;
  if (numberedTitleRegex.test(normalized)) {
    const splitByNumber = normalized.split(numberedTitleRegex);
    return splitByNumber
      .map((part) => parseSongFromTextChunk(part))
      .filter((song): song is ExtractedSong => song !== null);
  }

  // 4. Default: treat the whole text as a single song
  const single = parseSongFromTextChunk(normalized);
  return single ? [single] : [];
}

/**
 * Parses a song title and raw lyrics from a block/chunk of text.
 */
function parseSongFromTextChunk(chunk: string): ExtractedSong | null {
  const lines = chunk
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  let title = "";
  let startIndex = 0;

  const firstLine = lines[0];

  // Try checking "Title: <name>"
  const prefixMatch = firstLine.match(/^(?:title|song\s*name|song|name)\s*:\s*(.+)$/i);
  if (prefixMatch) {
    title = prefixMatch[1].trim();
    startIndex = 1;
  } else {
    // Try checking "1. <name>"
    const numMatch = firstLine.match(/^\d+[\s.\-)]+\s*(.+)$/);
    if (numMatch) {
      title = numMatch[1].trim();
      startIndex = 1;
    } else {
      // Use the first line as a title if it's short and does not look like a verse label
      const isSectionLabel = /^(verse|chorus|bridge|outro|intro|pre-chorus|refrain|interlude|tag|hook)/i.test(
        firstLine
      );
      if (firstLine.length < 80 && !isSectionLabel) {
        title = firstLine;
        startIndex = 1;
      } else {
        title = "Untitled Imported Song";
        startIndex = 0;
      }
    }
  }

  // Retrieve lyrics
  const rawLyrics = lines.slice(startIndex).join("\n").trim();
  return {
    title: toTitleCase(title) || "Untitled Imported Song",
    rawLyrics: rawLyrics || chunk,
  };
}
