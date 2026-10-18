"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Gauge,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/navigation/Link";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { PdfViewer } from "@/components/lesson/PdfViewer";
import { ProgressBar, StatTiles } from "@/components/public/shared";
import { TOTAL_DAYS, fileNameFor, formatDate, pad, type Lesson, useLessons } from "@/lib/lessons";
import { cn } from "@/lib/utils";

export function LessonDetailClient({ day, initialLesson }: { day: number; initialLesson: Lesson }) {
  const { lessons: dynamicLessons, stats, getLesson: getDynamicLesson, isCustom } = useLessons();
  const hasCustom = typeof window !== "undefined" && isCustom(day);
  const dynamic = getDynamicLesson(day);
  const lesson = (hasCustom && dynamic && dynamic.content ? dynamic : null) || initialLesson;
  const idx = dynamicLessons.findIndex((l) => l.day === day);
  const prev = dynamicLessons[idx - 1];
  const next = dynamicLessons[idx + 1];
  const lessonMap = new Map(dynamicLessons.map((l) => [l.day, l]));

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
      {/* Sidebar 100 Days */}
      <aside className="hidden lg:block">
        <div className="card-soft sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-3">
          <p className="mb-2 px-2 text-sm font-bold">Hành trình 100 ngày</p>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
            const l = lessonMap.get(d);
            const active = d === day;
            const isCompleted = l?.completed ?? false;
            const inner = (
              <>
                {l ? (
                  isCompleted ? (
                    <CheckCircle2
                      className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-success")}
                    />
                  ) : (
                    <Clock className="h-5 w-5 shrink-0 text-chart-4" />
                  )
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-border" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Ngày {pad(d)}</span>
                  {l && (
                    <span className="block truncate text-xs text-muted-foreground">{l.title}</span>
                  )}
                </span>
              </>
            );
            const cls = cn(
              "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
              active && "bg-accent text-accent-foreground font-semibold",
              !l && "opacity-50",
            );
            return l ? (
              <Link key={d} href={`/journey/day/${d}`} className={cn(cls, "hover:bg-muted")}>
                {inner}
              </Link>
            ) : (
              <div key={d} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Trang chủ
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/journey" className="hover:text-foreground">
                Hành trình
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>Ngày {pad(day)}</span>
            </nav>
            <div className="mt-2 flex items-center gap-2">
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Ngày {pad(day)}: {lesson.title}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  lesson.completed ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4",
                )}
              >
                {lesson.completed ? "Đã hoàn thành" : "Đang học"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {lesson.date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(lesson.date)}
                </span>
              )}
              {lesson.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration} phút
                </span>
              )}
              {lesson.level && (
                <span className="flex items-center gap-1 rounded-full bg-warm px-2.5 py-0.5 text-warm-foreground">
                  <Gauge className="h-4 w-4" />
                  {lesson.level}
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground">
                <Tag className="h-4 w-4" />
                {lesson.category}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {prev && (
              <Button variant="outline" asChild className="rounded-xl">
                <Link href={`/journey/day/${prev.day}`}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Ngày {pad(prev.day)}
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="outline" asChild className="rounded-xl">
                <Link href={`/journey/day/${next.day}`}>
                  Ngày {pad(next.day)}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-2">
          <PdfViewer url={lesson.pdfUrl} />
          <div className="card-soft p-6">
            <div className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Nội dung ghi chú & Bài học
            </div>
            <MarkdownRenderer content={lesson.content} />
          </div>
        </div>
      </main>

      {/* Right Progress Sidebar */}
      <aside className="hidden space-y-6 xl:block">
        <div className="card-soft p-5">
          <p className="font-bold">Tiến độ hành trình</p>
          <p className="mt-2 text-2xl font-bold">
            {stats.completed}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ {TOTAL_DAYS} ngày</span>
          </p>
          <div className="my-3 flex items-center gap-2">
            <ProgressBar value={stats.progress} />
            <span className="text-xs">{stats.progress}%</span>
          </div>
          <StatTiles small />
        </div>
        <div className="card-soft space-y-2 p-5 text-sm">
          <p className="font-bold">Thông tin bài học</p>
          <p className="text-muted-foreground">{lesson.description}</p>
          <p>
            Từ vựng: <b>{lesson.vocabCount}</b>
          </p>
          <p>
            File lưu trữ: <code className="text-xs text-primary">{fileNameFor(day)}</code>
          </p>
        </div>
      </aside>
    </div>
  );
}
