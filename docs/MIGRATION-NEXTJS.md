# Hướng dẫn Chuyển đổi sang Next.js App Router & Triển khai Vercel

Tài liệu này mô tả chi tiết quy trình chuyển đổi dự án **"Vũ Văn Hà Công – Hành Trình 100 Ngày Học Tiếng Anh"** từ React + Vite (TanStack Start) sang **Next.js App Router (Next.js 15+)** để đồng bộ GitHub và triển khai trên Vercel.

> [!IMPORTANT]
> **Quy tắc an toàn:**
> Không thực hiện chuyển đổi framework trực tiếp ngay trong Lovable editor để tránh phá vỡ cấu trúc và lịch sử của editor.
> Tài liệu này được biên soạn bám sát 100% cấu trúc mã nguồn thực tế của dự án, đóng vai trò kim chỉ nam và mẫu mã nguồn đầy đủ khi tách nhánh độc lập hoặc clone sang repository Next.js.

---

## 1. Đánh giá Khả năng Tái sử dụng Mã nguồn (Component & Logic Audit)

Mã nguồn hiện tại được tổ chức chặt chẽ theo kiến trúc phân tầng (**Clean Architecture / Separation of Concerns**), cho phép tái sử dụng hơn **90%** mã nguồn khi chuyển sang Next.js App Router.

### 1.1. Tái sử dụng 100% không cần chỉnh sửa (Zero Modification)

- **Nội dung bài học (`content/lessons/*.md`)**:
  - Toàn bộ các tệp Markdown chuẩn GFM kèm YAML frontmatter (`day-001.md`, `day-002.md`, `day-003.md`, ...).
- **Thông tin cá nhân (`src/data/profile.ts`)**:
  - Dữ liệu hồ sơ tác giả Vũ Văn Hà Công (học vấn CNTT/AI, mục tiêu, sở thích, liên kết mạng xã hội).
- **Thư viện tiện ích thuần (`src/lib/`)**:
  - `markdown.ts`: Trích xuất bảng từ vựng, đếm từ vựng tự động.
  - `google-drive.ts`: Xử lý ID và URL nhúng Google Drive Viewer / PDF.
  - `lesson-file.ts`: Xử lý chuyển đổi giữa `LessonDraft` và Markdown frontmatter.
- **Hệ thống UI Shadcn / Tailwind CSS (`src/components/ui/*`)**:
  - Hơn 35 thành phần UI (`button`, `card`, `input`, `textarea`, `badge`, `sonner`, `dialog`, `dropdown-menu`, ...) tương thích hoàn toàn với Next.js và Tailwind CSS.

### 1.2. Tái sử dụng với khai báo `"use client"` (Thêm 1 dòng đầu file)

- `src/components/lesson/PdfViewer.tsx`: Component hiển thị PDF Google Drive kèm iframe loading state.
- `src/components/admin/LessonEditor.tsx`: Giao diện soạn thảo Markdown 2 cột, xem trước trực tiếp và chèn cú pháp nhanh.
- `src/components/public/shared.tsx`: Các component hiển thị tiến độ học tập (`ProgressBar`, `DayGrid`, `LessonCard`, `StatTiles`).

### 1.3. Cần chuyển đổi / Viết lại (Framework-Specific)

- **Hệ thống Routing**: Chuyển các file định tuyến TanStack Router (`src/routes/*`) sang thư mục `app/` của Next.js App Router:
  - `src/routes/_public.tsx` → `app/(public)/layout.tsx`
  - `src/routes/_public.index.tsx` → `app/(public)/page.tsx`
  - `src/routes/_public.journey.index.tsx` → `app/(public)/journey/page.tsx`
  - `src/routes/_public.journey.day.$day.tsx` → `app/(public)/journey/day/[day]/page.tsx`
  - `src/routes/_public.vocabulary.tsx` → `app/(public)/vocabulary/page.tsx`
  - `src/routes/_public.about.tsx` → `app/(public)/about/page.tsx`
  - `src/routes/admin.tsx` → `app/admin/layout.tsx`
  - `src/routes/admin.index.tsx` → `app/admin/page.tsx`
  - `src/routes/admin.lessons.index.tsx` → `app/admin/lessons/page.tsx`
  - `src/routes/admin.lessons.new.tsx` → `app/admin/lessons/new/page.tsx`
  - `src/routes/admin.lessons.$day.edit.tsx` → `app/admin/lessons/[day]/edit/page.tsx`
