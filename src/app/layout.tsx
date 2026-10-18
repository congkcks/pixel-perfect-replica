import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles.css";
import { Toaster } from "@/components/ui/sonner";
import { SEO_CONFIG, getPersonSchema, getWebSiteSchema, getSiteUrl } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh",
    template: "%s | Vũ Văn Hà Công",
  },
  description:
    "Nhật ký hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công (Hà Công). Bài học mỗi ngày, tài liệu PDF, từ vựng và ghi chú chi tiết.",
  keywords: [...SEO_CONFIG.keywords],
  authors: [{ name: SEO_CONFIG.author, url: SEO_CONFIG.socials.github }],
  creator: SEO_CONFIG.author,
  publisher: SEO_CONFIG.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google:
      process.env["NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"] ||
      process.env["GOOGLE_SITE_VERIFICATION"] ||
      "googleec28a1d38a66df9c",
  },
  openGraph: {
    type: "website",
    locale: SEO_CONFIG.locale,
    siteName: SEO_CONFIG.siteName,
    title: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh",
    description: "Nhật ký hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh",
    description: "Nhật ký hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const personSchema = getPersonSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
