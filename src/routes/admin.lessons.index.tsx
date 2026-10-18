import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, Eye, FilePlus2, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileNameFor, formatDate, pad, useLessons, type Lesson } from "@/lib/lessons";
import { draftToMarkdown } from "@/lib/lesson-file";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/lessons/")({
  head: () => ({
    meta: [
      { title: "Danh sách bài học – Quản trị" },
      { name: "description", content: "Tất cả bài học trong hành trình 100 ngày." },
      { property: "og:title", content: "Danh sách bài học" },
      { property: "og:description", content: "Tất cả bài học trong hành trình 100 ngày." },
    ],
  }),
  component: LessonList,
});

function downloadLessonMarkdown(lesson: Lesson) {
  const content = draftToMarkdown({
    day: lesson.day,
    title: lesson.title,
    date: lesson.date,
    category: lesson.category,
    level: lesson.level,
    duration: lesson.duration,
    pdfUrl: lesson.pdfUrl,
    description: lesson.description,
    content: lesson.content,
    completed: lesson.completed,
  });

  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileNameFor(lesson.day);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function LessonList() {
  const { lessons: dynamicLessons, isCustom, deleteLesson } = useLessons();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return dynamicLessons.filter(
      (l) => !s || `${l.day} ${l.title} ${l.category} ${l.level}`.toLowerCase().includes(s),
    );
  }, [dynamicLessons, q]);

  const completedCount = dynamicLessons.filter((l) => l.completed).length;
  const inProgressCount = dynamicLessons.length - completedCount;

  const handleDeleteCustom = (day: number) => {
    if (confirm(`Bạn có chắc muốn xóa bản lưu trên máy của Ngày ${pad(day)}?`)) {
      deleteLesson(day);
      toast.info(`Đã khôi phục Ngày ${pad(day)}.`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Quản lý bài học</h1>
          <p className="text-muted-foreground">
            {dynamicLessons.length} bài học ({completedCount} hoàn thành, {inProgressCount} đang
            học)
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/admin/lessons/new">
            <FilePlus2 className="h-4 w-4 mr-1" />
            Tạo bài học
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo ngày, tiêu đề, chủ đề..."
          className="bg-card pl-9"
        />
      </div>

      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                {[
                  "Ngày",
                  "Tiêu đề",
                  "Chủ đề",
                  "Trạng thái",
                  "Ngày học",
                  "Thời lượng",
                  "Nguồn",
                  "",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((l) => {
                const custom = isCustom(l.day);
                return (
                  <tr key={l.day} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                        {pad(l.day)}
                      </span>
                    </td>
                    <td className="min-w-48 px-4 py-3 font-medium">{l.title}</td>
                    <td className="px-4 py-3">{l.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          l.completed ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4",
                        )}
                      >
                        {l.completed ? "Hoàn thành" : "Đang học"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(l.date)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{l.duration} phút</td>
                    <td className="px-4 py-3">
                      {custom ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                          Lưu máy
                        </span>
                      ) : (
                        <code className="text-[11px] text-muted-foreground">
                          {fileNameFor(l.day)}
                        </code>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" asChild title="Xem trang public">
                        <Link
                          to="/journey/day/$day"
                          params={{ day: String(l.day) }}
                          aria-label="Xem"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Chỉnh sửa bài học">
                        <Link
                          to="/admin/lessons/$day/edit"
                          params={{ day: String(l.day) }}
                          aria-label="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Tải file .md"
                        onClick={() => {
                          downloadLessonMarkdown(l);
                          toast.success(`Đã tải ${fileNameFor(l.day)}`);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {custom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Khôi phục về bản gốc"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCustom(l.day)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!list.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Không có bài học phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
