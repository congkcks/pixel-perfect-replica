import { Link, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { extractVocabulary, lessons, pad } from "@/lib/lessons";

export const Route = createFileRoute("/_public/vocabulary")({
  head: () => ({
    meta: [
      { title: "Tổng hợp từ vựng – 100 ngày học tiếng Anh" },
      { name: "description", content: "Tất cả từ vựng đã học trong hành trình 100 ngày." },
      { property: "og:title", content: "Tổng hợp từ vựng – 100 ngày học tiếng Anh" },
      { property: "og:description", content: "Tất cả từ vựng đã học trong hành trình 100 ngày." },
    ],
  }),
  component: Vocabulary,
});

function Vocabulary() {
  const all = useMemo(() => lessons.flatMap(extractVocabulary), []);
  const [q, setQ] = useState("");
  const list = all.filter((v) => `${v.word} ${v.meaning}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Tổng hợp từ vựng</h1>
      <p className="mt-1 text-muted-foreground">{all.length} từ từ {lessons.length} bài học</p>
      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm từ vựng..." className="pl-9" />
      </div>
      <div className="card-soft prose-lesson mt-6 overflow-x-auto">
        <table>
          <thead><tr><th>Từ vựng</th><th>Phiên âm</th><th>Nghĩa</th><th>Ngày</th></tr></thead>
          <tbody>
            {list.map((v, i) => (
              <tr key={i}><td className="font-medium">{v.word}</td><td className="text-muted-foreground">{v.ipa}</td><td>{v.meaning}</td>
                <td><Link to="/journey/day/$day" params={{ day: String(v.day) }}>Ngày {pad(v.day)}</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
