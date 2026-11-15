# PRD: ISS – Quản lý máy chủ và ứng dụng cài đặt

- **Project:** ISS
- **Agent:** Tàng Thư Sinh · Product Manager (John)
- **Cập nhật:** 2026-11-15 (bổ sung theo yêu cầu #1 "Chạy project lên nào")
- **Đầu vào:** `docs/bmad-office/yeu-cau/yeu-cau-001.md`, phân tích của Thiên Cơ Tử (BA), mã hiện có trong `src/`, kết quả chạy thật `npm run build/lint/test` ngày 2026-11-15
- **Bàn giao cho:** Cơ Quan Sư · Architect (cập nhật `architecture.md`, mục Hạ tầng & triển khai), sau đó Minh Chủ · BMad Master
- **Lưu ý nguồn:** `product-brief.md` vẫn là khung rỗng, nên mục tiêu/người dùng dưới đây suy ra từ yêu cầu #1 và mã thật. Các điểm chưa được người dùng xác nhận ghi ở mục "Giả định".

## 1. Mục tiêu

- Cung cấp ứng dụng web nội bộ **ISS** để quản lý **thông tin máy chủ** và **ứng dụng/phiên bản đã cài đặt trên từng máy chủ** (yêu cầu #1).
- **Mục tiêu của yêu cầu hiện tại ("Chạy project lên nào"):** một người mới clone repo có thể khởi động ứng dụng trên máy cục bộ bằng vài lệnh, thấy giao diện chạy, và biết chắc build/lint/test đều đạt, không phải đoán môi trường.
- Chỉ số thành công của yêu cầu hiện tại:
  - Từ repo sạch đến lúc thấy giao diện: ≤ 3 lệnh (`npm install`, `npm run dev`, mở trình duyệt).
  - 0 lỗi console khi tải trang đầu; 100% test đạt (hiện 331/331).
  - Lỗi do sai phiên bản Node được báo rõ, không phải lỗi khó hiểu.

## 2. Người dùng

- **Lập trình viên / người vận hành ISS** (chính): chạy, kiểm tra và đánh giá ứng dụng trên máy cục bộ.
- **Quản trị hạ tầng** (người dùng cuối của ứng dụng): xem, thêm, sửa, xóa máy chủ; ghi nhận ứng dụng đã cài.

## 3. Hiện trạng đã kiểm chứng (2026-11-15)

| Hạng mục | Kết quả | Ghi chú |
|---|---|---|
| `npm run build` (Node 22.13.0) | Đạt | `tsc -b && vite build`, 3 tệp trong `dist/` |
| `npm run lint` | Đạt | Không lỗi |
| `npm test` | Đạt 331/331 | Chạy khoảng 250 giây (jsdom tạo lại cho mỗi tệp) |
| Node mặc định trên máy | v10.24.1 | **Không** chạy được; cần Node ≥ 20.19 (khai báo `engines`), máy có sẵn v20.19.4, v22.13.0, v22.23.1 trong nvm |
| `npm run dev` | Chưa chạy thật trong bước PRD | Dev/QA xác minh theo AC-R2 |
| Mã nguồn chưa commit | `.gitignore`, `index.html`, `src/main.tsx`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `src/data/servers.json`, `src/types/server.ts`, `src/test/setup.ts`, `package-lock.json`… | HEAD hiện **không** tự build được nếu thiếu các tệp này |

## 4. Yêu cầu chức năng

### 4.1 Chạy project (phạm vi yêu cầu hiện tại)

- **FR-R1 – Cài phụ thuộc:** `npm install` hoàn tất không lỗi trên Node ≥ 20.19, dùng `package-lock.json` để cho ra cùng phiên bản phụ thuộc.
- **FR-R2 – Chạy chế độ phát triển:** `npm run dev` khởi động Vite, in địa chỉ truy cập cục bộ (mặc định `http://localhost:5173`), có tải lại nóng khi sửa mã.
- **FR-R3 – Giao diện khởi động đúng:** mở địa chỉ trên thấy tiêu đề "ISS – Quản lý máy chủ", danh sách máy chủ lấy từ `src/data/servers.json` (3 máy chủ mẫu), có thể chuyển sang mục Ứng dụng.
- **FR-R4 – Bản build sản xuất:** `npm run build` tạo `dist/`; `npm run preview` phục vụ bản đó và giao diện hoạt động như chế độ dev.
- **FR-R5 – Kiểm tra chất lượng:** `npm run lint` và `npm test` chạy được và đạt.
- **FR-R6 – Báo lỗi phiên bản Node:** nếu Node thấp hơn yêu cầu, người dùng nhận thông báo dễ hiểu nêu rõ cần Node ≥ 20.19 (qua `engines` và hướng dẫn trong README).
- **FR-R7 – Hướng dẫn chạy:** có `README.md` ở gốc repo: yêu cầu môi trường, các lệnh (`install`, `dev`, `build`, `preview`, `lint`, `test`), cách chọn Node bằng nvm trên Windows, nơi dữ liệu mẫu và cách khôi phục dữ liệu (xóa localStorage), xử lý sự cố thường gặp (cổng 5173 bận, Node sai phiên bản).
- **FR-R8 – Repo tự đủ:** mọi tệp cần để chạy (cấu hình, `index.html`, `src/main.tsx`, types, dữ liệu JSON, lock file) được commit; `.gitignore` loại `node_modules`, `dist`, `.env`, `*.local`.

### 4.2 Quản lý máy chủ (Epic 1 – đã phát triển, ghi lại để PRD đầy đủ)

- **FR1:** Mô hình máy chủ gồm `id`, `name`, `hostname`, `ipAddress` (IPv4), `os`, `environment` (production/staging/development), `status` (online/offline/maintenance), `description` (tùy chọn); dữ liệu mẫu nạp từ JSON, kiểm tra hợp lệ, loại bản ghi hỏng/trùng id kèm cảnh báo (story 1.1).
- **FR2:** Xem danh sách máy chủ, lọc/tìm kiếm, xem chi tiết (story 1.2).
- **FR3:** Thêm, sửa, xóa máy chủ có kiểm tra hợp lệ và xác nhận khi xóa; dữ liệu giữ trong localStorage (story 1.3).

### 4.3 Quản lý ứng dụng cài đặt (Epic 2)

- **FR4:** Danh mục ứng dụng: xem, thêm, sửa, xóa, xem chi tiết (story 2.1).
- **FR5:** Ghi nhận ứng dụng/phiên bản đã cài trên từng máy chủ, tham chiếu máy chủ theo `id`; "cài đặt" nghĩa là **ghi nhận**, không cài thật, không backend (story 2.2).
- **FR6:** Xem ứng dụng đã cài ngay trên trang chi tiết máy chủ và máy chủ nào đang dùng ứng dụng trên trang chi tiết ứng dụng; cập nhật phiên bản, gỡ ghi nhận (story 2.3).

## 5. Yêu cầu phi chức năng

- **NFR1 – Môi trường:** Node ≥ 20.19, npm đi kèm; hệ điều hành Windows/macOS/Linux; chỉ cần trình duyệt hiện đại, không cần backend hay cơ sở dữ liệu.
- **NFR2 – Thời gian khởi động:** `npm run dev` sẵn sàng trong ≤ 10 giây sau khi đã cài phụ thuộc (ước lượng; Vite báo ~1 giây). Build ≤ 30 giây (thực tế < 1 giây cho phần Vite).
- **NFR3 – Tính lặp lại:** cùng commit + Node ≥ 20.19 cho cùng kết quả build/test (nhờ lock file).
- **NFR4 – Kiểm thử:** toàn bộ test đạt; thời gian `npm test` hiện ~250 giây là nợ kỹ thuật cần giảm (xem mục Rủi ro), mục tiêu ≤ 120 giây.
- **NFR5 – Chất lượng mã:** TypeScript `strict`, không `any`, lint sạch.
- **NFR6 – Khả dụng:** giao diện tiếng Việt, hiển thị đúng trên màn hình ≥ 1024 px.
- **NFR7 – Dữ liệu & bảo mật:** dữ liệu mẫu không chứa bí mật; không có xác thực (ứng dụng cục bộ); không commit `.env`.
- **NFR8 – Độ bền dữ liệu:** dữ liệu hỏng trong JSON/localStorage không làm sập ứng dụng.

## 6. Tiêu chí nghiệm thu (yêu cầu "Chạy project lên nào")

Điều kiện chung: máy dùng Node ≥ 20.19 (ví dụ v22.13.0), repo ở trạng thái đã commit đầy đủ.

| Mã | Tiêu chí (Given / When / Then) | Cách kiểm |
|---|---|---|
| **AC-R1** | Given repo vừa clone, when chạy `npm install`, then thoát mã 0, tạo `node_modules`, không đổi `package-lock.json` | Chạy lệnh trên thư mục sạch, `git status` sau đó |
| **AC-R2** | Given đã cài phụ thuộc, when chạy `npm run dev`, then Vite in địa chỉ `http://localhost:5173/` và tiến trình giữ chạy không lỗi | Chạy lệnh, `curl` địa chỉ trả HTTP 200 |
| **AC-R3** | Given dev server chạy, when mở trình duyệt vào địa chỉ đó, then thấy tiêu đề "ISS – Quản lý máy chủ" và danh sách 3 máy chủ mẫu, console không có lỗi (error) | Mở trình duyệt, kiểm tra console |
| **AC-R4** | Given giao diện đang mở, when thêm một máy chủ rồi tải lại trang, then máy chủ vẫn còn; when chuyển sang mục Ứng dụng, then danh sách ứng dụng hiển thị | Thao tác tay trên giao diện |
| **AC-R5** | Given đã cài phụ thuộc, when chạy `npm run build`, then thoát mã 0 và có `dist/index.html` cùng tệp JS/CSS | Chạy lệnh, kiểm tra `dist/` |
| **AC-R6** | Given đã build, when chạy `npm run preview` và mở địa chỉ in ra, then giao diện giống AC-R3 | Chạy lệnh, mở trình duyệt |
| **AC-R7** | Given Node ≥ 20.19, when chạy `npm run lint`, then không có lỗi | Chạy lệnh |
| **AC-R8** | Given Node ≥ 20.19, when chạy `npm test`, then toàn bộ test đạt (hiện 331/331) | Chạy lệnh |
| **AC-R9** | Given Node thấp hơn 20.19, when chạy `npm install`/`npm run dev`, then người dùng nhận thông báo yêu cầu Node ≥ 20.19, không phải lỗi cú pháp khó hiểu | Chạy với Node 10 (có sẵn trong nvm) và đọc thông báo; nếu npm không chặn được, README phải ghi rõ cảnh báo ở đầu mục "Chạy" |
| **AC-R10** | Given repo ở HEAD, when clone mới vào thư mục khác rồi làm AC-R1 → AC-R5, then đạt mà không cần tệp nào chưa commit | Clone cục bộ, chạy lại các bước |
| **AC-R11** | Given README, when người mới làm theo từng bước, then chạy được ứng dụng mà không cần hỏi thêm | Một người chưa biết dự án đọc và làm thử |

**Định nghĩa hoàn thành (yêu cầu này):** AC-R1 → AC-R11 đạt, có bằng chứng (đầu ra lệnh, ảnh chụp hoặc mô tả giao diện) trong Dev Agent Record/QA; các tệp còn untracked được commit; tài liệu `README.md` tồn tại.

## 7. Phạm vi

**Trong phạm vi:** khởi chạy cục bộ (dev, build, preview), kiểm tra lint/test, README, đưa mã còn untracked vào repo, thông báo phiên bản Node.

**Ngoài phạm vi:** triển khai lên máy chủ/cloud, Docker, CI/CD, backend/API thật, xác thực, thêm tính năng nghiệp vụ mới, cài ứng dụng thật lên máy chủ.

## 8. Giả định, rủi ro và câu hỏi mở

- **Giả định (PM tự quyết, chờ xác nhận):**
  1. "Chạy project" = chạy cục bộ bằng Vite dev server, không cần triển khai; không có backend.
  2. Cổng mặc định 5173 đủ dùng; không cố định cổng trong cấu hình.
  3. Hướng dẫn chọn Node đặt trong README; không thêm tệp `.nvmrc` ép buộc trừ khi Architect đề xuất (ứng viên `22`).
- **Rủi ro:**
  - Node mặc định trên máy là v10, dễ gây lỗi khó hiểu. Giảm thiểu: AC-R9, README, `.nvmrc`.
  - HEAD thiếu nhiều tệp cấu hình untracked, clone mới sẽ không chạy được (AC-R10).
  - `npm test` ~250 giây do jsdom khởi tạo mỗi tệp (24 lần, 535 giây tổng); gợi ý thử `pool: 'vmThreads'` hoặc `isolate: false`. Đây là tối ưu, không chặn việc chạy ứng dụng.
  - Tài liệu `product-brief.md`, `architecture.md`, `epics.md` còn là khung rỗng, dễ lệch với PRD này.
- **Câu hỏi mở cho Architect/BMad Master:** có cần chốt `.nvmrc` hoặc kiểm tra phiên bản Node bằng `preinstall` script không; Epic 3 (nếu có) có cần backend thật để thay JSON/localStorage không.

## 9. Epic

- **Epic 1 – Quản lý thông tin máy chủ** (story 1.1–1.3): đã phát triển, QA PASS.
- **Epic 2 – Ghi nhận ứng dụng cài đặt trên máy chủ** (story 2.1–2.3): đang thực hiện.
- **Epic 3 – Chạy và vận hành cục bộ (mới, từ yêu cầu #1 hiện tại):**
  - Story 3.1: Đưa toàn bộ tệp cấu hình/mã còn untracked vào repo, bảo đảm clone mới build được (FR-R8, AC-R10).
  - Story 3.2: Viết `README.md` và cơ chế báo lỗi phiên bản Node (FR-R6, FR-R7, AC-R9, AC-R11).
  - Story 3.3: Xác minh chạy thật `dev`, `build`, `preview`, `lint`, `test` và ghi bằng chứng (FR-R1–R5, AC-R1–R8).

Việc chia story 3.x chi tiết, có tiêu chí nghiệm thu từng story, thuộc bước Epics & Stories sau khi Architect cập nhật kiến trúc.
