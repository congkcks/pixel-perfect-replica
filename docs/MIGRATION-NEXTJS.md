# Hướng dẫn chuyển sang Next.js App Router

Tài liệu này mô tả cách chuyển dự án "Hành Trình 100 Ngày Học Tiếng Anh" từ
React + Vite (TanStack Start) sang Next.js App Router để triển khai trên Vercel.
Không thực hiện chuyển đổi trong dự án hiện tại — đây là tài liệu chuẩn bị.

## 1. Cấu trúc hiện tại đã được chuẩn bị sẵn

Mã nguồn đã tách biệt ba lớp, nên phần lớn code tái sử dụng nguyên vẹn:

| Lớp | Vị trí hiện tại | Tái sử dụng trên Next.js |
|---|---|---|
| UI components | `src/components/**` | Giữ nguyên (thêm `"use client"` nơi cần) |
| Business logic | `src/lib/**` | Giữ nguyên 100% (pure TypeScript) |
| Data | `content/lessons/*.md` | Giữ nguyên; đọc bằng `fs` thay cho `import ?raw` |
| Routing | `src/routes/**` | Viết lại theo cấu trúc `app/` (xem mục 2) |

Không có bảng/database, không có Supabase, không có Lovable Cloud — dữ liệu bài
học là file Markdown trong repo, nên không cần migrate dữ liệu.

## 2. Bản đồ route

| TanStack Start | Next.js App Router |
|---|---|
| `src/routes/_public.tsx` | `app/(public)/layout.tsx` |
| `src/routes/_public.index.tsx` | `app/(public)/page.tsx` |
| `src/routes/_public.journey.index.tsx` | `app/(public)/journey/page.tsx` |
| `src/routes/_public.journey.day.$day.tsx` | `app/(public)/journey/day/[day]/page.tsx` |
| `src/routes/_public.vocabulary.tsx` | `app/(public)/vocabulary/page.tsx` |
| `src/routes/_public.about.tsx` | `app/(public)/about/page.tsx` |
| `src/routes/admin.tsx` | `app/admin/layout.tsx` |
| `src/routes/admin.index.tsx` | `app/admin/page.tsx` |
| `src/routes/admin.lessons.index.tsx` | `app/admin/lessons/page.tsx` |
| `src/routes/admin.lessons.new.tsx` | `app/admin/lessons/new/page.tsx` |
| `src/routes/admin.lessons.$day.edit.tsx` | `app/admin/lessons/[day]/edit/page.tsx` |

Quy tắc chuyển đổi:

- `createFileRoute(...)({ loader })` → dữ liệu đọc trực tiếp trong Server
  Component (async) hoặc `generateStaticParams` cho `[day]`.
- `head()` → `export const metadata` (tĩnh) hoặc `generateMetadata()` (động,
  theo `params.day`).
- `useSearch()` → prop `searchParams` của page.
- `<Link to>` → `<Link href>` của `next/link`; `useNavigate()` →
  `useRouter()` của `next/navigation`.
- Component dùng state/effect (`LessonEditor`, menu mobile, dialog) thêm
  `"use client"` ở đầu file.
- `import.meta.glob("*.md", { as: "raw", eager: true })` trong
  `src/lib/lessons.ts` → thay bằng `fs.readdirSync` + `fs.readFileSync`
  (Node runtime), giữ nguyên `parseFrontmatter` trong `src/lib/markdown.ts`.

## 3. SEO trên Next.js

- **Metadata mỗi trang:** `generateMetadata` cho `journey/day/[day]` trả về
  `title`, `description` lấy từ frontmatter bài học (hiện đã có sẵn trong
  `head()` của TanStack).
- **Canonical:** dùng `metadata.alternates.canonical` tự tham chiếu từng
  trang. Không hardcode domain — đặt `metadataBase` từ biến môi trường
  `NEXT_PUBLIC_SITE_URL` (Vercel tự cung cấp `VERCEL_URL` để suy ra).
- **sitemap.xml:** tạo `app/sitemap.ts` duyệt 100 ngày từ `content/lessons`,
  trả về `MetadataRoute.Sitemap`; URL tuyệt đối lấy từ `metadataBase`.
- **robots.txt:** tạo `app/robots.ts`; giữ nguyên quy tắc `Allow: /` hiện có
  trong `public/robots.txt` và chặn `/admin` (`Disallow: /admin`).
- **Structured data:** thêm JSON-LD `Article` cho trang bài học và
  `BreadcrumbList` cho đường dẫn sâu, render qua thẻ `<script
  type="application/ld+json">` trong page.
- **Open Graph image:** tạo `app/(public)/opengraph-image.tsx`
  (next/og) 1200x630; không đặt `og:image` ở layout gốc để không ghi đè
  trang con.

## 4. Bảo vệ khu vực Admin

Hiện tại Admin chưa có xác thực và không được xuất hiện công khai khi deploy.
Trên Next.js:

- Thêm `middleware.ts` chặn `/admin/*` khi thiếu cookie phiên đăng nhập.
- Cài đặt xác thực tối thiểu (ví dụ một mật khẩu quản trị qua biến môi trường
  `ADMIN_PASSWORD` + cookie ký, hoặc Auth.js).
- Giữ `robots` chặn lập chỉ mục `/admin` như mục 3.

## 5. Triển khai Vercel

1. Đẩy repo lên GitHub (không commit `.env`, chỉ commit `.env.example`).
2. Import repo vào Vercel; framework preset: Next.js.
3. Đặt biến môi trường `NEXT_PUBLIC_SITE_URL` khi đã có domain production.
4. Dữ liệu bài học nằm trong repo nên mỗi lần thêm/sửa file
   `content/lessons/day-XXX.md` và deploy là dữ liệu bền vững — không mất khi
   refresh hay redeploy.

## 6. Thứ tự thực hiện đề xuất

1. Scaffold `create-next-app` (App Router, Tailwind v4, TypeScript strict).
2. Copy `src/lib/**` và `content/lessons/**` trước; chạy lại test Vitest.
3. Copy `src/components/**`, thêm `"use client"` nơi cần.
4. Chuyển từng route theo bản đồ mục 2, ưu tiên Public trước, Admin sau.
5. Thêm metadata, sitemap, robots, JSON-LD (mục 3).
6. Thêm xác thực Admin (mục 4) trước khi deploy công khai.
7. Kết nối GitHub → Vercel (mục 5).
