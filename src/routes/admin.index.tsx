import { Link, createFileRoute } from "@tanstack/react-router";
import { FilePlus2, FileUp, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayGrid, ProgressBar, StatTiles } from "@/components/public/shared";
import { TOTAL_DAYS, lessons, pad, stats } from "@/lib/lessons";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Tổng quan quản trị – 100 Ngày Học Tiếng Anh" }, { name: "description", content: "Bảng điều khiển quản lý bài học." }, { property: "og:title", content: "Tổng quan quản trị" }, { property: "og:description", content: "Bảng điều khiển quản lý bài học." }] }),
  component: AdminHome,
});

function AdminHome() {
  const missing = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((d) => !lessons.some((l) => l.day === d));
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-extrabold md:text-3xl">Tổng quan</h1><p className="text-muted-foreground">Quản lý bài học của hành trình 100 ngày.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="rounded-xl"><Link to="/admin/lessons/new" search={{ import: true }}><FileUp />Import .md</Link></Button>
          <Button asChild className="rounded-xl"><Link to="/admin/lessons/new"><FilePlus2 />Tạo bài học</Link></Button>
        </div>
      </div>
      <section className="card-soft grid gap-6 p-6 md:grid-cols-[1fr_1.4fr] md:items-center">
        <div>
          <p className="font-semibold">Tiến độ</p>
          <p className="mt-2 text-3xl font-bold">{stats.completed} <span className="text-base font-normal text-muted-foreground">/ {TOTAL_DAYS} ngày</span></p>
          <div className="mt-3 flex items-center gap-3"><ProgressBar value={stats.progress} /><span className="text-sm">{stats.progress}%</span></div>
        </div>
        <StatTiles />
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card-soft p-6"><h2 className="mb-4 font-bold">Lịch 100 ngày</h2><DayGrid compact /></section>
        <section className="card-soft p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Bài học gần đây</h2><Link to="/admin/lessons" className="flex items-center gap-1 text-sm text-primary"><ListChecks className="h-4 w-4" />Tất cả</Link></div>
          <ul className="space-y-2">
            {stats.latest.slice(0, 5).map((l) => (
              <li key={l.day}><Link to="/admin/lessons/$day/edit" params={{ day: String(l.day) }} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"><span className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">{pad(l.day)}</span><span className="truncate text-sm">{l.title}</span></Link></li>
            ))}
            {!lessons.length && <li className="text-sm text-muted-foreground">Chưa có bài học.</li>}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">Ngày tiếp theo chưa có bài: <b className="text-foreground">{missing[0] ?? "—"}</b></p>
        </section>
      </div>
    </div>
  );
}