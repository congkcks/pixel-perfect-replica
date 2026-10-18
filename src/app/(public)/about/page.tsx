import type { Metadata } from "next";
import { AboutClient } from "./AboutClient";
import { buildCanonicalUrl, getBreadcrumbSchema, getPersonSchema, SEO_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Về Mình & Mục Tiêu 100 Ngày",
  description:
    "Tìm hiểu về Vũ Văn Hà Công (Hà Công) – Kỹ sư CNTT / AI, động lực và kế hoạch thực hiện hành trình 100 ngày tự học tiếng Anh.",
  keywords: [
    ...SEO_CONFIG.keywords,
    "Vũ Văn Hà Công là ai",
    "Hà Công CNTT",
    "Hà Công AI",
    "Tiểu sử Vũ Văn Hà Công",
  ],
  alternates: {
    canonical: buildCanonicalUrl("/about"),
  },
  openGraph: {
    title: "Vũ Văn Hà Công Là Ai? | Về Mình & Mục Tiêu 100 Ngày",
    description:
      "Tìm hiểu về Vũ Văn Hà Công, nền tảng CNTT/AI và hành trình 100 ngày tự học tiếng Anh.",
    url: buildCanonicalUrl("/about"),
    type: "profile",
    siteName: SEO_CONFIG.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Vũ Văn Hà Công Là Ai? | Về Mình & Mục Tiêu 100 Ngày",
    description:
      "Tìm hiểu về Vũ Văn Hà Công, nền tảng CNTT/AI và hành trình 100 ngày tự học tiếng Anh.",
  },
};

export default function AboutPage() {
  const personSchema = getPersonSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Về mình", path: "/about" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutClient />
    </>
  );
}
