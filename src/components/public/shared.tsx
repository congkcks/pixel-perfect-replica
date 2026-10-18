"use client";

import { Link } from "@/components/navigation/Link";
import {
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { TOTAL_DAYS, formatDate, pad, type Lesson, useLessons } from "@/lib/lessons";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <BookOpen className="h-8 w-8 text-primary" strokeWidth={1.8} />
      <span className="text-sm font-bold leading-tight">
        100 Ngày
        <br />
        Học Tiếng Anh
      </span>
    </Link>
  );
}

export function categoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("listen")) return Headphones;
  if (c.includes("speak")) return Mic;
  if (c.includes("grammar")) return PenLine;
  if (c.includes("vocab")) return BookOpen;
  if (c.includes("commun")) return MessageCircle;
  return Sparkles;
}

export function LessonCard({ lesson, index = 0 }: { lesson: Lesson; index?: number }) {
  const Icon = categoryIcon(lesson.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to="/journey/day/$day"
        params={{ day: String(lesson.day) }}
        className="card-soft group flex h-full flex-col p-4 transition-transform hover:-translate-y-1"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
              Ngày {pad(lesson.day)}
            </span>
            {!lesson.completed && (
              <span className="rounded-full bg-chart-4/15 px-2 py-0.5 text-[10px] font-semibold text-chart-4">
                Đang học
              </span>
            )}
          </div>
          {formatDate(lesson.date)}
        </div>
        <div className="mt-3 flex h-28 items-center justify-center rounded-xl bg-hero">
          <Icon className="h-10 w-10 text-primary" strokeWidth={1.6} />
        </div>
        <h3 className="mt-3 font-bold leading-snug">{lesson.title}</h3>
        <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {lesson.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Icon className="h-3.5 w-3.5" /> {lesson.category}
          </span>
          <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

export function DayGrid({ current, compact }: { current?: number; compact?: boolean }) {
  const { lessons: dynamicLessons } = useLessons();
  const lessonMap = new Map(dynamicLessons.map((l) => [l.day, l]));

  return (
    <div className={cn("grid grid-cols-10", compact ? "gap-1.5" : "gap-2")}>
      {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
        const lesson = lessonMap.get(d);
        const has = Boolean(lesson);
        const isCompleted = lesson?.completed ?? false;
        const cls = cn(
          "flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors sm:text-sm",
          has
            ? isCompleted
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-chart-4 text-white hover:bg-chart-4/90"
            : "bg-muted text-muted-foreground",
          current === d && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        );
        return has ? (
          <Link
            key={d}
            to="/journey/day/$day"
            params={{ day: String(d) }}
            className={cls}
            title={`Ngày ${d}: ${lesson?.title} (${isCompleted ? "Đã hoàn thành" : "Đang học"})`}
          >
            {d}
          </Link>
        ) : (
          <span key={d} className={cls} title={`Ngày ${d}: Chưa có bài học`}>
            {d}
          </span>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(value, 0)}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  );
}

export function StatTiles({ small }: { small?: boolean }) {
  const { stats: dynamicStats } = useLessons();
  const items = [
    { icon: Flame, label: "Ngày hoàn thành", value: dynamicStats.completed, tone: "text-chart-1" },
    { icon: BookOpen, label: "Từ vựng", value: dynamicStats.vocab, tone: "text-chart-2" },
    { icon: Clock, label: "Giờ học", value: dynamicStats.hours, tone: "text-chart-3" },
    { icon: Trophy, label: "Tiến độ %", value: dynamicStats.progress, tone: "text-chart-4" },
  ];
  return (
    <div className={cn("grid grid-cols-4", small ? "gap-1" : "gap-3")}>
      {items.map(({ icon: I, label, value, tone }) => (
        <div
          key={label}
          className={cn(
            "flex flex-col items-center rounded-xl bg-secondary/60 text-center",
            small ? "p-2" : "p-4",
          )}
        >
          <I className={cn(small ? "h-5 w-5" : "h-7 w-7", tone)} />
          <span className={cn("mt-1 font-bold", small ? "text-base" : "text-xl")}>{value}</span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
