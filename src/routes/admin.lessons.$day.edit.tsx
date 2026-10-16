import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { Button } from "@/components/ui/button";
import { getLesson, pad } from "@/lib/lessons";
import { draftFromLesson } from "@/lib/lesson-file";

export const Route = createFileRoute("/admin/lessons/$day/edit")({
  loader: ({ params }) => {
    if (!getLesson(Number(params.day))) throw notFound();
    return { day: Number(params.day) };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `Sửa ngày ${pad(loaderData.day)} – Quản trị` : "Không tìm thấy bài học";
    return { meta: [{ title: t }, { name: "description", content: "Chỉnh sửa và xuất lại file Markdown." }, { property: "og:title", content: t }, { property: "og:description", content: "Chỉnh sửa và xuất lại file Markdown." }] };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center"><h1 className="text-2xl font-bold">Không tìm thấy bài học</h1><Button asChild className="mt-6"><Link to="/admin/lessons">Về danh sách</Link></Button></div>
  ),
  component: EditLesson,
});

function EditLesson() {
  const { day } = Route.useLoaderData();
  return <LessonEditor key={day} heading={`Chỉnh sửa ngày ${pad(day)}`} initial={draftFromLesson(getLesson(day)!)} />;
}