import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight, Brain, Code2, Facebook, FlaskConical, Gamepad2, Github, GraduationCap,
  Linkedin, Mail, MapPin, Music, Quote, Server, Sparkles, Trophy, Wrench,
} from "lucide-react";
import { useState } from "react";
import portraitImg from "@/assets/portrait-placeholder.jpg";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/public/shared";
import { TOTAL_DAYS, stats } from "@/lib/lessons";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: "Về mình – Vũ Văn Hà Công | 100 ngày học tiếng Anh" },
      { name: "description", content: "Vũ Văn Hà Công – người yêu công nghệ, đam mê AI và đang trên hành trình 100 ngày chinh phục tiếng Anh." },
      { property: "og:title", content: "Về mình – Vũ Văn Hà Công" },
      { property: "og:description", content: "Người yêu công nghệ, đam mê AI và đang trên hành trình chinh phục tiếng Anh." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

const skillIcons = [Brain, Server, Code2, Wrench, FlaskConical];
const hobbyIcons: Record<string, typeof Trophy> = { trophy: Trophy, gamepad: Gamepad2, music: Music };
const floatingTags = ["Computer Vision", "AI Enthusiast", "English Learner"];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
} as const;

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <motion.div {...fadeUp} className="mb-8">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">{kicker}</span>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
    </motion.div>
  );
}

