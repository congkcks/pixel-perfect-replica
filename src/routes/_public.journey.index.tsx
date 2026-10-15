import { createFileRoute } from "@tanstack/react-router";
import { DayGrid, LessonCard, ProgressBar } from "@/components/public/shared";
import { TOTAL_DAYS, lessons, stats } from "@/lib/lessons";

export const Route = createFileRoute("/_public/journey/")({
  head: () => ({
    meta: [
      { title: "Hành trình 100 ngày – Danh sách bài học" },
      { name: "description", content: "Toàn bộ bài học trong hành trình 100 ngày học tiếng Anh." },
      { property: "og:title", content: "Hành trình 100 ngày – Danh sách bài học" },
      { property: "og:description", content: "Toàn bộ bài học trong hành trình 100 ngày học tiếng Anh." },
    ],
  }),
  component: Journey,
});

function Journey() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Hành trình 100 ngày</h1>
      <p className="mt-1 text-muted-foreground">Đã hoàn thành {stats.completed} / {TOTAL_DAYS} ngày</p>
      <div className="mt-4 max-w-md"><ProgressBar value={stats.progress} /></div>
      <div className="card-soft mt-8 p-6"><DayGrid /></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lessons.map((l, i) => <LessonCard key={l.day} lesson={l} index={i} />)}
      </div>
    </div>
  );
}
