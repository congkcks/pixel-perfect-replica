import { countVocabulary, parseFrontmatter, stringifyFrontmatter } from "./markdown";
import { TOTAL_DAYS, fileNameFor, type Lesson } from "./lessons-core";

export type LessonDraft = {
  day: number;
  title: string;
  date: string;
  category: string;
  level: string;
  duration: number;
  pdfUrl: string;
  description: string;
  content: string;
  completed: boolean;
};

export const CATEGORIES = [
  "Speaking",
  "Listening",
  "Reading",
  "Writing",
  "Grammar",
  "Vocabulary",
  "Communication",
  "General",
];
export const LEVELS = ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"];

export function emptyDraft(day = 1): LessonDraft {
  return {
    day,
    title: "",
    date: "",
    category: "Speaking",
    level: "Beginner",
    duration: 60,
    pdfUrl: "",
    description: "",
    content: "",
    completed: true,
  };
}

export function draftFromLesson(l: Lesson): LessonDraft {
  return {
    day: l.day,
    title: l.title,
    date: l.date,
    category: l.category,
    level: l.level,
    duration: l.duration,
    pdfUrl: l.pdfUrl,
    description: l.description,
    content: l.content.trim(),
    completed: l.completed ?? true,
  };
}

/** Parse an imported .md file; metadata missing from the file keeps the current value. */
export function draftFromMarkdown(raw: string, fallback: LessonDraft, fileName = ""): LessonDraft {
  const { data, content } = parseFrontmatter(raw);
  const fromName = Number(fileName.match(/day-(\d+)/i)?.[1]);
  const day = Number(data["day"] ?? fromName);
  const str = (k: string, cur: string) => (data[k] === undefined ? cur : String(data[k]));
  return {
    day: Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS ? day : fallback.day,
    title: str("title", fallback.title),
    date: str("date", fallback.date),
    category: str("category", fallback.category),
    level: str("level", fallback.level),
    duration: data["duration"] === undefined ? fallback.duration : Number(data["duration"]) || 0,
    pdfUrl: str("pdf_url", fallback.pdfUrl),
    description: str("description", fallback.description),
    content: content.trim(),
    completed:
      data["completed"] !== undefined ? Boolean(data["completed"]) : (fallback.completed ?? true),
  };
}

export function draftToMarkdown(d: LessonDraft): string {
  return stringifyFrontmatter(
    {
      day: d.day,
      title: d.title,
      date: d.date,
      category: d.category,
      level: d.level,
      duration: d.duration,
      pdf_url: d.pdfUrl,
      description: d.description,
      completed: d.completed ?? true,
    },
    d.content,
  );
}

export const exportFileName = (d: LessonDraft) => fileNameFor(d.day);

export function draftToLesson(d: LessonDraft): Lesson {
  return {
    ...d,
    raw: draftToMarkdown(d),
    vocabCount: countVocabulary(d.content),
    fileName: exportFileName(d),
    completed: d.completed ?? true,
  };
}
