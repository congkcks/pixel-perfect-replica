"use client";

import Link from "next/link";
import { Download, Eye, FilePlus2, Pencil, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileNameFor, formatDate, pad, useLessons, type Lesson } from "@/lib/lessons";
import { draftToMarkdown } from "@/lib/lesson-file";
import { cn } from "@/lib/utils";

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

export default function AdminLessonsPage() {
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
    if (confirm(`Bạn có chắc muốn khôi phục bài Ngày ${pad(day)} về mặc định?`)) {
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
          <Link href="/admin/lessons/new">
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
                <th className="p-3">Ngày</th>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Ngày ghi</th>
                <th className="p-3">Chủ đề</th>
                <th className="p-3">Trình độ</th>
                <th className="p-3">Thời lượng</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((l) => {
                const custom = isCustom(l.day);
                return (
                  <tr key={l.day} className="hover:bg-muted/40">
                    <td className="p-3 font-bold">
                      <span className="rounded-lg bg-secondary px-2 py-1 text-xs">
                        {pad(l.day)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/lessons/${l.day}/edit`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {l.title}
                        </Link>
                        {custom && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                            Đã sửa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(l.date)}</td>
                    <td className="p-3">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                        {l.category}
                      </span>
                    </td>
                    <td className="p-3">{l.level || "—"}</td>
                    <td className="p-3">{l.duration}m</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          l.completed ? "bg-primary/10 text-primary" : "bg-chart-4/10 text-chart-4",
                        )}
                      >
                        {l.completed ? "Hoàn thành" : "Đang học"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                          title="Xem trên trang công khai"
                        >
                          <Link href={`/journey/day/${l.day}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadLessonMarkdown(l)}
                          className="h-8 w-8"
                          title="Tải file .md"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                          title="Chỉnh sửa bài học"
                        >
                          <Link href={`/admin/lessons/${l.day}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {custom && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustom(l.day)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Khôi phục bài gốc"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!list.length && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    {q ? `Không tìm thấy bài học nào phù hợp với "${q}".` : "Chưa có bài học nào."}
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
