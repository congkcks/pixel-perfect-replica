import type { Metadata } from "next";
import { VocabularyClient } from "./VocabularyClient";
import { buildCanonicalUrl, getBreadcrumbSchema, SEO_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kho Từ Vựng Tiếng Anh",
  description:
    "Tổng hợp từ vựng tiếng Anh theo từng ngày trong hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công, kèm phiên âm chuẩn IPA và ví dụ nghĩa.",
  keywords: [...SEO_CONFIG.keywords, "Từ vựng tiếng Anh", "Tra cứu từ vựng", "Bảng từ vựng IPA"],
  alternates: {
    canonical: buildCanonicalUrl("/vocabulary"),
  },
  openGraph: {
    title: "Kho Từ Vựng Tiếng Anh | Vũ Văn Hà Công",
    description:
      "Tổng hợp từ vựng tiếng Anh từ hành trình 100 ngày học tiếng Anh của Vũ Văn Hà Công.",
    url: buildCanonicalUrl("/vocabulary"),
    type: "website",
    siteName: SEO_CONFIG.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kho Từ Vựng Tiếng Anh | Vũ Văn Hà Công",
    description:
      "Tổng hợp từ vựng tiếng Anh từ hành trình 100 ngày học tiếng Anh của Vũ Văn Hà Công.",
  },
};

export default function VocabularyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Từ vựng", path: "/vocabulary" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VocabularyClient />
    </>
  );
}
