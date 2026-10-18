# Hướng Dẫn Triển Khai Lên Vercel (Production Deployment Guide)

Tài liệu này hướng dẫn chi tiết quy trình đưa website **“Vũ Văn Hà Công – Hành Trình 100 Ngày Học Tiếng Anh”** từ repository GitHub lên nền tảng đám mây **Vercel** với tối ưu hóa toàn diện cho SEO, bảo mật và hiệu năng.

> [!IMPORTANT]
> **Quy tắc an toàn Git & Lovable:**
> Repository này kết nối với Lovable. Tuyệt đối **không force push** (`git push --force`), **không rebase/amend** các commit đã đẩy lên remote. Luôn duy trì nhánh `main` ở trạng thái biên dịch thành công (`npm run build` pass 100%). Không tự ý deploy hoặc push mà không có sự kiểm tra kỹ lưỡng.

---

## 1. Tính Tương Thích Của Mã Nguồn Với Vercel

Dự án hiện tại sử dụng **Next.js 16+ App Router** với kiến trúc kết hợp:
- **SSG (Static Site Generation)**: Cho toàn bộ các trang công khai (`/`, `/journey`, `/journey/day/[day]`, `/vocabulary`, `/about`), xuất file HTML tĩnh sẵn sàng cache trên mạng lưới CDN toàn cầu của Vercel (Edge Network).
- **Serverless Route Handlers**: Cho các API quản trị đăng nhập, phiên cookie và lưu bài học GitHub (`/api/admin/*`).
- **Middleware / Edge Proxy**: Bảo vệ phân quyền truy cập, gắn cờ `X-Robots-Tag: noindex` cho môi trường preview và khu vực `/admin`.
- **Metadata Routes**: Tự động sinh `sitemap.xml` và `robots.txt` khớp theo domain production.

Do đó, dự án tương thích **100% nguyên bản** với Vercel mà không cần cài đặt thêm plugin hay cấu hình adapter phức tạp.

---

## 2. Các Bước Kết Nối & Thiết Lập Dự Án Trên Vercel

