"use client";

import Link from "next/link";
import { FilePlus2, FileUp, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayGrid, ProgressBar, StatTiles } from "@/components/public/shared";
import { TOTAL_DAYS, pad, useLessons } from "@/lib/lessons";

export default function AdminHomePage() {
  const { lessons: dynamicLessons, stats: dynamicStats } = useLessons();

  const missing = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter(
    (d) => !dynamicLessons.some((l) => l.day === d),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Tổng quan</h1>
          <p className="text-muted-foreground">Quản lý bài học của hành trình 100 ngày.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/admin/lessons/new?import=true">
              <FileUp className="h-4 w-4 mr-1" />
              Import .md
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/admin/lessons/new">
              <FilePlus2 className="h-4 w-4 mr-1" />
              Tạo bài học
            </Link>
          </Button>
        </div>
      </div>

      <section className="card-soft grid gap-6 p-6 md:grid-cols-[1fr_1.4fr] md:items-center">
        <div>
          <p className="font-semibold">Tiến độ</p>
          <p className="mt-2 text-3xl font-bold">
            {dynamicStats.completed}{" "}
            <span className="text-base font-normal text-muted-foreground">/ {TOTAL_DAYS} ngày</span>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={dynamicStats.progress} />
            <span className="text-sm font-semibold">{dynamicStats.progress}%</span>
          </div>
        </div>
        <StatTiles />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card-soft p-6">
          <h2 className="mb-4 font-bold">Lịch 100 ngày</h2>
          <DayGrid compact />
        </section>

        <section className="card-soft p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Bài học gần đây</h2>
            <Link
              href="/admin/lessons"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ListChecks className="h-4 w-4" />
              Tất cả
            </Link>
          </div>
          <ul className="space-y-2">
            {dynamicStats.latest.slice(0, 5).map((l) => (
              <li key={l.day}>
                <Link
                  href={`/admin/lessons/${l.day}/edit`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                >
                  <span className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                    {pad(l.day)}
                  </span>
                  <span className="truncate text-sm font-medium">{l.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {l.completed ? "✓" : "⏳"}
                  </span>
                </Link>
              </li>
            ))}
            {!dynamicLessons.length && (
              <li className="text-sm text-muted-foreground">Chưa có bài học.</li>
            )}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Còn thiếu <b>{missing.length}</b> ngày chưa ghi chép.
          </p>
        </section>
      </div>
    </div>
  );
}
