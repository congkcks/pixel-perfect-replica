import fs from "node:fs";
import path from "node:path";
import { buildLessons, computeStats, type Lesson } from "./lessons-core";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

export function getLessonsFromDisk(): Lesson[] {
  if (!fs.existsSync(LESSONS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".md"));
  const sources: Record<string, string> = {};

  for (const file of files) {
    const fullPath = path.join(LESSONS_DIR, file);
    try {
      sources[file] = fs.readFileSync(fullPath, "utf-8");
    } catch (err) {
      console.error(`Không thể đọc file ${fullPath}:`, err);
    }
  }

  return buildLessons(sources);
}

export function getLessonByDayFromDisk(day: number): Lesson | undefined {
  const all = getLessonsFromDisk();
  return all.find((l) => l.day === day);
}

export function getStatsFromDisk() {
  const all = getLessonsFromDisk();
  return computeStats(all);
}
