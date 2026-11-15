# Báo cáo QA: Story 1.2 · Danh sách, tìm kiếm/lọc và xem chi tiết máy chủ

- **Project:** ISS
- **Người kiểm thử:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày:** 2026-11-15
- **Story:** `docs/stories/1.2.story.md` (bản sao `docs/bmad-office/story-1.2.md`)
- **Môi trường:** Windows 10, Node v22.13.0 (nvm; máy mặc định là Node 10 nên phải chuyển phiên bản)
- **Phạm vi:** kiểm thử trên working tree hiện tại (gồm các tệp chưa commit). Không sửa mã ứng dụng.

## Kết luận

**ĐẠT (PASS).** Cả 10 tiêu chí nghiệm thu đều đạt, có bằng chứng chạy thật và đọc mã. Không có vấn đề chặn; còn 1 vấn đề Trung bình về quy trình (tệp cấu hình/types/data của 1.1 chưa commit, đã biết từ QA 1.1) và vài mục Thấp.

## Kết quả chạy

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | exit 0, không lỗi/cảnh báo |
| `npm run build` (`tsc -b && vite build`) | exit 0, 39 module, JS 251,17 kB (gzip 75,43 kB) |
| `npm test` (`vitest run`) | exit 0, **24/24 tệp, 331/331 test đạt**, ~301 s |

Các test thuộc phạm vi 1.2: `filterServers.test.ts` (14), `serverLabels.test.ts` (3), `ServerList.test.tsx` (12), `ServerDetail.test.tsx` (13, gồm phần Sửa/Xóa của story sau), `App.test.tsx` (6), `App.integration.test.tsx` (2). Tất cả nằm trong 331 test đạt.

## Đối chiếu tiêu chí nghiệm thu

| AC | Kết quả | Bằng chứng |
|---|---|---|
| AC1 – Danh sách máy chủ | **Đạt** | `ServerList.tsx` render `<table>` 5 cột (Tên, Hostname, Địa chỉ IP, Môi trường, Trạng thái) từ `servers.map` giữ thứ tự đầu vào; `App.tsx` lấy `servers` từ `repository.getAll()` và giữ dòng "Đã tải {servers.length} máy chủ". Test: `ServerList.test` "đủ cột và đủ dòng theo thứ tự đầu vào"; `App.integration.test` thấy "Web chính", "Cơ sở dữ liệu thử nghiệm", "Máy build" và "Đã tải 3 máy chủ". |
| AC2 – Nhãn tiếng Việt | **Đạt** | `serverLabels.ts`: online→"Đang hoạt động", offline→"Ngừng hoạt động", maintenance→"Bảo trì"; production/staging/development→"Production"/"Staging"/"Development". Trạng thái luôn là chữ trong `<span class="status ...">`. Test: `serverLabels.test` (3), `ServerList.test` "không lộ giá trị thô". |
| AC3 – Tìm kiếm | **Đạt** | `filterServers.ts`: `query.trim().toLowerCase()`, so `includes` trên tên, hostname, IP; query rỗng/khoảng trắng → không lọc; không đụng `os`/`description`. Dùng `includes` nên không có rủi ro regex. Test: khớp từng trường, hoa/thường, trim, query trống, "không tìm theo trường ngoài". |
| AC4 – Lọc trạng thái và môi trường | **Đạt** | Hai `<select>` có "Tất cả" (`value="all"`) mặc định cộng 3 giá trị từ `SERVER_STATUSES`/`SERVER_ENVIRONMENTS`; `parseStatus/parseEnvironment` chặn giá trị lạ về `all`; điều kiện kết hợp AND trong `filterServers`. Test: `filterServers.test` "kết hợp … AND", `ServerList.test` "kết hợp tìm kiếm và bộ lọc theo AND", "label gắn đúng và mặc định Tất cả". |
| AC5 – Số lượng và trạng thái rỗng | **Đạt** | Luôn có "Hiển thị {X} / {N} máy chủ"; N>0 và X=0 → "Không tìm thấy máy chủ phù hợp" + nút "Xóa bộ lọc" (`onFiltersChange(DEFAULT_FILTERS)`); N=0 → "Chưa có máy chủ nào", không có nút xóa bộ lọc, không ném lỗi. Test: `ServerList.test` (3 test tương ứng, kiểm cả 3 điều khiển về mặc định), `App.test` "repository rỗng …". |
| AC6 – Xem chi tiết | **Đạt** | Tên máy chủ là `<button>` gọi `onSelect(id)`; `App.renderDetail` gọi `repository.getById(id)`; `ServerDetail.tsx` có `<dl>` đủ 8 trường (Tên, ID, Hostname, IP, Hệ điều hành, Môi trường, Trạng thái, Mô tả), mô tả thiếu → "Không có mô tả". Test: `ServerDetail.test` "đủ mọi trường", "Không có mô tả"; `App.test` kiểm `getById` được gọi với `'a'`; `App.integration.test` mở "Máy build" thấy "Windows Server 2022", "Không có mô tả", "Ngừng hoạt động". |
| AC7 – Quay lại danh sách | **Đạt** | `filters` là state của `App` (`useState(DEFAULT_FILTERS)`) nằm ngoài nhánh render theo màn hình nên không mất khi chuyển màn; nút "Quay lại danh sách" gọi `goTo({name:'list'})`. `getById` → `undefined` → "Không tìm thấy máy chủ" + vẫn có nút quay lại, không sập. Test: `App.test` "luồng danh sách → chi tiết → quay lại giữ nguyên bộ lọc" (ô tìm kiếm còn "alpha", trạng thái còn "online", "Hiển thị 1 / 2"), "id không còn tồn tại …"; `ServerDetail.test` (undefined, quay lại). |
| AC8 – Kiến trúc và quy ước | **Đạt** | `filterServers` là hàm thuần ở `src/domain/`, dùng `Array.filter` (không đổi mảng đầu vào, giữ thứ tự), có `filterServers.test.ts` riêng gồm test "không làm thay đổi mảng đầu vào". Grep: chỉ `repositories/serverRepository.ts` import `servers.json` (các tệp test khác import để dựng dữ liệu, không phải mã UI). Component trình bày (`ServerList`, `ServerDetail`) nhận dữ liệu qua props, không import repository. Không có `any` trong `src/` (grep), ESLint `no-explicit-any: error` qua. `package.json` chỉ có `react`, `react-dom` ở dependencies; TypeScript `strict`. |
| AC9 – Truy cập cơ bản | **Đạt** | `<table>`, `<th scope="col">`; ba ô có `<label htmlFor>` khớp `id` (`server-search`, `server-status-filter`, `server-environment-filter`); tên máy chủ là `<button type="button">` (dùng được bằng bàn phím). Test truy vấn bằng `getByLabelText`, `getByRole('button', …)`. |
| AC10 – Test và chất lượng | **Đạt** | `lint`, `build`, `test` đạt (bảng trên). Có đủ test theo danh mục: `filterServers`, `serverLabels`, `ServerList` (render, lọc, rỗng, xóa bộ lọc, bấm tên), `ServerDetail` (đủ trường, không mô tả, không tìm thấy, quay lại), `App` (luồng giữ bộ lọc, id không tồn tại, repository rỗng) và `App.integration.test.tsx` không mock chạy trên `servers.json` thật ("Đã tải 3 máy chủ"). |

