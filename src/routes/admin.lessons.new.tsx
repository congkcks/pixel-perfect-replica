import { createFileRoute } from "@tanstack/react-router";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { TOTAL_DAYS, useLessons } from "@/lib/lessons";
import { emptyDraft } from "@/lib/lesson-file";

export const Route = createFileRoute("/admin/lessons/new")({
  validateSearch: (s: Record<string, unknown>): { import?: boolean } =>
    s["import"] ? { import: true } : {},
  head: () => ({
    meta: [
      { title: "Tạo bài học – Quản trị" },
      { name: "description", content: "Tạo bài học mới và xuất file Markdown." },
      { property: "og:title", content: "Tạo bài học" },
      { property: "og:description", content: "Tạo bài học mới và xuất file Markdown." },
    ],
  }),
  component: NewLesson,
});

function NewLesson() {
  const { import: openImport } = Route.useSearch();
  const { lessons: dynamicLessons } = useLessons();
  const next =
    Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).find(
      (d) => !dynamicLessons.some((l) => l.day === d),
    ) ?? 1;
  return (
    <LessonEditor heading="Tạo bài học mới" initial={emptyDraft(next)} autoImport={openImport} />
  );
}
