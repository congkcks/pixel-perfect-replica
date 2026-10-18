import type { MetadataRoute } from "next";
import { getLessonsFromDisk } from "@/lib/lessons.server";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const publishedLessons = getLessonsFromDisk().filter((l) => l.completed ?? true);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/journey`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vocabulary`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const lessonPages: MetadataRoute.Sitemap = publishedLessons.map((l) => ({
    url: `${baseUrl}/journey/day/${l.day}`,
    lastModified: l.date ? new Date(l.date) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...lessonPages];
}