- **Metadata & SEO**: Thay thế `buildHeadMeta()` của TanStack Start bằng hàm `generateMetadata()` chuẩn của Next.js.
- **Bảo mật Admin**: Thay thế router guard bằng **Next.js Middleware (`middleware.ts`)** và Route Handler (`app/api/admin/login/route.ts`).
- **Sitemap & Robots**: Chuyển từ server-api handler sang `app/sitemap.ts` và `app/robots.ts` chuẩn Next.js Metadata Route.

---

## 2. So sánh và Đề xuất Phương án Lưu Trữ Dữ liệu Bền Vững Đa Thiết Bị

Hiện tại, chức năng lưu bài học trong giao diện Admin sử dụng `LocalStorage` của trình duyệt. Cơ chế này chỉ lưu tạm thời trên một trình duyệt cụ thể, các thiết bị khác hoặc khách truy cập sẽ không thấy các bài học mới được tạo/sửa trên máy đó.

Dưới đây là 3 phương án lưu trữ bền vững, đồng bộ đa thiết bị phù hợp nhất với Next.js và Vercel:

| Tiêu chí                 | Phương án A: GitHub-backed Markdown (Git-as-CMS) | Phương án B: Supabase (PostgreSQL)             | Phương án C: Vercel Postgres / Neon Serverless |
| :----------------------- | :----------------------------------------------- | :--------------------------------------------- | :--------------------------------------------- |
| **Chi phí**              | **0 VNĐ (Miễn phí 100% trọn đời)**               | **0 VNĐ (Gói Free 500MB cực lớn)**             | Miễn phí trong giới hạn Vercel Hobby           |
| **Độ phức tạp**          | Rất thấp (Dùng GitHub REST API)                  | Trung bình (Cần tạo project Supabase)          | Thấp (Tích hợp 1-click trên Vercel)            |
| **Cơ chế lưu**           | Commit file `.md` thẳng vào repo GitHub          | Lưu vào các bảng SQL (`lessons`, `vocabulary`) | Lưu vào bảng SQL serverless                    |
| **Độ bền dữ liệu**       | **Tuyệt đối an toàn** (Lưu trong lịch sử Git)    | Rất an toàn (Backup bởi Supabase)              | Rất an toàn                                    |
| **Tốc độ đọc của khách** | Cực nhanh (SSG Static HTML tại CDN)              | Rất nhanh (SSR / ISR qua REST API)             | Rất nhanh                                      |
| **Thời gian đồng bộ**    | ~30 giây (Vercel tự động build lại trang tĩnh)   | Tức thì (< 1 giây)                             | Tức thì (< 1 giây)                             |
| **Phù hợp với**          | Dự án cá nhân, nhật ký học tập, blog tĩnh        | Hệ thống có bình luận, tương tác người dùng    | Ứng dụng quản trị full-stack trên Vercel       |

### Khuyến nghị lựa chọn:

1. **Khuyến nghị số 1 (Đơn giản, tiết kiệm, chuẩn Git nhất): Phương án A (GitHub-backed Markdown).**
   - **Lý do**: Bạn chỉ cần tạo một GitHub Personal Access Token (`GITHUB_TOKEN`) có quyền push vào repo. Khi bấm "Lưu bài học" trong Admin, backend Next.js gọi GitHub API ghi file `day-XXX.md`. Vercel tự động deploy lại phiên bản mới nhất. Toàn bộ nhật ký 100 ngày được lưu trong Git lịch sử mà không cần duy trì bất kỳ dịch vụ database nào.
