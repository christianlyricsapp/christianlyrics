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

export function detectTitle(raw: string): string {
  if (!raw || !raw.trim()) return "";
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  
  for (const line of lines) {
    const match = line.match(/^(title|song\s*name|song|name)\s*:\s*(.+)$/i);
    if (match) {
      return match[2].trim();
    }
  }

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
    if (cleaned.length > 0 && cleaned.length < 80) {
      return cleaned;
    }
  }

  if (lines.length > 0) {
    return lines[0].replace(/[\[\]():]/g, "").trim();
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
