"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { Button } from "@/components/ui/button";
import { getLesson, pad, useLessons } from "@/lib/lessons";
import { draftFromLesson, emptyDraft, type LessonDraft } from "@/lib/lesson-file";

export default function EditLessonPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: dayParam } = use(params);
  const day = Number(dayParam);
  const { getLesson: getDynamicLesson } = useLessons();

  const [draft, setDraft] = useState<LessonDraft | null>(null);

  useEffect(() => {
    const found = getDynamicLesson(day) || getLesson(day);
    if (found) {
      setDraft(draftFromLesson(found));
    } else {
      setDraft(emptyDraft(day));
    }
  }, [day, getDynamicLesson]);

  if (!draft) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <LessonEditor key={day} heading={`Chỉnh sửa Ngày ${pad(day)}`} initial={draft} />;
}