## Chất lượng mã và bảo mật cơ bản

- Phân lớp đúng: `types` → `domain` (hàm thuần) → `repositories` → UI. Các nút/chức năng Thêm, Sửa, Xóa, cài đặt do story sau thêm vào cùng component được giữ nguyên, không làm lệch hành vi chỉ đọc của 1.2.
- Không có `dangerouslySetInnerHTML`, `innerHTML`, `eval` trong `src/`; dữ liệu người dùng (query, tên, mô tả) hiển thị qua JSX nên React tự escape. Tìm kiếm dùng `includes`, không tạo RegExp từ đầu vào.
- Không có bí mật trong mã; không có lời gọi mạng.
- Không thêm thư viện runtime; không có `any`.

## Vấn đề tìm thấy

| # | Mức | Mô tả | Cách sửa |
|---|---|---|---|
| V1 | Trung bình | Nợ kỹ thuật đã biết từ QA 1.1: `git status` vẫn cho thấy chưa commit `.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/servers.json`, `src/main.tsx`, `src/test/setup.ts`, `src/types/server.ts`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`, `src/App.installations.test.tsx`; ngoài ra `src/App.css` và vài test đang `M`. Clone sạch từ HEAD sẽ không build/test được (thiếu kiểu `Server`, JSON, cấu hình). Không ảnh hưởng kết quả kiểm thử trên working tree. | Ứng dụng tự commit đủ working tree; SM kiểm `git status` sạch trước khi bắt đầu 2.3, sau đó chạy `npm ci && npm run build` trên bản clone sạch. |
| V2 | Thấp | Bộ test chậm: ~301 s cho 331 test, jsdom được tạo 24 lần chiếm ~80% thời gian (vitest tự gợi ý). | Cân nhắc `pool: 'vmThreads'` hoặc `isolate: false` trong `vite.config.ts`. |
| V3 | Thấp | `App.test.tsx` chỉ mock `serverRepository`; `applicationRepository` và `installationRepository` vẫn là bản thật chạy trên localStorage jsdom. Hiện chưa gây lỗi, nhưng test có thể phụ thuộc trạng thái dùng chung nếu sau này có test ghi dữ liệu. | Truyền repository giả qua props `App` hoặc xóa localStorage trong `beforeEach`. |
| V4 | Thấp | Truy cập: `<h2>` tên và dòng "Tên" trong `<dl>` lặp nội dung; dòng "Hiển thị X / N máy chủ" không phải vùng `aria-live` nên trình đọc màn hình không tự đọc khi lọc; chưa quản lý focus khi chuyển danh sách ↔ chi tiết. Ngoài phạm vi AC9. | Story sau: cân nhắc `aria-live="polite"` cho dòng số lượng và đưa focus vào tiêu đề khi chuyển màn. |
| V5 | Thông tin | Các giả định của SM (nhãn tiếng Việt, tìm kiếm trên tên/hostname/IP, không lưu bộ lọc qua lần tải lại, nút "Xóa bộ lọc") vẫn chờ PM xác nhận; `architecture.md` vẫn là khung rỗng. | Không chặn; ghi nhận. |

## Kiểm thử còn thiếu (đề xuất, không chặn)

- Kiểm thử đường UI cho tìm kiếm có khoảng trắng đầu/cuối và query chỉ gồm khoảng trắng (hiện chỉ có ở `filterServers.test`).
- Kiểm thử nhập chuỗi chứa ký tự đặc biệt (`.*`, `(`) để khóa việc không dùng RegExp.

## Bàn giao

- Kết quả: **ĐẠT** → báo Thiết Tướng (Scrum Master); story 1.2 chuyển `Done`, `docs/bmad-office/sprint-status.yaml` cập nhật (không có `docs/sprint-status.yaml`; tệp thật nằm ở `docs/bmad-office/`).
- Không có bug report (`bug-1.2.md`) cần gửi Dev.
- Việc cần SM theo dõi: V1 (commit đủ tệp để HEAD build được).