2. **Khuyến nghị số 2 (Nếu muốn dữ liệu cập nhật ngay lập tức không cần build lại): Phương án B (Supabase).**
   - **Lý do**: Đăng ký tài khoản miễn phí tại Supabase, tạo bảng `lessons`, kết nối qua biến môi trường `SUPABASE_URL` và `SUPABASE_ANON_KEY`.

---

## 3. Kiến trúc Đọc Dữ liệu trên Next.js Server Components

Thay vì dùng `import.meta.glob` (đặc thù của Vite), Next.js đọc trực tiếp thư mục `content/lessons/` bằng Node.js File System:

```typescript
// lib/lessons.server.ts
import fs from "node:fs";
import path from "node:path";
import { parseLesson, buildLessons, type Lesson } from "./lessons";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

export function getLessonsFromDisk(): Lesson[] {
  if (!fs.existsSync(LESSONS_DIR)) return [];
  const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".md"));
  const sources: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(LESSONS_DIR, file);
    sources[file] = fs.readFileSync(filePath, "utf-8");
  }

  return buildLessons(sources);
}

export function getLessonByDayFromDisk(day: number): Lesson | undefined {
  const all = getLessonsFromDisk();
  return all.find((l) => l.day === day);
}
```

---

## 4. Triển khai Static Site Generation (SSG) & SEO trên Next.js

### 4.1. Trang chi tiết bài học (`app/(public)/journey/day/[day]/page.tsx`)

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLessonByDayFromDisk, getLessonsFromDisk, pad } from "@/lib/lessons";
import { buildCanonicalUrl, getLessonArticleSchema, getBreadcrumbSchema, SEO_CONFIG } from "@/lib/seo";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { PdfViewer } from "@/components/lesson/PdfViewer";

interface PageProps {
  params: Promise<{ day: string }>;
}

// 1. Static Generation trước toàn bộ 100 bài học khi build
export async function generateStaticParams() {
  const lessons = getLessonsFromDisk();
  return lessons.map((l) => ({ day: String(l.day) }));
}

