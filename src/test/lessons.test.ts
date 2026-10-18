import { describe, expect, it } from "vitest";
import { buildLessons, computeStats } from "@/lib/lessons";
import { extractDriveFileId } from "@/lib/google-drive";

const md = (day: number, duration: number, vocabRows = 0) =>
  `---\nday: ${day}\ntitle: "T"\ndate: "2026-10-0${day}"\nduration: ${duration}\n---\n\n## Từ vựng\n\n| English | IPA | VN |\n|---|---|---|\n${"| a | b | c |\n".repeat(vocabRows)}`;

describe("lesson stats", () => {
  it("counts unique days only", () => {
    const list = buildLessons({
      "/a/day-001.md": md(1, 60),
      "/a/day-001-copy.md": md(1, 60),
      "/a/day-002.md": md(2, 30),
    });
    expect(computeStats(list).completed).toBe(2);
  });
  it("progress = completed / 100", () => {
    const list = buildLessons({
      "/a/day-001.md": md(1, 60),
      "/a/day-002.md": md(2, 60),
      "/a/day-003.md": md(3, 60),
    });
    expect(computeStats(list).progress).toBe(3);
  });
  it("hours = total duration / 60", () => {
    const list = buildLessons({ "/a/day-001.md": md(1, 60), "/a/day-002.md": md(2, 30) });
    expect(computeStats(list).hours).toBe(1.5);
  });
  it("vocab counts rows of vocabulary tables", () => {
    const list = buildLessons({ "/a/day-001.md": md(1, 10, 4), "/a/day-002.md": md(2, 10, 2) });
    expect(computeStats(list).vocab).toBe(6);
  });
  it("latest lesson is the most recent date", () => {
    const list = buildLessons({ "/a/day-001.md": md(1, 10), "/a/day-003.md": md(3, 10) });
    expect(computeStats(list).latest[0]?.day).toBe(3);
  });
  it("extracts Google Drive file id", () => {
    expect(extractDriveFileId("https://drive.google.com/file/d/1AbCdEfGhIjK/view")).toBe(
      "1AbCdEfGhIjK",
    );
    expect(extractDriveFileId("https://drive.google.com/open?id=1AbCdEfGhIjK")).toBe(
      "1AbCdEfGhIjK",
    );
  });
  it("counts only completed lessons in stats.completed", () => {
    const mdCompleted = `---\nday: 1\ntitle: "A"\ncompleted: true\n---\nBody`;
    const mdInProgress = `---\nday: 2\ntitle: "B"\ncompleted: false\n---\nBody`;
    const list = buildLessons({ "/a/day-001.md": mdCompleted, "/a/day-002.md": mdInProgress });
    const stats = computeStats(list);
    expect(stats.completed).toBe(1);
    expect(stats.progress).toBe(1);
  });
});
