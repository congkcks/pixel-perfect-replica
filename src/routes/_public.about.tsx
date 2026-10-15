import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-girl.jpg";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: "Về mình – 100 ngày học tiếng Anh" },
      { name: "description", content: "Câu chuyện đằng sau hành trình 100 ngày học tiếng Anh." },
      { property: "og:title", content: "Về mình – 100 ngày học tiếng Anh" },
      { property: "og:description", content: "Câu chuyện đằng sau hành trình 100 ngày học tiếng Anh." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-2">
      <img src={heroImg} alt="Về mình" width={1024} height={832} loading="lazy" className="rounded-3xl" />
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold">Xin chào, mình là người viết nhật ký này 👋</h1>
        <p className="text-muted-foreground">Mình bắt đầu thử thách 100 ngày học tiếng Anh để rèn luyện sự kỷ luật và tự tin giao tiếp hơn.</p>
        <p className="text-muted-foreground">Mỗi ngày mình nhận tài liệu từ trung tâm, ghi chú lại kiến thức và chia sẻ ở đây. Hy vọng nó cũng giúp ích cho bạn!</p>
      </div>
    </div>
  );
}