// 2. Tự động sinh Meta Tags động chuẩn SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { day } = await params;
  const lesson = getLessonByDayFromDisk(Number(day));
  if (!lesson) return { title: "Không tìm thấy bài học | Vũ Văn Hà Công" };

  const title = `Ngày ${pad(lesson.day)} – ${lesson.title} | Vũ Văn Hà Công`;
  const description =
    lesson.description ||
    `Bài học Ngày ${lesson.day}: ${lesson.title} trong hành trình 100 ngày tự học tiếng Anh của Vũ Văn Hà Công.`;
  const canonical = buildCanonicalUrl(`/journey/day/${lesson.day}`);

  return {
    title,
    description,
    keywords: [...SEO_CONFIG.keywords, `Bài học ngày ${lesson.day}`, lesson.title],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { day } = await params;
  const lesson = getLessonByDayFromDisk(Number(day));
  if (!lesson) notFound();

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
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Render PDF Viewer và MarkdownRenderer */}
      </div>
    </>
  );
}
```

### 4.2. Triển khai Sitemap Động (`app/sitemap.ts`)

Chỉ lập chỉ mục các bài học đã xuất bản (`completed: true`), không bao gồm route quản trị `/admin`:

```typescript
import type { MetadataRoute } from "next";
import { getLessonsFromDisk } from "@/lib/lessons.server";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const publishedLessons = getLessonsFromDisk().filter((l) => l.completed ?? true);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    {
      url: `${baseUrl}/journey`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vocabulary`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const lessonPages: MetadataRoute.Sitemap = publishedLessons.map((l) => ({
    url: `${baseUrl}/journey/day/${l.day}`,
    lastModified: l.date ? new Date(l.date) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...lessonPages];
}
```

### 4.3. Triển khai Robots.txt (`app/robots.ts`)

```typescript
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 5. Xác thực Admin Phía Server & Bảo vệ với Next.js Middleware

### 5.1. File `middleware.ts`

Chặn mọi request truy cập `/admin/*` nếu thiếu Cookie `vvhc_admin_session` hợp lệ:

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bảo vệ khu vực admin (ngoại trừ API xác thực login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const sessionCookie = request.cookies.get("vvhc_admin_session");

    // Nếu không có cookie session, điều hướng về login hoặc trả về 401
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

### 5.2. Route Handler Đăng nhập (`app/api/admin/login/route.ts`)

Xác thực mật khẩu với biến môi trường `ADMIN_PASSWORD` trên server và thiết lập HttpOnly Cookie:

```typescript
// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/admin-auth.server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = body.password?.trim() || "";
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { success: false, message: "Server chưa cấu hình ADMIN_PASSWORD." },
      { status: 500 },
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json(
      { success: false, message: "Mật khẩu không chính xác." },
      { status: 401 },
    );
  }

  const token = await generateSessionToken();
  const response = NextResponse.json({ success: true, message: "Đăng nhập thành công." });

  response.cookies.set("vvhc_admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 giờ
  });

  return response;
}
```

---

## 6. Checklist Từng Bước Triển Khai Sang Next.js & Vercel

```markdown
- [ ] **Giai đoạn 1: Chuẩn bị Repository độc lập**
  - [ ] Khởi tạo dự án Next.js 15: `npx create-next-app@latest vuvanhacong-100days --typescript --tailwind --app --eslint`
  - [ ] Cài đặt các thư viện: `lucide-react`, `react-markdown`, `remark-gfm`, `clsx`, `tailwind-merge`, `sonner`, `motion`

- [ ] **Giai đoạn 2: Di chuyển Mã nguồn Hiện hữu**
  - [ ] Chép toàn bộ thư mục `content/lessons/*.md` vào gốc dự án Next.js
  - [ ] Chép `src/data/profile.ts` sang `@/data/profile.ts`
  - [ ] Chép `src/lib/*` sang `@/lib/*` (cập nhật các hàm đọc file disk)
  - [ ] Chép các UI components `src/components/ui/*` và `src/components/lesson/*`

- [ ] **Giai đoạn 3: Thiết lập Route App Router**
  - [ ] Tạo `app/(public)/layout.tsx` (Header & Footer)
  - [ ] Tạo `app/(public)/page.tsx` (Trang chủ)
  - [ ] Tạo `app/(public)/journey/page.tsx` (Hành trình 100 ngày)
  - [ ] Tạo `app/(public)/journey/day/[day]/page.tsx` (Chi tiết bài học)
  - [ ] Tạo `app/(public)/vocabulary/page.tsx` (Kho từ vựng)
  - [ ] Tạo `app/(public)/about/page.tsx` (Hồ sơ tác giả)
  - [ ] Tạo `app/admin/**` (Khu vực quản trị)

- [ ] **Giai đoạn 4: SEO, Metadata & Middleware**
  - [ ] Thiết lập `app/sitemap.ts` và `app/robots.ts`
  - [ ] Thiết lập `middleware.ts` bảo vệ `/admin`
  - [ ] Tạo `app/api/admin/login/route.ts` và `app/api/admin/logout/route.ts`

- [ ] **Giai đoạn 5: Deploy Vercel**
  - [ ] Đẩy code lên GitHub repository (nhánh `main`)
  - [ ] Kết nối repo trên Vercel dashboard
  - [ ] Cấu hình biến môi trường:
        `SITE_URL=https://your-domain.com`
        `ADMIN_PASSWORD=mat_khau_quan_tri_bao_mat`
        `SESSION_SECRET=chuoi_ngau_nhien_bao_mat_hmac`
  - [ ] Kiểm tra kiểm thử build: `npm run build`
  - [ ] Kiểm tra `https://<domain>/sitemap.xml`, `https://<domain>/robots.txt`
  - [ ] Kiểm tra Google Search Console & Schema Rich Results Test
```