function About() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const projects = showAllProjects ? profile.projects : profile.projects.slice(0, 3);

  return (
    <div>
      {/* Section 1 – Hero */}
      <section className="bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Xin chào, rất vui được gặp bạn!
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Mình là <span className="text-primary">{profile.name}</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-accent-foreground">{profile.tagline}</p>
            <p className="mt-4 max-w-lg text-muted-foreground">{profile.intro}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> {profile.education.school}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {profile.location}</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-xl"><Link to="/journey">Khám phá hành trình <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-card text-primary">
                <a href={profile.socials.github} target="_blank" rel="noreferrer"><Github /> GitHub của mình</a>
              </Button>
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="LinkedIn">
                  <a href={profile.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin className="h-5 w-5" /></a>
                </Button>
                <Button asChild variant="ghost" size="icon" aria-label="Facebook">
                  <a href={profile.socials.facebook} target="_blank" rel="noreferrer"><Facebook className="h-5 w-5" /></a>
                </Button>
                <Button asChild variant="ghost" size="icon" aria-label="Email">
                  <a href={`mailto:${profile.socials.email}`}><Mail className="h-5 w-5" /></a>
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-[2rem] bg-cta opacity-20 blur-xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-card shadow-soft">
              <img src={portraitImg} alt={`Minh họa chân dung ${profile.name}`} width={1024} height={1024} className="w-full" />
            </div>
            {floatingTags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: [0, -8, 0] }}
                transition={{ opacity: { delay: 0.4 + i * 0.2 }, y: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" } }}
                className={cn(
                  "card-soft absolute px-3 py-1.5 text-xs font-semibold text-accent-foreground",
                  i === 0 && "-left-4 top-8",
                  i === 1 && "-right-4 top-1/3",
                  i === 2 && "-left-2 bottom-10",
                )}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Section 2 – Câu chuyện */}
        <section className="py-16">
          <SectionHeading kicker="Câu chuyện của mình" title="Một chút về mình" />
          <motion.div {...fadeUp} className="space-y-5">
            {profile.story.map((p, i) => (
              <p key={i} className={cn("leading-relaxed text-muted-foreground", i === 0 && "text-lg text-foreground first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-extrabold first-letter:text-primary")}>
                {p}
              </p>
            ))}
            <blockquote className="flex gap-3 rounded-2xl bg-secondary/60 p-5">
              <Quote className="h-6 w-6 shrink-0 text-primary" />
              <p className="font-semibold text-secondary-foreground">“{profile.quote}”</p>
            </blockquote>
          </motion.div>
        </section>

        {/* Section 3 – Timeline */}
        <section className="py-8">
          <SectionHeading kicker="Học tập & phát triển" title="Hành trình trưởng thành" />
          <div className="relative space-y-8 border-l-2 border-primary/20 pl-8">
            {profile.timeline.map((item, i) => (
              <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="relative">
                <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                </span>
                <div className="card-soft p-5">
                  <h3 className="font-bold">{item.title}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {item.points.map((pt) => (
                      <li key={pt} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{pt}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 4 – Kỹ năng */}
        <section className="py-16">
          <SectionHeading kicker="Kỹ năng & công nghệ" title="Công nghệ mình đã khám phá" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.skillGroups.map((group, i) => {
              const Icon = skillIcons[i % skillIcons.length];
              return (
                <motion.div key={group.name} {...fadeUp} transition={{ delay: i * 0.06 }} className="card-soft p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent"><Icon className="h-5 w-5 text-accent-foreground" /></span>
                    <h3 className="font-bold">{group.name}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.skills.map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 5 – Dự án */}
        <section className="py-8">
          <SectionHeading kicker="Dự án" title="Một vài dự án mình từng xây dựng" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.article
                key={p.name}
                {...fadeUp}
                transition={{ delay: (i % 3) * 0.08 }}
                className="card-soft group flex flex-col overflow-hidden transition-transform hover:-translate-y-1.5"
              >
                <div className="flex h-28 items-center justify-center bg-hero">
                  <Code2 className="h-10 w-10 text-primary transition-transform group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold leading-snug">{p.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <span key={t} className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">{t}</span>
                    ))}
                  </div>
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      <Github className="h-4 w-4" /> Xem trên GitHub
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
          {!showAllProjects && profile.projects.length > 3 && (
            <div className="mt-8 text-center">
              <Button variant="outline" className="rounded-xl bg-card text-primary" onClick={() => setShowAllProjects(true)}>
                Xem thêm dự án <ArrowRight />
              </Button>
            </div>
          )}
        </section>

        {/* Section 6 – Vì sao học tiếng Anh */}
        <motion.section {...fadeUp} className="my-16 rounded-3xl bg-hero p-8 md:p-12">
          <SectionHeading kicker="English Learning Journey" title="Vì sao mình bắt đầu hành trình 100 ngày?" />
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="space-y-4">
              {profile.whyEnglish.map((p, i) => (
                <p key={i} className="leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
            <div className="card-soft p-6">
              <p className="text-3xl font-bold">{stats.completed} <span className="text-base font-normal text-muted-foreground">/ {TOTAL_DAYS} ngày</span></p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={stats.progress} />
                <span className="text-sm text-muted-foreground">{stats.progress}%</span>
              </div>
              <Button asChild className="mt-5 w-full rounded-xl"><Link to="/journey">Theo dõi hành trình của mình <ArrowRight /></Link></Button>
            </div>
          </div>
        </motion.section>

        {/* Section 7 – Sở thích */}
        <section className="py-8">
          <SectionHeading kicker="Ngoài công nghệ" title="Khi không ngồi trước màn hình code..." />
          <div className="grid gap-4 sm:grid-cols-3">
            {profile.hobbies.map((h, i) => {
              const Icon = hobbyIcons[h.icon] ?? Sparkles;
              return (
                <motion.div key={h.name} {...fadeUp} transition={{ delay: i * 0.08 }}
                  className="card-soft flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm"><Icon className="h-7 w-7 text-warm-foreground" /></span>
                  <h3 className="mt-4 font-bold">{h.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 8 – Kết nối */}
        <motion.section {...fadeUp} className="bg-cta my-16 rounded-3xl p-8 text-center text-primary-foreground md:p-12">
          <h2 className="text-2xl font-extrabold md:text-3xl">Rất vui nếu chúng ta có thể kết nối!</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-85">
            Nếu bạn cũng yêu thích công nghệ, AI hoặc đang trên hành trình học tiếng Anh, đừng ngại kết nối và chia sẻ cùng mình nhé!
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary" className="rounded-xl"><a href={profile.socials.github} target="_blank" rel="noreferrer"><Github /> GitHub</a></Button>
            <Button asChild variant="secondary" className="rounded-xl"><a href={profile.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin /> LinkedIn</a></Button>
            <Button asChild variant="secondary" className="rounded-xl"><a href={profile.socials.facebook} target="_blank" rel="noreferrer"><Facebook /> Facebook</a></Button>
            <Button asChild variant="secondary" className="rounded-xl"><a href={`mailto:${profile.socials.email}`}><Mail /> Email</a></Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
