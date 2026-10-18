import { describe, expect, it } from "vitest";
import { draftFromMarkdown, draftToMarkdown, emptyDraft, exportFileName } from "@/lib/lesson-file";
import { parseLesson } from "@/lib/lessons";

describe("admin markdown import/export", () => {
  it("names exports day-XXX.md", () => {
    expect(exportFileName({ ...emptyDraft(), day: 7 })).toBe("day-007.md");
  });
  it("exported file reads back through the public lesson parser", () => {
    const md = draftToMarkdown({
      ...emptyDraft(12),
      title: 'Say "hi"',
      duration: 45,
      pdfUrl: "https://x",
      content: "# Hi",
    });
    const l = parseLesson(md, "day-012.md");
    expect(l?.day).toBe(12);
    expect(l?.title).toBe('Say "hi"');
    expect(l?.duration).toBe(45);
    expect(l?.pdfUrl).toBe("https://x");
  });
  it("import reads frontmatter into the form", () => {
    const d = draftFromMarkdown('---\nday: 5\ntitle: "T"\npdf_url: "u"\n---\n\nBody', emptyDraft());
    expect([d.day, d.title, d.pdfUrl, d.content]).toEqual([5, "T", "u", "Body"]);
  });
  it("rejects days outside 1-100", () => {
    expect(draftFromMarkdown("---\nday: 101\n---\nx", emptyDraft(3)).day).toBe(3);
  });
  it("preserves completed status in markdown frontmatter", () => {
    const md = draftToMarkdown({
      ...emptyDraft(15),
      title: "Learning verbs",
      completed: false,
    });
    expect(md).toContain("completed: false");
    const parsed = draftFromMarkdown(md, emptyDraft(15));
    expect(parsed.completed).toBe(false);
  });
});
