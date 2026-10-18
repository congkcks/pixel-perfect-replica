"use client";

import { DayGrid, LessonCard, ProgressBar } from "@/components/public/shared";
import { TOTAL_DAYS, useLessons } from "@/lib/lessons";

export function JourneyClient() {
  const { lessons: dynamicLessons, stats: dynamicStats } = useLessons();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Nhật Ký 100 Ngày Học Tiếng Anh</h1>
      <p className="mt-1 text-muted-foreground">
        Đã hoàn thành {dynamicStats.completed} / {TOTAL_DAYS} ngày
        {dynamicLessons.length > dynamicStats.completed && (
          <span className="ml-2 text-xs text-chart-4">
            ({dynamicLessons.length - dynamicStats.completed} bài đang học)
          </span>
        )}
      </p>
      <div className="mt-4 max-w-md">
        <ProgressBar value={dynamicStats.progress} />
      </div>
      <div className="card-soft mt-8 p-6">
        <DayGrid />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicLessons.map((l, i) => (
          <LessonCard key={l.day} lesson={l} index={i} />
        ))}
      </div>
    </div>
  );
}
