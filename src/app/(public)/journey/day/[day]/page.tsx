import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonDetailClient } from "./LessonDetailClient";
import { getLessonByDayFromDisk, getLessonsFromDisk } from "@/lib/lessons.server";
import { pad } from "@/lib/lessons-core";
import {
  buildCanonicalUrl,
  getBreadcrumbSchema,
  getLessonArticleSchema,
  SEO_CONFIG,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ day: string }>;
}

export async function generateStaticParams() {
  const lessons = getLessonsFromDisk();
  return lessons.map((l) => ({ day: String(l.day) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { day: dayParam } = await params;
  const day = Number(dayParam);
  const lesson = getLessonByDayFromDisk(day);

  if (!lesson) {
    return {
      title: "Bài học không tồn tại | Vũ Văn Hà Công",
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = `Ngày ${pad(lesson.day)}: ${lesson.title}`;
  const fullTitle = `${pageTitle} | Vũ Văn Hà Công`;
  const description =
    lesson.description ||
    `Bài học Ngày ${pad(lesson.day)}: ${lesson.title} trong hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.`;
  const canonical = buildCanonicalUrl(`/journey/day/${lesson.day}`);

  return {
    title: pageTitle,
    description,
    keywords: [
      ...SEO_CONFIG.keywords,
      `Ngày ${lesson.day}`,
      `Bài học Ngày ${lesson.day}`,
      lesson.title,
      lesson.category,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      type: "article",
      publishedTime: lesson.date ? `${lesson.date}T00:00:00+07:00` : undefined,
      authors: [SEO_CONFIG.author],
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { day: dayParam } = await params;
  const day = Number(dayParam);
  const lesson = getLessonByDayFromDisk(day);

  if (!lesson) {
    notFound();
  }

  const articleSchema = getLessonArticleSchema(lesson);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Hành trình", path: "/journey" },
    { name: `Ngày ${pad(lesson.day)}: ${lesson.title}`, path: `/journey/day/${lesson.day}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LessonDetailClient day={day} initialLesson={lesson} />
    </>
  );
}
