import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Heart, Quote, Sparkles, Star, TrendingUp, Users, Target } from "lucide-react";
import heroImg from "@/assets/hero-girl.jpg";
import { Button } from "@/components/ui/button";
import { DayGrid, LessonCard, ProgressBar, StatTiles } from "@/components/public/shared";
import { TOTAL_DAYS, stats } from "@/lib/lessons";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: "Hành trình 100 ngày học tiếng Anh" },
      { name: "description", content: "Nhật ký 100 ngày học tiếng Anh: bài học, từ vựng và tiến độ mỗi ngày." },
      { property: "og:title", content: "Hành trình 100 ngày học tiếng Anh" },
      { property: "og:description", content: "Mỗi ngày học một chút, chia sẻ một chút, cùng nhau tiến bộ." },
    ],
  }),
  component: Home,
});

const reasons = [
  { icon: TrendingUp, t: "Rèn luyện sự kỷ luật", d: "Học mỗi ngày và duy trì thói quen tốt." },
  { icon: Heart, t: "Chia sẻ kiến thức", d: "Ghi lại những gì mình học để lan tỏa." },
  { icon: Users, t: "Kết nối cộng đồng", d: "Cùng nhau học tập và tạo động lực." },
  { icon: Star, t: "Phiên bản tốt hơn", d: "Tự tin hơn trong công việc và cuộc sống." },
];

function Home() {
  return (
    <div>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-24 pt-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> HỌC MỖI NGÀY – PHIÊN BẢN TỐT HƠN CỦA CHÍNH MÌNH
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Hành trình <span className="text-primary">100 ngày</span><br />học tiếng Anh của mình
            </h1>
            <p className="mt-5 max-w-lg text-muted-foreground">
              Mình đang ghi lại toàn bộ quá trình học tiếng Anh từ ngày 1 đến ngày 100. Mỗi ngày học một chút, chia sẻ một chút, cùng nhau tiến bộ mỗi ngày!
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl"><Link to="/journey"><BookOpen /> Xem hành trình ngay <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-card text-primary"><Link to="/about">Giới thiệu về mình</Link></Button>
            </div>
          </motion.div>
          <motion.img initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} src={heroImg} width={1024} height={832}
            alt="Cô gái học tiếng Anh bên laptop" className="w-full rounded-3xl" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <section className="card-soft -mt-16 relative grid gap-6 p-6 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div>
            <p className="font-semibold">Tiến độ hiện tại</p>
            <p className="mt-2 text-3xl font-bold">{stats.completed} <span className="text-base font-normal text-muted-foreground">/ {TOTAL_DAYS} ngày</span></p>
            <div className="mt-3 flex items-center gap-3"><ProgressBar value={stats.progress} /><span className="text-sm text-muted-foreground">{stats.progress}%</span></div>
          </div>
          <StatTiles />
        </section>

        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold"><CalendarDays className="text-primary" /> Bài học mới nhất</h2>
            <Link to="/journey" className="flex items-center gap-1 text-sm text-primary">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {stats.latest.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.latest.slice(0, 4).map((l, i) => <LessonCard key={l.day} lesson={l} index={i} />)}
            </div>
          ) : <p className="text-muted-foreground">Chưa có bài học nào.</p>}
        </section>

        <section className="card-soft mt-14 grid gap-8 p-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-xl font-bold">Hành trình 100 ngày</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Mỗi ô là một ngày. Nhấn vào ô đã hoàn thành để xem chi tiết bài học.</p>
            <DayGrid />
          </div>
          <div className="flex flex-col justify-center gap-5 rounded-2xl bg-secondary/60 p-6">
            <Quote className="h-8 w-8 text-primary" />
            <p className="text-xl font-bold">“Không cần hoàn hảo, chỉ cần tiến bộ mỗi ngày.”</p>
            <ul className="space-y-2 text-sm">
              {["100 ngày học tập", "Xây dựng thói quen", "Tự tin giao tiếp", "Trở thành phiên bản tốt hơn"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> {t}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold">Tại sao mình làm dự án này?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ icon: I, t, d }) => (
              <div key={t} className="card-soft flex gap-3 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent"><I className="h-5 w-5 text-accent-foreground" /></div>
                <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-cta my-14 flex flex-col items-center justify-between gap-4 rounded-3xl p-8 text-primary-foreground md:flex-row">
          <div className="flex items-center gap-4">
            <Target className="h-10 w-10" />
            <div><p className="text-lg font-bold">Cùng mình bắt đầu hành trình 100 ngày học tiếng Anh nhé!</p><p className="text-sm opacity-80">Mỗi ngày một bước nhỏ, tạo nên thay đổi lớn.</p></div>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-xl"><Link to="/journey">Xem hành trình ngay <ArrowRight /></Link></Button>
        </section>
      </div>
    </div>
  );
}
