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

const GARBAGE_PATTERNS = [
  /ads\s*by\s*google/i,
  /advertisement/i,
  /share\s*this/i,
  /follow\s*us/i,
  /submit\s*corrections/i,
  /browse\s*more\s*lyrics/i,
  /you\s*might\s*also\s*like/i,
  /lyrics\s*powered\s*by/i,
  /reproduction\s*without\s*permission/i,
  /copyright\s*@/i,
  /all\s*rights\s*reserved/i,
  // Metadata / header filtering patterns
  /^\s*lyrics\s*$/i,
  /^\s*song\s*lyrics\s*$/i,
  /^\s*lyrics\s*of\s+/i,
  /^\s*written\s*by\s+/i,
  /^\s*composed\s*by\s+/i,
  /^\s*arranged\s*by\s+/i,
  /^\s*music\s*by\s+/i,
  /^\s*lyrics\s*by\s+/i,
  /^\s*singer\s*:\s*/i,
  /^\s*artist\s*:\s*/i,
];

export function cleanRawLyrics(raw: string): string {
  // Strip HTML tags first
  const cleanHtml = raw.replace(/<\/?[^>]+(>|$)/g, "");

  return cleanHtml
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => {
      if (!line) return true; // keep empty lines for segment splitting
      return !GARBAGE_PATTERNS.some((pattern) => pattern.test(line));
    })
    .map((line) => {
      // Remove starting numbers like "1. " or "1) " or "1 - "
      return line.replace(/^\d+[\s.\-)]+\s*/, "");
    })
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

export function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(/\b([a-zA-Z])/g, (char) => char.toUpperCase());
}

export function splitParagraphIntoLines(text: string): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentLength = 0;

  // Words that are ideal for starting a new line/clause
  const startLineWords = new Set([
    "or", "and", "but", "if", "so", "that", "with", "when", "as", "for",
    "because", "yet", "such", "like", "in", "on", "at", "by", "to", "from", "can"
  ]);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordLen = word.length;

    if (currentLine.length > 0) {
      const potentialLength = currentLength + 1 + wordLen;

      // Wrap conditions:
      // - Too long: line exceeds 45 characters or 10 words
      const isTooLong = potentialLength > 45 || currentLine.length >= 10;

      // - Soft limit: line is long enough and we hit a natural break
      const isModeratelyLong = potentialLength >= 32;
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      const prevWord = currentLine[currentLine.length - 1];
      const isGoodSplitPoint =
        startLineWords.has(cleanWord) ||
        /[.,\/#!$%\^&\*;:{}=\-_`~()?]$/.test(prevWord);

      if (isTooLong || (isModeratelyLong && isGoodSplitPoint)) {
        lines.push(currentLine.join(" "));
        currentLine = [];
        currentLength = 0;
      }
    }

    currentLine.push(word);
    currentLength = currentLine.join(" ").length;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(" "));
  }
  return lines;
}

export type FormatResult = {
  blocks: LyricsBlock[];
  hasDuplicateWarning: boolean;
  detectedArtist?: string;
};

export function autoFormatLyrics(raw: string): FormatResult {
  const cleaned = cleanRawLyrics(raw);
  const rawLines = cleaned.split("\n");

  let detectedArtist = "";
  const filteredRawLines = rawLines.filter((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^[-–—]\s*(.+)$/);
    if (match) {
      const candidate = match[1].trim();
      if (candidate.length > 0 && candidate.length < 50) {
        detectedArtist = toTitleCase(candidate);
        return false;
      }
    }
    return true;
  });

  // Detect if double-spaced: count how many empty lines are sandwiched between non-empty lines
  let emptyCount = 0;
  let nonEmptyCount = 0;
  for (const line of filteredRawLines) {
    if (line.trim() === "") emptyCount++;
    else nonEmptyCount++;
  }
  const isDoubleSpaced = nonEmptyCount > 3 && (emptyCount / nonEmptyCount) > 0.35;

  const lines: string[] = [];
  for (let i = 0; i < filteredRawLines.length; i++) {
    const line = filteredRawLines[i];
    if (isDoubleSpaced && line.trim() === "") {
      // Keep empty line only if it is adjacent to a section label
      const prevLine = i > 0 ? filteredRawLines[i - 1] : "";
      const nextLine = i < filteredRawLines.length - 1 ? filteredRawLines[i + 1] : "";
      const isNearLabel = detectSectionLabel(prevLine) || detectSectionLabel(nextLine);
      if (!isNearLabel) {
        continue;
      }
    }

    if (line.length > 70 && line.split(/\s+/).length > 8) {
      lines.push(...splitParagraphIntoLines(line));
    } else {
      lines.push(line);
    }
  }

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
    return { blocks: [], hasDuplicateWarning: false, detectedArtist };
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
    detectedArtist,
  };
}

