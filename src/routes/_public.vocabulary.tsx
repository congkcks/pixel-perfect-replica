import { Link, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { extractVocabulary, pad, useLessons } from "@/lib/lessons";

import { buildHeadMeta, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/vocabulary")({
  head: () =>
    buildHeadMeta({
      title: "Từ Vựng Tiếng Anh Mỗi Ngày | Vũ Văn Hà Công",
      description:
        "Tổng hợp từ vựng tiếng Anh từ hành trình 100 ngày học tiếng Anh của Vũ Văn Hà Công, giúp tra cứu và ôn tập kiến thức.",
      path: "/vocabulary",
      schemas: [
        getBreadcrumbSchema([
          { name: "Trang chủ", path: "/" },
          { name: "Từ vựng", path: "/vocabulary" },
        ]),
      ],
    }),
  component: Vocabulary,
});

function Vocabulary() {
  const { lessons: dynamicLessons } = useLessons();
  const all = useMemo(() => dynamicLessons.flatMap(extractVocabulary), [dynamicLessons]);
  const [q, setQ] = useState("");
  const list = all.filter((v) =>
    `${v.word} ${v.ipa} ${v.meaning}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Kho Từ Vựng Tiếng Anh Của Công</h1>
      <p className="mt-1 text-muted-foreground">
        {all.length} từ vựng được tổng hợp từ {dynamicLessons.length} bài học
      </p>
      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo từ, phiên âm, nghĩa..."
          className="pl-9 bg-card"
        />
      </div>
      <div className="card-soft prose-lesson mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Từ vựng</th>
              <th>Phiên âm</th>
              <th>Nghĩa tiếng Việt</th>
              <th>Ngày học</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v, i) => (
              <tr key={`${v.word}-${v.day}-${i}`}>
                <td className="font-semibold text-primary">{v.word}</td>
                <td className="text-muted-foreground font-mono text-sm">{v.ipa}</td>
                <td>{v.meaning}</td>
                <td>
                  <Link
                    to="/journey/day/$day"
                    params={{ day: String(v.day) }}
                    className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                  >
                    Ngày {pad(v.day)}
                  </Link>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-muted-foreground">
                  {q ? `Không tìm thấy từ vựng nào khớp với "${q}".` : "Chưa có từ vựng nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
