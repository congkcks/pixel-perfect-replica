import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";
import { buildCanonicalUrl, SEO_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh",
  },
  description:
    "Theo dõi hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công (Hà Công), với bài học mỗi ngày, từ vựng, tài liệu và tiến độ học tập.",
  keywords: [...SEO_CONFIG.keywords],
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
  openGraph: {
    title: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh",
    description:
      "Theo dõi hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công (Hà Công), với bài học mỗi ngày, từ vựng, tài liệu và tiến độ học tập.",
    url: buildCanonicalUrl("/"),
    type: "website",
    siteName: SEO_CONFIG.siteName,
    locale: SEO_CONFIG.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh",
    description:
      "Theo dõi hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công (Hà Công), với bài học mỗi ngày, từ vựng, tài liệu và tiến độ học tập.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
