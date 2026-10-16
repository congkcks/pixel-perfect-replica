import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, FilePlus2, Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileNameFor, formatDate, lessons, pad } from "@/lib/lessons";

export const Route = createFileRoute("/admin/lessons/")({
  head: () => ({ meta: [{ title: "Danh sách bài học – Quản trị" }, { name: "description", content: "Tất cả bài học trong hành trình 100 ngày." }, { property: "og:title", content: "Danh sách bài học" }, { property: "og:description", content: "Tất cả bài học trong hành trình 100 ngày." }] }),
  component: LessonList,
});

function LessonList() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.toLowerCase();
    return lessons.filter((l) => !s || `${l.day} ${l.title} ${l.category}`.toLowerCase().includes(s));
  }, [q]);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-extrabold md:text-3xl">Bài học</h1><p className="text-muted-foreground">{lessons.length} bài học trong dự án</p></div>
        <Button asChild className="rounded-xl"><Link to="/admin/lessons/new"><FilePlus2 />Tạo bài học</Link></Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo ngày, tiêu đề, chủ đề..." className="bg-card pl-9" /></div>
      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground"><tr>{["Ngày", "Tiêu đề", "Chủ đề", "Ngày học", "Thời lượng", "File", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.day} className="border-t">
                  <td className="px-4 py-3"><span className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">{pad(l.day)}</span></td>
                  <td className="min-w-48 px-4 py-3 font-medium">{l.title}</td>
                  <td className="px-4 py-3">{l.category}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(l.date)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{l.duration} phút</td>
                  <td className="px-4 py-3"><code className="text-xs">{fileNameFor(l.day)}</code></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" asChild><Link to="/journey/day/$day" params={{ day: String(l.day) }} aria-label="Xem"><Eye /></Link></Button>
                    <Button variant="ghost" size="icon" asChild><Link to="/admin/lessons/$day/edit" params={{ day: String(l.day) }} aria-label="Sửa"><Pencil /></Link></Button>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Không có bài học phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}