function chunkLinesIntoBlocks(lines: string[]): LyricsBlock[] {
  const formatted = lines.map(formatLine).filter((l) => l.length > 0);
  if (formatted.length === 0) return [];

  const targetLinesPerBlock = 4;
  const totalBlocks = Math.max(1, Math.round(formatted.length / targetLinesPerBlock));
  const blocks: LyricsBlock[] = [];
  let lineIndex = 0;

  for (let i = 0; i < totalBlocks; i++) {
    const remainingBlocks = totalBlocks - i;
    const remainingLines = formatted.length - lineIndex;
    const currentBlockSize = Math.ceil(remainingLines / remainingBlocks);

    const chunk = formatted.slice(lineIndex, lineIndex + currentBlockSize);
    lineIndex += currentBlockSize;

    blocks.push({
      id: createBlockId(),
      label: suggestBlockLabel(i, totalBlocks),
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

export function detectTitle(raw: string): string {
  if (!raw || !raw.trim()) return "";
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Explicit title pattern
  for (const line of lines) {
    const match = line.match(/^(title|song\s*name|song|name)\s*:\s*(.+)$/i);
    if (match) {
      return toTitleCase(match[2].trim());
    }
  }

  // 2. Try to find the Chorus block
  let chorusLine = "";
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].toLowerCase();
    if (/^(chorus|refrain)/i.test(line) || (line.startsWith("[") && line.includes("chorus"))) {
      // The next non-empty, non-label line is the start of the chorus!
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (
          nextLine &&
          !(nextLine.startsWith("[") && nextLine.endsWith("]")) &&
          !(nextLine.startsWith("(") && nextLine.endsWith(")")) &&
          !nextLine.endsWith(":") &&
          !/^(verse|chorus|bridge|outro|intro|pre-chorus|refrain|interlude|tag|hook)/i.test(nextLine)
        ) {
          chorusLine = nextLine;
          break;
        }
      }
      if (chorusLine) break;
    }
  }

  // 3. Fallback to first lyrics line if no Chorus found
  let sourceLine = chorusLine;
  if (!sourceLine) {
    for (const line of lines) {
      const cleaned = line.trim();
      if (
        (cleaned.startsWith("[") && cleaned.endsWith("]")) ||
        (cleaned.startsWith("(") && cleaned.endsWith(")")) ||
        cleaned.endsWith(":") ||
        /^(verse|chorus|bridge|outro|intro|pre-chorus|refrain|interlude|tag|hook)/i.test(cleaned)
      ) {
        continue;
      }
      if (cleaned.length > 0) {
        sourceLine = cleaned;
        break;
      }
    }
  }

  if (sourceLine) {
    // Clean punctuation
    const cleanedSource = sourceLine.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim();
    // Take first 4-5 words as title candidate
    const words = cleanedSource.split(" ");
    const titleCandidate = words.slice(0, Math.min(5, words.length)).join(" ");
    return toTitleCase(titleCandidate);
  }

  if (lines.length > 0) {
    return toTitleCase(lines[0].replace(/[\[\]():]/g, "").trim());
  }
  return "";
}

export function detectLanguage(raw: string): string {
  if (!raw || !raw.trim()) return "english";
  const text = raw.toLowerCase();

  let malCharCount = 0;
  let hinCharCount = 0;
  let tamCharCount = 0;
  let telCharCount = 0;
  let kanCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0D00 && code <= 0x0D7F) malCharCount++;
    else if (code >= 0x0900 && code <= 0x097F) hinCharCount++;
    else if (code >= 0x0B80 && code <= 0x0BFF) tamCharCount++;
    else if (code >= 0x0C00 && code <= 0x0C7F) telCharCount++;
    else if (code >= 0x0C80 && code <= 0x0CFF) kanCharCount++;
  }

  const maxScript = Math.max(malCharCount, hinCharCount, tamCharCount, telCharCount, kanCharCount);
  if (maxScript >= 2) {
    if (maxScript === malCharCount) return "malayalam";
    if (maxScript === tamCharCount) return "tamil";
    if (maxScript === telCharCount) return "telugu";
    if (maxScript === kanCharCount) return "kannada";
    if (maxScript === hinCharCount) {
      // Check if it is Marathi (Devanagari Marathi LLA 'ळ' or common Marathi Devanagari words)
      if (text.includes("ळ") || text.includes("ळा") || text.includes("ळे") || text.includes("ळी") || text.includes("ळ्या")) {
        return "marathi";
      }

      const words = text.split(/[\s,.\/#!$%\^&\*;:{}=\-_`~()?]+/);
      const marDevWords = new Set(["आहे", "आहेत", "माझ्या", "तुझ्या", "माझा", "तुझा", "आम्ही", "तुम्ही", "करतो", "करते", "मला", "तुला", "देवा", "माझं", "तुझं", "कृपा"]);
      for (const w of words) {
        if (marDevWords.has(w)) {
          return "marathi";
        }
      }
      return "hindi";
    }
  }

  const words = text.split(/\s+/);

  const malWords = new Set([
    "daivam", "kartha", "yeshu", "sthothram", "aaradhana", "sthuthikkum", "sthuthy",
    "nanni", "enikkaayi", "snehikkum", "kruba", "vachanam", "shakthan", "parishudhan",
    "aathmavu", "pithave", "enikku", "njangal", "karthave", "neeyenne", "daivame", "sthuthi",
    "kripa", "sthothra", "daivathin", "njangalkku", "snehathil", "santhosham"
  ]);

  const hinWords = new Set([
    "prabhu", "masih", "stuti", "aradhana", "pavitra", "pyar", "anugrah", "dhanyavad",
    "jeevan", "raja", "dhanya", "mahima", "karta", "hai", "hain", "mere", "tujhe", "teri",
    "tera", "aaye", "gaye", "karte", "dhanyavaad", "prarthana"
  ]);

  const tamWords = new Set([
    "en", "um", "anbu", "devan", "yesu", "kirubai", "sthothiram", "aaraadhana", "naan",
    "neer", "un", "enakkul", "thuthi", "unthan", "engal", "karthar", "irakkam", "neere",
    "ennai", "tamil", "nalla", "kripathevare"
  ]);

  const telWords = new Set([
    "naa", "nee", "yesu", "deva", "sthothramu", "aaradhana", "sthuthi", "prema", "kruba",
    "naaku", "ninnu", "sevalu", "raaju", "naathodu", "nene", "neevu", "thodu", "sannidhi"
  ]);

  const marWords = new Set([
    "mazya", "tuzya", "majha", "tujha", "maza", "tuza", "ahe", "ahet", "tula", "mala",
    "devacha", "krupa", "aamhi", "tumhi", "karato", "karate", "karat", "mhanun", "yeshula",
    "majhya", "tujhya", "devacha"
  ]);

  let malScore = 0;
  let hinScore = 0;
  let tamScore = 0;
  let telScore = 0;
  let marScore = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (malWords.has(cleanWord)) malScore++;
    if (hinWords.has(cleanWord)) hinScore++;
    if (tamWords.has(cleanWord)) tamScore++;
    if (telWords.has(cleanWord)) telScore++;
    if (marWords.has(cleanWord)) marScore++;
  }

  const maxScore = Math.max(malScore, hinScore, tamScore, telScore, marScore);
  if (maxScore > 0) {
    if (maxScore === malScore) return "malayalam";
    if (maxScore === hinScore) return "hindi";
    if (maxScore === tamScore) return "tamil";
    if (maxScore === telScore) return "telugu";
    if (maxScore === marScore) return "marathi";
  }

  return "english";
}
