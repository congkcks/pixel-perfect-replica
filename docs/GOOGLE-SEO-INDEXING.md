# Hướng Dẫn Tối Ưu & Khai Báo Google Search Console (SEO Indexing Guide)

Tài liệu này hướng dẫn chi tiết từng bước khai báo, xác minh quyền sở hữu, gửi sơ đồ trang web (`sitemap.xml`) và yêu cầu Google thu thập dữ liệu (crawl & index) cho website **“Vũ Văn Hà Công – Hành Trình 100 Ngày Học Tiếng Anh”**.

> [!NOTE]
> **Thực tế về thuật toán Google:**
> SEO là một quá trình liên tục. Không một chuyên gia hay công cụ nào có thể cam kết website sẽ đứng top 1 hoặc được lập chỉ mục ngay lập tức trong vài phút. Googlebot thường mất từ **vài ngày đến vài tuần** để phát hiện, thu thập dữ liệu, đánh giá độ tin cậy của tên miền và xếp hạng kết quả tìm kiếm. Việc tối ưu hóa kỹ thuật (Technical SEO) chuẩn xác giúp Googlebot hiểu website nhanh nhất và thuận lợi nhất có thể.

---

## 1. Các Từ Khóa Mục Tiêu Đã Được Tối Ưu Hóa Trong Mã Nguồn

Website được cấu trúc semantic HTML, Open Graph, meta description và Schema JSON-LD phục vụ các truy vấn tìm kiếm chính:

1. `Vũ Văn Hà Công` (Khớp thông tin cá nhân, Schema Person, Title trang chủ và giới thiệu).
2. `Vũ Văn Hà Công - Hành Trình 100 Ngày Học Tiếng Anh` (Khớp trực tiếp Title trang chủ, H1 thẻ tiêu đề chính, og:title, Schema WebSite).
3. `Vũ Văn Hà Công học tiếng Anh` (Khớp mô tả description, các bài học, kho từ vựng và nhật ký).
4. `Hành trình 100 ngày học tiếng Anh của Công` (Khớp từ khóa phụ, anchor text, và thẻ H1 phụ).
5. `Vu Van Ha Cong` (Khớp từ khóa không dấu, alternate name trong Schema Person).

---

## 2. Bước 1: Xác Minh Quyền Sở Hữu Trên Google Search Console

