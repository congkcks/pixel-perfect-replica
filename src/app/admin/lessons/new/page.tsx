"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { TOTAL_DAYS, useLessons } from "@/lib/lessons";
import { emptyDraft } from "@/lib/lesson-file";

function NewLessonContent() {
  const searchParams = useSearchParams();
  const openImport = searchParams.get("import") === "true";
  const { lessons: dynamicLessons } = useLessons();

  const next =
    Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).find(
      (d) => !dynamicLessons.some((l) => l.day === d),
    ) ?? 1;

  return (
    <LessonEditor heading="Tạo bài học mới" initial={emptyDraft(next)} autoImport={openImport} />
  );
}

export default function NewLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <NewLessonContent />
    </Suspense>
  );
}
