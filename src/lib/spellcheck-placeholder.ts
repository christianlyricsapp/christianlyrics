export type SpellingWarning = {
  word: string;
  suggestion: string;
  lineIndex: number;
};

const COMMON_TYPOS: Record<string, string> = {
  prasie: "praise",
  prasise: "praise",
  wroship: "worship",
  woship: "worship",
  savoir: "Saviour",
  savior: "Savior",
  hallelujha: "hallelujah",
  halelujah: "hallelujah",
  ammen: "Amen",
  jesu: "Jesus",
  chirst: "Christ",
  spiritt: "Spirit",
  holly: "Holy",
  forgivness: "forgiveness",
  redeemption: "redemption",
  comunion: "communion",
  glorius: "glorious",
  mercifuly: "mercifully",
};

export function getSpellingWarnings(text: string): SpellingWarning[] {
  const warnings: SpellingWarning[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const words = line.match(/\b[a-zA-Z']+\b/g) ?? [];
    for (const word of words) {
      const lower = word.toLowerCase();

      if (COMMON_TYPOS[lower]) {
        warnings.push({
          word,
          suggestion: COMMON_TYPOS[lower],
          lineIndex,
        });
        continue;
      }

      if (hasRepeatedLetters(lower) && lower.length >= 5) {
        warnings.push({
          word,
          suggestion: "Check spelling",
          lineIndex,
        });
      }
    }
  });

  return warnings;
}

function hasRepeatedLetters(word: string): boolean {
  return /(.)\1{2,}/.test(word);
}

export function getBlockSpellingWarnings(
  lines: string[]
): SpellingWarning[] {
  return getSpellingWarnings(lines.join("\n"));
}

export function countSpellingWarnings(text: string): number {
  return getSpellingWarnings(text).length;
}
