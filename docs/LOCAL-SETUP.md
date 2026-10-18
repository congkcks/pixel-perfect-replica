# Hướng Dẫn Cài Đặt & Chạy Local (Windows / PowerShell)

Tài liệu này hướng dẫn chi tiết cách thiết lập, cài đặt dependencies, kiểm tra lỗi và chạy môi trường phát triển (Development Server) cũng như Production Build trên máy tính Windows sử dụng PowerShell cho dự án **“Vũ Văn Hà Công – Hành Trình 100 Ngày Học Tiếng Anh”**.

---

## 1. Yêu Cầu Môi Trường (System Prerequisites)

| Công cụ | Phiên bản khuyến nghị | Lệnh kiểm tra |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x` (LTS hoặc mới hơn, khuyến nghị v22.x / v24.x) | `node -v` |
| **Package Manager** | `npm` (đi kèm Node.js) hoặc `bun` | `npm -v` |
| **Hệ điều hành** | Windows 10 / 11 (PowerShell 5.1+ hoặc PowerShell 7 Core) | `$PSVersionTable.PSVersion` |
| **Git** | 2.30+ | `git --version` |

---

## 2. Chuẩn Bị Biến Môi Trường (.env)

Sao chép tệp mẫu cấu hình sang tệp `.env.local`:

```powershell
# Chạy trong thư mục gốc dự án:
Copy-Item .env.example .env.local
```

Nội dung tối thiểu trong tệp `.env.local` cho môi trường máy cá nhân:

```env
# Địa chỉ website chạy local (để tính canonical & sitemap URL)
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Mật khẩu quản trị khu vực /admin (bắt buộc để đăng nhập)
ADMIN_PASSWORD=MatKhauQuanTri123!@#

# Chuỗi bí mật sinh phiên cookie HttpOnly an toàn
SESSION_SECRET=chuoi_khoa_bao_mat_ngau_nhien_it_nhat_32_ky_tu_123456

# (Tùy chọn) Token GitHub nếu muốn đồng bộ commit bài học trực tiếp lên Git repo
# GITHUB_TOKEN=ghp_your_personal_access_token_here
# GITHUB_REPO_OWNER=congkcks
# GITHUB_REPO_NAME=pixel-perfect-replica
# GITHUB_BRANCH=main
```

---

## 3. Cài Đặt Dependencies

Nếu bạn vừa clone repository hoặc chuyển nhánh, hãy cài đặt các gói phụ thuộc:

```powershell
npm install
```

---

## 4. Chạy Development Server

Chạy máy chủ Next.js App Router ở chế độ phát triển:

```powershell
npm run dev
```

Sau khi terminal hiển thị:
```
▲ Next.js 16.x.x (Turbopack)
- Local:   http://localhost:3000
- Network: http://<ip_mang_lan>:3000
✓ Ready in ...
```

Mở trình duyệt truy cập:
- **Trang chủ công khai**: [http://localhost:3000](http://localhost:3000)
- **Hành trình 100 ngày**: [http://localhost:3000/journey](http://localhost:3000/journey)
- **Chi tiết bài học ngày 1**: [http://localhost:3000/journey/day/1](http://localhost:3000/journey/day/1)
- **Kho từ vựng**: [http://localhost:3000/vocabulary](http://localhost:3000/vocabulary)
- **Giới thiệu tác giả Vũ Văn Hà Công**: [http://localhost:3000/about](http://localhost:3000/about)
- **Khu vực quản trị tác giả**: [http://localhost:3000/admin](http://localhost:3000/admin) (Đăng nhập bằng mật khẩu đã cấu hình ở `ADMIN_PASSWORD`)

---

## 5. Quy Trình Kiểm Thử Mã Nguồn & Chất Lượng (QA Pipeline)

Trước khi commit mã nguồn hoặc đẩy lên repository, luôn chạy 4 bước kiểm thử tiêu chuẩn sau:

### 5.1. Kiểm tra kiểu dữ liệu TypeScript (Zero Typescript Errors)
```powershell
npx tsc --noEmit
```
*Kết quả mong đợi: Lệnh thực thi thành công không xuất hiện bất kỳ mã lỗi nào (Exit code 0).*

### 5.2. Kiểm tra quy tắc định dạng và Linting (ESLint)
```powershell
npm run lint
```
*Kết quả mong đợi: 0 lỗi (`0 errors`).*

### 5.3. Chạy toàn bộ Unit Tests (Vitest)
```powershell
npm test
```
*Kết quả mong đợi: 6 test suites passed, 26/26 tests passed (gồm routing, markdown parsing, admin-auth, github-cms, server-api).*

### 5.4. Kiểm tra Production Build & Static Page Generation (SSG)
```powershell
npm run build
```
*Kết quả mong đợi: Next.js biên dịch thành công toàn bộ các trang tĩnh (`● SSG`, `○ Static`, `ƒ Dynamic`) không có lỗi prerender.*

---

## 6. Chạy Thử Nghiệm Production Build Tại Local

Để kiểm tra chính xác website hoạt động như trên CDN máy chủ:

```powershell
# Bước 1: Build mã nguồn
npm run build

# Bước 2: Khởi động máy chủ Production
npm run start
```

Kiểm tra các đường dẫn đặc biệt của SEO:
1. **Robots.txt**: `curl http://localhost:3000/robots.txt`
2. **Sitemap.xml**: `curl http://localhost:3000/sitemap.xml`
3. **Mã HTTP 404**: `curl -I http://localhost:3000/trang-khong-ton-tai` (Trả về HTTP 404)
4. **Bảo vệ API Admin**: `curl -X POST http://localhost:3000/api/admin/lessons/save` (Trả về HTTP 401 Unauthorized)

---

## 7. Xử Lý Các Sự Cố Thường Gặp (Troubleshooting)

- **Lỗi cổng 3000 bị chiếm dụng**:
  Chạy lệnh PowerShell sau để kiểm tra và dừng tiến trình:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```
- **Lỗi Hydration Warning**:
  Đã được cấu hình `suppressHydrationWarning` tại `src/app/layout.tsx`. Toàn bộ dữ liệu bài học từ disk được đồng bộ an toàn qua SSR mà không gây mismatch giữa server và client.
- **Xóa bộ nhớ đệm cache khi sửa đổi lớn**:
  ```powershell
  Remove-Item -Recurse -Force .next
  npm run build
  ```
