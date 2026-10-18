import type { Metadata } from "next";
import { JourneyClient } from "./JourneyClient";
import { buildCanonicalUrl, getBreadcrumbSchema, SEO_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hành Trình 100 Ngày Học Tiếng Anh",
  description:
    "Theo dõi nhật ký 100 ngày tự học tiếng Anh của Vũ Văn Hà Công, với các bài học, mục tiêu, từ vựng và tiến độ học tập mỗi ngày.",
  keywords: [...SEO_CONFIG.keywords, "Nhật ký 100 ngày", "Lộ trình học tiếng Anh"],
  alternates: {
    canonical: buildCanonicalUrl("/journey"),
  },
  openGraph: {
    title: "Hành Trình 100 Ngày Học Tiếng Anh | Vũ Văn Hà Công",
    description: "Theo dõi nhật ký 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.",
    url: buildCanonicalUrl("/journey"),
    type: "website",
    siteName: SEO_CONFIG.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hành Trình 100 Ngày Học Tiếng Anh | Vũ Văn Hà Công",
    description: "Theo dõi nhật ký 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.",
  },
};

export default function JourneyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Hành trình", path: "/journey" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <JourneyClient />
    </>
  );
}
