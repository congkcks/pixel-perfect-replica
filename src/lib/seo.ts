import { pad, type Lesson } from "./lessons-core";

/**
 * Lấy canonical site URL từ biến môi trường (Vite hoặc Next.js) với fallback an toàn.
 * Tuyệt đối không hardcode domain Vercel giả định.
 * Ưu tiên:
 * 1. SITE_URL / NEXT_PUBLIC_SITE_URL (custom domain khi deploy production)
 * 2. VERCEL_URL (tự động cung cấp bởi hạ tầng Vercel khi deploy)
 * 3. window.location.origin trên trình duyệt client
 * 4. Fallback chuỗi rỗng "" (dùng đường dẫn tương đối, không giả định domain)
 */
export function getSiteUrl(): string {
  const envUrl =
    (typeof process !== "undefined" &&
      (process.env?.["SITE_URL"] ||
        process.env?.["NEXT_PUBLIC_SITE_URL"] ||
        (process.env?.["VERCEL_PROJECT_PRODUCTION_URL"]
          ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}`
          : "") ||
        (process.env?.["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : ""))) ||
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.["VITE_SITE_URL"] || import.meta.env?.["NEXT_PUBLIC_SITE_URL"]));

  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    let clean = envUrl.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}

export function buildCanonicalUrl(path = "/"): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!base) {
    return cleanPath;
  }
  if (cleanPath === "/") return `${base}/`;
  return `${base}${cleanPath.replace(/\/+$/, "")}`;
}

export const SEO_CONFIG = {
  author: "Vũ Văn Hà Công",
  authorAlternate: "Hà Công",
  siteName: "Hành Trình 100 Ngày Học Tiếng Anh",
  siteNameAlternate: "Hành Trình Học Tiếng Anh Của Công",
  locale: "vi_VN",
  defaultOgImage: "/og-image.png",
  keywords: [
    "Vũ Văn Hà Công",
    "Hà Công",
    "Hành trình 100 ngày học tiếng Anh của Công",
    "Hành trình 100 ngày học tiếng Anh",
    "100 ngày học tiếng Anh",
    "Tự học tiếng Anh",
    "Nhật ký học tiếng Anh",
    "Lộ trình 100 ngày tiếng Anh",
    "Học tiếng Anh mỗi ngày",
    "Vu Van Ha Cong",
    "Ha Cong English",
    "English learning journey 100 days",
  ],
  socials: {
    github: "https://github.com/congkcks",
    linkedin: "https://www.linkedin.com/in/cong-vu-van-5936463aa/",
    facebook: "https://www.facebook.com/van.vu.cong.761426",
    email: "congvanvu0000@gmail.com",
  },
} as const;

export function getPersonSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}#person`,
    name: SEO_CONFIG.author,
    alternateName: SEO_CONFIG.authorAlternate,
    url: siteUrl,
    jobTitle: "Kỹ sư Công nghệ Thông tin / AI",
    description:
      "Vũ Văn Hà Công (Hà Công) – Cựu sinh viên CNTT, đam mê AI & Computer Vision, đang thực hiện hành trình 100 ngày tự học tiếng Anh.",
    sameAs: [SEO_CONFIG.socials.github, SEO_CONFIG.socials.linkedin, SEO_CONFIG.socials.facebook],
  };
}

export function getWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: SEO_CONFIG.siteName,
    alternateName: SEO_CONFIG.siteNameAlternate,
    description: "Nhật ký tự học tiếng Anh trong 100 ngày của Vũ Văn Hà Công.",
    url: siteUrl,
    inLanguage: "vi",
    publisher: {
      "@id": `${siteUrl}#person`,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const itemUrl = item.path.startsWith("http") ? item.path : buildCanonicalUrl(item.path);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: itemUrl,
      };
    }),
  };
}

export function getLessonArticleSchema(lesson: Lesson) {
  const siteUrl = getSiteUrl();
  const pageUrl = buildCanonicalUrl(`/journey/day/${lesson.day}`);
  const publishedDate = lesson.date ? `${lesson.date}T00:00:00+07:00` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting"],
    "@id": `${pageUrl}#article`,
    headline: `Ngày ${pad(lesson.day)}: ${lesson.title}`,
    description:
      lesson.description ||
      `Bài học Ngày ${lesson.day} trong hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.`,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    inLanguage: "vi",
    ...(publishedDate ? { datePublished: publishedDate, dateModified: publishedDate } : {}),
    author: {
      "@type": "Person",
      name: SEO_CONFIG.author,
      alternateName: SEO_CONFIG.authorAlternate,
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: SEO_CONFIG.author,
      url: siteUrl,
    },
  };
}

export interface HeadMetaOptions {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article" | "profile";
  image?: string;
  noindex?: boolean;
  schemas?: Record<string, unknown>[];
}

export function buildHeadMeta({
  title,
  description,
  path,
  ogType = "website",
  image = SEO_CONFIG.defaultOgImage,
  noindex = false,
  schemas = [],
}: HeadMetaOptions) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(path);
  const imageUrl = image.startsWith("http")
    ? image
    : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`;

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: SEO_CONFIG.keywords.join(", ") },
    { name: "author", content: SEO_CONFIG.author },
    // Open Graph
    { property: "og:site_name", content: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: imageUrl },
    { property: "og:image:alt", content: title },
    { property: "og:locale", content: SEO_CONFIG.locale },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  } else {
    meta.push({ name: "robots", content: "index, follow" });
  }

  const links = [{ rel: "canonical", href: canonicalUrl }];

  const scripts = schemas.map((schema) => ({
    type: "application/ld+json",
    children: JSON.stringify(schema),
  }));

  return { meta, links, scripts };
}