1. Truy cập [Google Search Console](https://search.google.com/search-console) và đăng nhập bằng tài khoản Google của bạn.
2. Nhấn nút **"Thêm tài sản" (Add property)**:
   - **Cách 1: Tiền tố URL (URL prefix) - Khuyến nghị nếu dùng domain Vercel miễn phí (`https://<project>.vercel.app`)**:
     - Nhập chính xác URL đầy đủ: `https://<YOUR-DOMAIN>/` (ví dụ: `https://vuvanhacong.com/` hoặc `https://vuvanhacong-100days.vercel.app/`).
     - Chọn phương thức xác minh bằng **Thẻ HTML (HTML tag)**: Google sẽ cấp cho bạn một đoạn mã meta dạng:
       ```html
       <meta name="google-site-verification" content="CHUOI_XAC_MINH_CUA_BAN" />
       ```
     - Bạn chỉ cần thêm biến môi trường `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=CHUOI_XAC_MINH_CUA_BAN` trên Vercel hoặc gắn vào `<head>` trong `src/app/layout.tsx`.
   - **Cách 2: Miền (Domain) - Khuyến nghị nếu có Tên miền riêng**:
     - Nhập `vuvanhacong.com`.
     - Thêm một bản ghi `TXT` vào cấu hình DNS của nhà cung cấp tên miền theo hướng dẫn của Google.
3. Sau khi cấu hình, quay lại Google Search Console và nhấn nút **"Xác minh" (Verify)**.

---

## 3. Bước 2: Gửi Sơ Đồ Trang Web (Sitemap Submission)

Sơ đồ trang web của dự án được tạo động tại đường dẫn `/sitemap.xml`:
- Chỉ chứa các trang công khai và bài học đã hoàn thành.
- Tự động cập nhật thuộc tính `lastmod` theo ngày xuất bản của bài học.
- Tự động loại bỏ các trang `/admin` và preview.

**Cách gửi:**
1. Tại menu bên trái của Google Search Console, chọn mục **"Sơ đồ trang web" (Sitemaps)**.
2. Tại ô **"Thêm sơ đồ trang web mới" (Add a new sitemap)**, điền:
   ```
   sitemap.xml
   ```
3. Nhấn **"Gửi" (Submit)**.
4. Trạng thái sau khi xử lý sẽ chuyển thành **"Thành công" (Success)** với số lượng URL được phát hiện (ví dụ: 8 URL gồm 4 trang tĩnh + các bài học ngày 1, 2, 3, 99).

---

## 4. Bước 3: Kiểm Tra URL & Yêu Cầu Lập Chỉ Mục Thủ Công (URL Inspection)

Đối với các trang quan trọng nhất, bạn có thể đẩy nhanh tốc độ lập chỉ mục của Google bằng tính năng kiểm tra URL:

1. Dán đường dẫn trang chủ `https://<YOUR-DOMAIN>/` vào thanh tìm kiếm trên cùng của Google Search Console (mục **"Kiểm tra URL" / URL Inspection**).
2. Nhấn **Enter**. Google sẽ kiểm tra dữ liệu hiện có.
3. Nhấn nút **"Kiểm tra URL đang hoạt động" (Test Live URL)** để xem Googlebot có đọc được HTML và nội dung không.
4. Nhấn nút **"Yêu cầu lập chỉ mục" (Request Indexing)**.
5. Lặp lại thao tác này cho 3 trang quan trọng tiếp theo:
   - `https://<YOUR-DOMAIN>/about` (Trang hồ sơ tác giả Vũ Văn Hà Công).
   - `https://<YOUR-DOMAIN>/journey` (Trang lộ trình 100 ngày).
   - `https://<YOUR-DOMAIN>/journey/day/1` (Bài học ngày đầu tiên).

> [!NOTE]
> Google giới hạn số lần yêu cầu lập chỉ mục mỗi ngày (khoảng 10–20 URL/ngày). Không nên spam nút yêu cầu liên tục.

---

## 5. Bước 4: Kiểm Tra Dữ Liệu Cấu Trúc Bằng Rich Results Test

Để chắc chắn Google nhận diện chuẩn xác thông tin cá nhân và bài viết của bạn:
1. Truy cập công cụ chính thức của Google: [Rich Results Test](https://search.google.com/test/rich-results).
2. Nhập URL trang chủ và trang bài học ngày 1:
   - `https://<YOUR-DOMAIN>/`
   - `https://<YOUR-DOMAIN>/journey/day/1`
3. Kết quả mong đợi:
   - Phát hiện hợp lệ các loại: **Person**, **WebSite**, **Breadcrumbs**, **Article / BlogPosting**.
   - Không có cảnh báo lỗi cú pháp đỏ (0 errors).

---

## 6. Bước 5: Theo Dõi Tiến Độ Sau Khi Lên Sóng

### 6.1. Kiểm tra bằng lệnh tìm kiếm Google (Search Operator)
Sau khoảng 3 đến 7 ngày kể từ khi gửi sitemap, hãy mở Google và gõ:
```
site:<YOUR-DOMAIN>
```
*Ví dụ:* `site:vuvanhacong.com` hoặc `site:vuvanhacong-100days.vercel.app`.
- Nếu Google trả về danh sách các trang của bạn, website đã được lập chỉ mục thành công!

### 6.2. Kiểm tra các từ khóa mục tiêu
Thử tìm kiếm trong tab ẩn danh của trình duyệt:
- `Vũ Văn Hà Công`
- `Vũ Văn Hà Công - Hành Trình 100 Ngày Học Tiếng Anh`
- `Vũ Văn Hà Công học tiếng Anh`
- `Hành trình 100 ngày học tiếng Anh của Công`
- `Vu Van Ha Cong`

### 6.3. Theo dõi Báo cáo Trong Google Search Console
- **Mục "Trang" (Page Indexing)**: Xem số trang đã được lập chỉ mục (Indexed) và lý do các trang chưa được lập (nếu có).
- **Mục "Hiệu suất" (Performance)**: Xem số lượt hiển thị (Impressions), số lượt nhấp chuột (Clicks), vị trí trung bình (Average Position) và danh sách cụm từ người dùng đã gõ để tìm thấy bạn.
