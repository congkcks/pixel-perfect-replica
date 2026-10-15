import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Circle, Clock, FileText, Gauge, Tag, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { PdfViewer } from "@/components/lesson/PdfViewer";
import { ProgressBar, StatTiles } from "@/components/public/shared";
import { TOTAL_DAYS, fileNameFor, formatDate, getLesson, lessons, pad, stats } from "@/lib/lessons";
import { getDriveViewUrl } from "@/lib/google-drive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/journey/day/$day")({
  loader: ({ params }) => {
    const lesson = getLesson(Number(params.day));
    if (!lesson) throw notFound();
    return { day: lesson.day };
  },
  head: ({ loaderData }) => {
    const l = loaderData ? getLesson(loaderData.day) : undefined;
    const title = l ? `Ngày ${pad(l.day)}: ${l.title}` : "Bài học không tồn tại";
    const desc = l?.description || "Bài học trong hành trình 100 ngày học tiếng Anh.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, ...(l ? [] : [{ name: "robots", content: "noindex" }])] };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-2xl font-bold">Ngày này chưa có bài học</h1>
      <Button asChild className="mt-6"><Link to="/journey">Quay lại hành trình</Link></Button>
    </div>
  ),
  component: LessonPage,
});

function goals(content: string) {
  const sec = content.split(/\n(?=##\s)/).find((s) => /^##\s.*mục tiêu/i.test(s.trim()));
  if (!sec) return [];
  return sec.split("\n").map((l) => l.match(/^\s*[-*]\s+(?:\[[ x]\]\s+)?(.*)$/)?.[1]).filter(Boolean) as string[];
}

function LessonPage() {
  const { day } = Route.useLoaderData();
  const lesson = getLesson(day)!;
  const idx = lessons.findIndex((l) => l.day === day);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const done = new Set(lessons.map((l) => l.day));
  const lessonGoals = goals(lesson.content);

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
      <aside className="hidden lg:block">
        <div className="card-soft sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-3">
          <p className="mb-2 px-2 text-sm font-bold">Hành trình 100 ngày</p>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
            const l = lessons.find((x) => x.day === d);
            const active = d === day;
            const inner = (
              <>
                {done.has(d) ? <CheckCircle2 className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-success")} /> : <Circle className="h-5 w-5 shrink-0 text-border" />}
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Ngày {pad(d)}</span>
                  {l && <span className="block truncate text-xs text-muted-foreground">{l.title}</span>}
                </span>
              </>
            );
            const cls = cn("flex items-center gap-3 rounded-xl px-2 py-2", active && "bg-accent text-accent-foreground", !l && "opacity-50");
            return l ? <Link key={d} to="/journey/day/$day" params={{ day: String(d) }} className={cn(cls, "hover:bg-muted")}>{inner}</Link> : <div key={d} className={cls}>{inner}</div>;
          })}
        </div>
      </aside>

      <main className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1 text-sm text-muted-foreground"><Link to="/journey">Hành trình</Link><ChevronRight className="h-4 w-4" />Ngày {pad(day)}</nav>
            <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">Ngày {pad(day)}: {lesson.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {lesson.date && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatDate(lesson.date)}</span>}
              {lesson.duration > 0 && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{lesson.duration} phút</span>}
              {lesson.level && <span className="flex items-center gap-1 rounded-full bg-warm px-2.5 py-0.5 text-warm-foreground"><Gauge className="h-4 w-4" />{lesson.level}</span>}
              <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground"><Tag className="h-4 w-4" />{lesson.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {prev && <Button variant="outline" asChild><Link to="/journey/day/$day" params={{ day: String(prev.day) }}><ArrowLeft />Ngày {pad(prev.day)}</Link></Button>}
            {next && <Button variant="outline" asChild><Link to="/journey/day/$day" params={{ day: String(next.day) }}>Ngày {pad(next.day)}<ArrowRight /></Link></Button>}
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-2">
          <PdfViewer url={lesson.pdfUrl} />
          <div className="card-soft p-6">
            <div className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold"><FileText className="h-5 w-5 text-primary" />Nội dung ghi chú</div>
            <MarkdownRenderer content={lesson.content} />
          </div>
        </div>
      </main>

      <aside className="hidden space-y-6 xl:block">
        <div className="card-soft p-5">
          <p className="font-bold">Tiến độ hành trình</p>
          <p className="mt-2 text-2xl font-bold">{stats.completed} <span className="text-sm font-normal text-muted-foreground">/ {TOTAL_DAYS} ngày</span></p>
          <div className="my-3 flex items-center gap-2"><ProgressBar value={stats.progress} /><span className="text-xs">{stats.progress}%</span></div>
          <StatTiles small />
        </div>
        <div className="card-soft space-y-2 p-5 text-sm">
          <p className="font-bold">Thông tin bài học</p>
          <p className="text-muted-foreground">{lesson.description}</p>
          <p>Từ vựng: <b>{lesson.vocabCount}</b></p>
          <p>File: <code className="text-xs">{fileNameFor(day)}</code></p>
        </div>
        {lessonGoals.length > 0 && (
          <div className="card-soft p-5">
            <p className="mb-3 flex items-center gap-2 font-bold"><Target className="h-5 w-5 text-primary" />Mục tiêu bài học</p>
            <ul className="space-y-2 text-sm">{lessonGoals.map((g) => <li key={g} className="flex gap-2"><Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary/50" />{g}</li>)}</ul>
          </div>
        )}
        <div className="card-soft p-5">
          <p className="mb-3 font-bold">Tài liệu liên quan</p>
          {lesson.pdfUrl ? (
            <a href={getDriveViewUrl(lesson.pdfUrl) ?? "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl p-2 text-sm hover:bg-muted">
              <FileText className="h-8 w-8 text-destructive" /> Day {pad(day)} – Tài liệu PDF
            </a>
          ) : <p className="text-sm text-muted-foreground">Chưa có tài liệu.</p>}
        </div>
      </aside>
    </div>
  );
}
