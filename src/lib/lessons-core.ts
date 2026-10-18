import { countVocabulary, parseFrontmatter, stringifyFrontmatter } from "./markdown";
import type { LessonDraft } from "./lesson-file";

export const TOTAL_DAYS = 100;
export const STORAGE_KEY = "vvhc_stored_lessons";
export const LESSONS_CHANGED_EVENT = "vvhc_lessons_changed";

export type Lesson = {
  day: number;
  title: string;
  date: string;
  category: string;
  level: string;
  duration: number;
  pdfUrl: string;
  description: string;
  content: string;
  raw: string;
  vocabCount: number;
  fileName: string;
  completed: boolean;
};

export const pad = (n: number, len = 2) => String(n).padStart(len, "0");
export const fileNameFor = (day: number) => `day-${pad(day, 3)}.md`;

export function draftToLessonObject(d: LessonDraft): Lesson {
  return {
    day: d.day,
    title: d.title,
    date: d.date,
    category: d.category,
    level: d.level,
    duration: d.duration,
    pdfUrl: d.pdfUrl,
    description: d.description,
    content: d.content,
    raw: stringifyFrontmatter(
      {
        day: d.day,
        title: d.title,
        date: d.date,
        category: d.category,
        level: d.level,
        duration: d.duration,
        pdf_url: d.pdfUrl,
        description: d.description,
        completed: d.completed,
      },
      d.content,
    ),
    vocabCount: countVocabulary(d.content),
    fileName: fileNameFor(d.day),
    completed: d.completed ?? true,
  };
}

export function parseLesson(raw: string, fileName = ""): Lesson | null {
  const { data, content } = parseFrontmatter(raw);
  const fromName = fileName.match(/day-(\d+)/i)?.[1];
  const day = Number(data["day"] ?? fromName);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) return null;
  return {
    day,
    title: String(data["title"] ?? `Ngày ${day}`),
    date: String(data["date"] ?? ""),
    category: String(data["category"] ?? "General"),
    level: String(data["level"] ?? ""),
    duration: Number(data["duration"]) || 0,
    pdfUrl: String(data["pdf_url"] ?? ""),
    description: String(data["description"] ?? ""),
    content,
    raw,
    vocabCount: countVocabulary(content),
    fileName,
    completed: data["completed"] !== undefined ? Boolean(data["completed"]) : true,
  };
}

/** Build a deduplicated, day-sorted lesson list (first file wins per day). */
export function buildLessons(sources: Record<string, string>): Lesson[] {
  const byDay = new Map<number, Lesson>();
  for (const path of Object.keys(sources).sort()) {
    const name = path.split("/").pop() ?? path;
    const lesson = parseLesson(sources[path] ?? "", name);
    if (lesson && !byDay.has(lesson.day)) byDay.set(lesson.day, lesson);
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

export function computeStats(list: Lesson[]) {
  const completed = list.filter((l) => l.completed ?? true).length;
  const totalMinutes = list.reduce((s, l) => s + l.duration, 0);
  const latest = [...list].sort(
    (a, b) => (b.date || "").localeCompare(a.date || "") || b.day - a.day,
  );
  return {
    completed,
    progress: Math.round((completed / TOTAL_DAYS) * 1000) / 10,
    hours: Math.round((totalMinutes / 60) * 10) / 10,
    vocab: list.reduce((s, l) => s + l.vocabCount, 0),
    latest,
  };
}

export function formatDate(date: string) {
  if (!date) return "";
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return date;
  return `${d.getDate()} Thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
}

/** Extract vocabulary rows from lesson tables for the vocabulary page. */
export function extractVocabulary(lesson: Lesson) {
  const rows: { word: string; ipa: string; meaning: string; day: number }[] = [];
  const lines = lesson.content.split("\n");
  let inVocab = false;
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? "").trim();
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) {
      inVocab = /từ vựng|vocabulary/i.test(h[1] ?? "");
      continue;
    }
    if (line.startsWith("|") && /^\|?\s*:?-{2,}/.test(lines[i + 1]?.trim() ?? "")) {
      const first =
        line
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean)[0] ?? "";
      const isVocab = inVocab || /^(english|từ vựng|word|vocabulary|từ)$/i.test(first);
      let j = i + 2;
      while (j < lines.length && (lines[j] ?? "").trim().startsWith("|")) {
        if (isVocab) {
          const c = (lines[j] ?? "")
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((x) => x.trim());
          rows.push({ word: c[0] ?? "", ipa: c[1] ?? "", meaning: c[2] ?? "", day: lesson.day });
        }
        j++;
      }
      i = j - 1;
    }
  }
  return rows;
}