### Bước 2.1: Nhập Repository từ GitHub vào Vercel Dashboard
1. Truy cập [https://vercel.com/dashboard](https://vercel.com/dashboard) và đăng nhập bằng tài khoản GitHub của bạn (`congkcks`).
2. Nhấn nút **"Add New..."** → Chọn **"Project"**.
3. Tại danh sách GitHub repositories, tìm dự án `pixel-perfect-replica` (hoặc tên repo bạn đã đặt) và nhấn **"Import"**.

### Bước 2.2: Cấu Hình Dự Án (Project Configuration)
Tại màn hình **"Configure Project"**, điền các thông tin sau:
- **Project Name**: `vuvanhacong-100days` (hoặc tùy chọn bạn muốn hiển thị).
- **Framework Preset**: Chọn **Next.js** (Vercel thường sẽ tự động nhận diện).
- **Root Directory**: Để trống `./` (nếu repo ở thư mục gốc).
- **Build and Output Settings**:
  - *Build Command*: `npm run build` (hoặc `next build`).
  - *Output Directory*: `.next` (mặc định của Next.js).
  - *Install Command*: `npm install`.

### Bước 2.3: Thiết Lập Biến Môi Trường (Environment Variables)
Mở rộng mục **"Environment Variables"** và cấu hình các biến sau:

| Tên biến | Kiểu môi trường | Mô tả & Giá trị mẫu |
| :--- | :--- | :--- |
| `SITE_URL` | Production | Tên miền chính thức của bạn, ví dụ: `https://vuvanhacong.com` hoặc `https://vuvanhacong-100days.vercel.app` (không có dấu `/` ở cuối). |
| `NEXT_PUBLIC_SITE_URL` | Production | Trùng với giá trị của `SITE_URL`. |
| `ADMIN_PASSWORD` | Production, Preview | Mật khẩu bí mật dùng để truy cập `/admin`. Đặt chuỗi mạnh (ít nhất 16 ký tự, gồm chữ hoa, thường, số, ký tự đặc biệt). |
| `SESSION_SECRET` | Production, Preview | Chuỗi ngẫu nhiên dài dùng để ký mã hóa HMAC cho cookie phiên quản trị `vvhc_admin_session`. |
| `GITHUB_TOKEN` | Production | *(Tùy chọn cho Git-CMS)* Personal Access Token (classic) của GitHub có quyền `repo` (Contents: Read and write) để tính năng lưu bài viết trong `/admin` có thể tự động commit file Markdown vào repo. |
| `GITHUB_REPO_OWNER` | Production | Tên tài khoản GitHub sở hữu repo, ví dụ: `congkcks`. |
| `GITHUB_REPO_NAME` | Production | Tên repository, ví dụ: `pixel-perfect-replica`. |
| `GITHUB_BRANCH` | Production | Nhánh hoạt động chính: `main`. |

> [!TIP]
> Nếu bạn chưa gắn tên miền riêng (`custom domain`), Vercel sẽ tự động cấp một domain dạng `*.vercel.app`. Hệ thống SEO trong mã nguồn đã được cấu hình tự động nhận diện `VERCEL_PROJECT_PRODUCTION_URL` và `VERCEL_URL` để sinh canonical và sitemap chuẩn mà không bị lỗi domain giả định.

---

## 3. Quá Trình Triển Khai (Deploy) & Kiểm Tra Sau Triển Khai

1. Nhấn nút **"Deploy"** và chờ Vercel thực hiện quy trình cài đặt, chạy TypeScript và build SSG (thường mất khoảng 1–2 phút).
2. Khi build thành công, màn hình sẽ hiển thị thông báo chúc mừng kèm ảnh chụp màn hình website.

---

## 4. Danh Mục Kiểm Tra SEO & Kỹ Thuật Sau Khi Lên Sóng (Post-Deployment Audit)

Ngay sau khi trang web hoạt động trên domain production, hãy mở trình duyệt hoặc dùng cURL kiểm tra các tiêu chí sau:

### 4.1. Kiểm tra Sitemap Động
Truy cập: `https://<YOUR-DOMAIN>/sitemap.xml`
- [ ] Phải trả về mã **HTTP 200** với header `Content-Type: application/xml`.
- [ ] Mọi thẻ `<loc>` phải chứa domain production chính thức (có `https://`), tuyệt đối không chứa `localhost` hay `example.com`.
- [ ] Chỉ chứa các bài học công khai (`/journey/day/1`, `/journey/day/2`, `/journey/day/3`, ...) và các trang chính (`/`, `/journey`, `/vocabulary`, `/about`).
- [ ] Tuyệt đối **không** xuất hiện đường dẫn `/admin` trong file sitemap.

### 4.2. Kiểm tra Robots.txt
Truy cập: `https://<YOUR-DOMAIN>/robots.txt`
- [ ] Trả về mã **HTTP 200** với header `Content-Type: text/plain`.
- [ ] Chứa lệnh:
  ```txt
  User-Agent: *
  Allow: /
  Disallow: /admin
  Disallow: /admin/
  Disallow: /api/admin/
  Disallow: /api/admin/*

  Sitemap: https://<YOUR-DOMAIN>/sitemap.xml
  ```
- [ ] Trên các URL Preview (`*.vercel.app`), robots.txt tự động chuyển thành `Disallow: /` để ngăn Google thu thập nội dung trùng lặp.

### 4.3. Kiểm tra Thẻ Canonical & Meta Từng Trang
Mở `View Source` (Ctrl + U) trên trình duyệt:
- **Trang chủ (`/`)**:
  - Title: `Vũ Văn Hà Công | Hành Trình 100 Ngày Học Tiếng Anh`
  - Canonical: `<link rel="canonical" href="https://<YOUR-DOMAIN>/" />`
  - H1: `Hành Trình 100 Ngày Học Tiếng Anh Của Vũ Văn Hà Công`
- **Trang chi tiết bài học (`/journey/day/1`)**:
  - Title: `Ngày 01: Giới thiệu bản thân bằng tiếng Anh | Vũ Văn Hà Công`
  - Canonical: `<link rel="canonical" href="https://<YOUR-DOMAIN>/journey/day/1" />`
  - Nội dung bài học Markdown đã được render đầy đủ thành các thẻ HTML `<h1>`, `<h2>`, `<p>`, `<table>`.
- **Trang quản trị (`/admin`)**:
  - Thẻ meta: `<meta name="robots" content="noindex, nofollow, nocache" />`.

### 4.4. Kiểm tra Dữ Liệu Cấu Trúc (Structured Data JSON-LD)
Kiểm tra trong thẻ `<head>` có đầy đủ 4 lược đồ schema chuẩn:
1. `Person`: Khai báo thông tin kỹ sư Vũ Văn Hà Công, nghề nghiệp, link mạng xã hội (GitHub, LinkedIn, Facebook).
2. `WebSite`: Khai báo tên website "Hành Trình 100 Ngày Học Tiếng Anh".
3. `BreadcrumbList`: Khai báo cấu trúc điều hướng phân cấp rõ ràng cho Googlebot.
4. `Article` / `BlogPosting`: Khai báo tác giả, ngày đăng, tiêu đề cho từng bài học.

---

## 5. Cấu Hình Tên Miền Riêng (Custom Domain - Tùy Chọn)

Nếu bạn có tên miền riêng (ví dụ: `vuvanhacong.com`):
1. Vào tab **Settings** → **Domains** trên Vercel.
2. Nhập tên miền của bạn và nhấn **Add**.
3. Cấu hình bản ghi DNS tại nhà cung cấp tên miền của bạn theo hướng dẫn của Vercel:
   - Bản ghi `A`: trỏ `@` về `76.76.21.21`
   - Bản ghi `CNAME`: trỏ `www` về `cname.vercel-dns.com`
4. Cập nhật lại biến môi trường `SITE_URL=https://vuvanhacong.com` trên Vercel và Trigger Redeploy để toàn bộ Canonical & Sitemap được đồng bộ sang domain mới.
