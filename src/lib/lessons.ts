"use client";

import { useState, useEffect } from "react";
import type { LessonDraft } from "./lesson-file";
import {
  TOTAL_DAYS,
  STORAGE_KEY,
  LESSONS_CHANGED_EVENT,
  type Lesson,
  pad,
  fileNameFor,
  draftToLessonObject,
  parseLesson,
  buildLessons,
  computeStats,
  formatDate,
  extractVocabulary,
} from "./lessons-core";

export * from "./lessons-core";

const files = import.meta.glob("/content/lessons/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const lessons: Lesson[] = buildLessons(files);
export const stats = computeStats(lessons);

export function getStoredLessons(): Record<number, LessonDraft> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function isLessonCustom(day: number): boolean {
  const stored = getStoredLessons();
  return Boolean(stored[day]);
}

export function syncLessonsWithStorage(): Lesson[] {
  const base = buildLessons(files);
  if (typeof window === "undefined") {
    lessons.splice(0, lessons.length, ...base);
    Object.assign(stats, computeStats(lessons));
    return lessons;
  }

  const stored = getStoredLessons();
  const map = new Map<number, Lesson>();
  for (const l of base) {
    map.set(l.day, l);
  }
  for (const [dayStr, draft] of Object.entries(stored)) {
    const day = Number(dayStr);
    if (Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS) {
      map.set(day, draftToLessonObject(draft));
    }
  }
  const merged = [...map.values()].sort((a, b) => a.day - b.day);
  lessons.splice(0, lessons.length, ...merged);
  Object.assign(stats, computeStats(lessons));
  return lessons;
}

export function saveLessonToStorage(draft: LessonDraft): Lesson {
  const stored = getStoredLessons();
  stored[draft.day] = draft;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    window.dispatchEvent(new CustomEvent(LESSONS_CHANGED_EVENT, { detail: { day: draft.day } }));
  }
  syncLessonsWithStorage();
  return getLesson(draft.day)!;
}

export function deleteLessonFromStorage(day: number): void {
  const stored = getStoredLessons();
  if (stored[day]) {
    delete stored[day];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent(LESSONS_CHANGED_EVENT, { detail: { day } }));
    }
    syncLessonsWithStorage();
  }
}

export function resetStorageLessons(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(LESSONS_CHANGED_EVENT, { detail: { reset: true } }));
  }
  syncLessonsWithStorage();
}

// Auto sync on client import
if (typeof window !== "undefined") {
  syncLessonsWithStorage();
}

export function getLesson(day: number) {
  if (typeof window !== "undefined" && !lessons.length) {
    syncLessonsWithStorage();
  }
  return lessons.find((l) => l.day === day);
}

export function useLessons() {
  const [currentLessons, setCurrentLessons] = useState<Lesson[]>(() => [...lessons]);

  useEffect(() => {
    syncLessonsWithStorage();
    setCurrentLessons([...lessons]);

    const handleUpdate = () => {
      syncLessonsWithStorage();
      setCurrentLessons([...lessons]);
    };

    window.addEventListener(LESSONS_CHANGED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(LESSONS_CHANGED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    lessons: currentLessons,
    stats: computeStats(currentLessons),
    getLesson: (day: number) => currentLessons.find((l) => l.day === day),
    saveLesson: saveLessonToStorage,
    deleteLesson: deleteLessonFromStorage,
    resetLessons: resetStorageLessons,
    isCustom: isLessonCustom,
  };
}
