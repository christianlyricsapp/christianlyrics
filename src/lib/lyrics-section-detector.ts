export const SECTION_LABELS = [
  "Verse 1",
  "Verse 2",
  "Verse 3",
  "Chorus",
  "Bridge",
  "Pre-Chorus",
  "Tag",
  "Ending",
  "Other",
] as const;

export type SectionLabel = (typeof SECTION_LABELS)[number];

export type LyricsBlock = {
  id: string;
  label: string;
  lines: string[];
};

export function createBlockId(): string {
  return crypto.randomUUID();
}

export function blocksToLyricsString(blocks: LyricsBlock[]): string {
  return blocks
    .map((block) => {
      const label = block.label.trim();
      const body = block.lines.join("\n").trim();
      if (!label && !body) return "";
      if (!label) return body;
      if (!body) return `[${label}]`;
      return `[${label}]\n${body}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function suggestBlockLabel(index: number, totalBlocks: number): string {
  if (totalBlocks === 1) return "Verse 1";
  if (index === 0) return "Verse 1";
  if (index === 1 && totalBlocks > 2) return "Chorus";
  if (index % 2 === 0) return `Verse ${Math.floor(index / 2) + 1}`;
  return "Chorus";
}

const LABEL_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /^[\[(]?\s*verse\s*1\s*[\])]?\.?\s*$/i, label: "Verse 1" },
  { pattern: /^[\[(]?\s*verse\s*2\s*[\])]?\.?\s*$/i, label: "Verse 2" },
  { pattern: /^[\[(]?\s*verse\s*3\s*[\])]?\.?\s*$/i, label: "Verse 3" },
  { pattern: /^[\[(]?\s*verse\s*[\])]?\.?\s*$/i, label: "Verse 1" },
  { pattern: /^[\[(]?\s*chorus\s*[\])]?\.?\s*$/i, label: "Chorus" },
  { pattern: /^[\[(]?\s*bridge\s*[\])]?\.?\s*$/i, label: "Bridge" },
  { pattern: /^[\[(]?\s*pre[- ]?chorus\s*[\])]?\.?\s*$/i, label: "Pre-Chorus" },
  { pattern: /^[\[(]?\s*tag\s*[\])]?\.?\s*$/i, label: "Tag" },
  { pattern: /^[\[(]?\s*ending\s*[\])]?\.?\s*$/i, label: "Ending" },
  { pattern: /^[\[(]?\s*intro\s*[\])]?\.?\s*$/i, label: "Other" },
  { pattern: /^[\[(]?\s*outro\s*[\])]?\.?\s*$/i, label: "Ending" },
];

export function detectSectionLabel(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  for (const { pattern, label } of LABEL_PATTERNS) {
    if (pattern.test(trimmed)) return label;
  }

  const bracketMatch = trimmed.match(/^\[(.+)\]$/);
  if (bracketMatch) {
    const inner = bracketMatch[1].trim();
    for (const { pattern, label } of LABEL_PATTERNS) {
      if (pattern.test(`[${inner}]`) || pattern.test(inner)) return label;
    }
    return inner;
  }

  return null;
}

export function isLikelyAllCaps(line: string): boolean {
  const letters = line.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length >= 0.7;
}

export function detectDuplicateLines(lines: string[]): boolean {
  const normalized = lines
    .map((l) => l.toLowerCase().trim())
    .filter(Boolean);
  const counts = new Map<string, number>();
  for (const line of normalized) {
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  return [...counts.values()].some((c) => c >= 3);
}

export function rawToSingleBlock(raw: string): LyricsBlock {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    id: createBlockId(),
    label: "Verse 1",
    lines,
  };
}
