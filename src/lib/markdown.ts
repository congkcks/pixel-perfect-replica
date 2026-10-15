// Minimal, browser-safe YAML frontmatter parser for flat key: value pairs.
export type FrontmatterValue = string | number | boolean;

export function parseFrontmatter(raw: string): { data: Record<string, FrontmatterValue>; content: string } {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, content: text };
  const data: Record<string, FrontmatterValue> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      data[m[1]] = v.slice(1, -1).replace(/\\"/g, '"');
    } else if (v === "true" || v === "false") {
      data[m[1]] = v === "true";
    } else if (v !== "" && !isNaN(Number(v))) {
      data[m[1]] = Number(v);
    } else {
      data[m[1]] = v;
    }
  }
  return { data, content: text.slice(match[0].length) };
}

export function stringifyFrontmatter(data: Record<string, FrontmatterValue>, content: string): string {
  const lines = Object.entries(data).map(([k, v]) =>
    typeof v === "string" ? `${k}: "${v.replace(/"/g, '\\"')}"` : `${k}: ${v}`,
  );
  return `---\n${lines.join("\n")}\n---\n\n${content.trim()}\n`;
}

/** Count rows of vocabulary tables: tables under a "Từ vựng"/"Vocabulary" heading,
 *  or whose first header cell is English/Từ vựng/Word/Vocabulary. */
export function countVocabulary(content: string): number {
  const lines = content.split("\n");
  let count = 0;
  let inVocabSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      inVocabSection = /từ vựng|vocabulary/i.test(heading[1]);
      continue;
    }
    const next = lines[i + 1]?.trim() ?? "";
    if (line.startsWith("|") && /^\|?\s*:?-{2,}/.test(next)) {
      const firstHeader = line.split("|").map((c) => c.trim()).filter(Boolean)[0] ?? "";
      const isVocab = inVocabSection || /^(english|từ vựng|word|vocabulary|từ)$/i.test(firstHeader);
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        if (isVocab) count++;
        j++;
      }
      i = j - 1;
    }
  }
  return count;
}
