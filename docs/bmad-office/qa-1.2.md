# Báo cáo QA: Story 1.2 – Danh sách, tìm kiếm/lọc và xem chi tiết máy chủ

- **Project:** ISS
- **Agent:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày kiểm thử:** 2026-11-15
- **Story:** `docs/bmad-office/story-1.2.md` (Dev: Kiếm Thánh, commit `7860560`)
- **Môi trường:** Windows 10, Node v22.13.0 (nvm; máy mặc định là Node 10, không dùng được)
- **Ghi chú đường dẫn:** repo thực tế dùng `docs/bmad-office/`, không có `docs/stories/` hay `docs/qa/`. Báo cáo này thay thế khung "mô phỏng" cũ tại cùng đường dẫn.

## Kết luận

**ĐẠT (PASS).** AC1–AC10 đều đạt, có bằng chứng chạy thật. Không có lỗi chặn. Có 3 vấn đề mức Trung bình/Thấp, không ảnh hưởng nghiệm thu, nhưng nên xử lý (xem mục "Vấn đề tìm thấy"). Story chuyển sang **Done**.

## Test đã chạy (chạy lại độc lập, không dựa vào báo cáo của Dev)

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | Đạt – 0 lỗi, 0 cảnh báo |
| `npm run build` (`tsc -b && vite build`) | Đạt – 24 module, JS 226 kB (gzip 70,8 kB) |
| `npm test` (`vitest run`) | Đạt – 8 tệp, **75/75 test** đạt, ~51 giây |

Ngoài ra đã kiểm tra tĩnh: Grep `servers.json`, `any`, `dangerouslySetInnerHTML`, `innerHTML`, `eval` trong `src/`; đối chiếu `package.json` (dependencies runtime chỉ còn `react`, `react-dom`); đọc toàn bộ mã nguồn và 5 tệp test của story.

## Bảng tiêu chí nghiệm thu

| AC | Nội dung | Kết quả | Bằng chứng |
|---|---|---|---|
| AC1 | Bảng đủ 5 cột, giữ thứ tự repository, 3 dòng mẫu, còn dòng "Đã tải N máy chủ" | **Đạt** | `ServerList.tsx:92-121` (đủ 5 `<th>`, `visibleServers.map` giữ thứ tự); `App.tsx:16`; test `ServerList.test.tsx` "đủ cột và đủ dòng theo thứ tự" kiểm tra tiêu đề cột và 3 dòng; `App.integration.test.tsx` đọc `servers.json` thật → "Đã tải 3 máy chủ" + 3 tên mẫu |
| AC2 | Nhãn tiếng Việt cho trạng thái/môi trường, không lộ giá trị thô, luôn có chữ | **Đạt** | `serverLabels.ts` đúng 6 nhãn theo story, kiểu `Record<…>` nên thiếu khóa sẽ lỗi biên dịch; `ServerList.test.tsx` "không lộ giá trị thô" (6 giá trị); trạng thái là `<span>` có chữ, màu chỉ là phụ |
| AC3 | Tìm theo tên/hostname/IP, không phân biệt hoa-thường, trim, rỗng = không lọc | **Đạt** | `filterServers.ts:16-24`; `filterServers.test.ts`: khớp tên, hostname, IP, `WEB-01`/`MÁY BUILD`, `'  web-01  '`, `''` và `'   '`, và "không tìm theo trường ngoài" (`ubuntu` → rỗng) |
| AC4 | Hai ô chọn Trạng thái/Môi trường mặc định "Tất cả", kết hợp AND | **Đạt** | `ServerList.tsx:42-75`; test "ô nhập/chọn có label … mặc định Tất cả" kiểm tra thứ tự option; `filterServers.test.ts` "kết hợp … AND" (khớp + không khớp); `ServerList.test.tsx` "kết hợp tìm kiếm và bộ lọc theo AND" (3 → 2 → 1 → 0) |
| AC5 | "Hiển thị X / N máy chủ"; X=0, N>0 → thông báo + "Xóa bộ lọc"; N=0 → "Chưa có máy chủ nào" | **Đạt** | `ServerList.tsx:78-90`; test "không khớp … Xóa bộ lọc đưa về mặc định" kiểm tra cả 3 điều khiển về mặc định; test "danh sách rỗng" xác nhận không có nút xóa và không ném lỗi; `App.test.tsx` "repository rỗng" |
| AC6 | Bấm tên mở chi tiết đủ 8 trường; thiếu mô tả → "Không có mô tả"; dữ liệu qua `getById` | **Đạt** | `ServerDetail.tsx` (`<dl>` đủ 8 cặp, `?? 'Không có mô tả'`); `ServerDetail.test.tsx` kiểm tra từng cặp dt/dd; `App.test.tsx` `expect(getById).toHaveBeenCalledWith('a')`; `App.integration.test.tsx` mở "Máy build" (không mô tả, "Windows Server 2022", "Ngừng hoạt động") qua repository thật |
| AC7 | "Quay lại danh sách" giữ nguyên tìm kiếm/bộ lọc; `getById` = `undefined` → "Không tìm thấy máy chủ" + quay lại được | **Đạt** | `App.tsx:10-11` giữ `filters` ở `App`, ngoài nhánh render; `App.test.tsx` luồng gõ "alpha" + lọc "online" → chi tiết → quay lại, ô tìm kiếm vẫn `alpha`, "Hiển thị 1 / 2"; test id không tồn tại vẫn quay lại được |
| AC8 | `filterServers` là hàm thuần trong `domain/`; UI không import `servers.json`; `strict`, không `any`, không thêm thư viện runtime | **Đạt** | Hàm thuần, dùng `filter` nên không đổi mảng vào (có test); Grep: chỉ `serverRepository.ts` import `servers.json`; Grep không có `any`, `dangerouslySetInnerHTML`, `eval`; lint đạt (`no-explicit-any: error`); `dependencies` chỉ `react`, `react-dom`; chỉ `App` đọc repository, component nhận props |
| AC9 | `<table>`, `<th scope="col">`, `<label>` gắn đúng, tên là `<button>` | **Đạt** | `ServerList.tsx` (`htmlFor`/`id`, `<th scope="col">`, `<button type="button">`); test truy vấn bằng `getByLabelText`, `getAllByRole('columnheader')`, `getByRole('button')` đều qua |
| AC10 | lint/build/test đạt; đủ nhóm test; có test `App` không mock | **Đạt** | Ba lệnh ở trên đạt; có test cho `filterServers` (14), `ServerList` (10), `ServerDetail` (5), `App` (6), `serverLabels`, và `App.integration.test.tsx` (2 test không mock, "Đã tải 3 máy chủ") – xử lý V3 của `qa-1.1.md` |

**Tồn đọng của 1.1:** V2 (thêm `engines`) đã xử lý, `package.json` có `"node": ">=20.19"`; V3 (test `App` không mock) đã xử lý. V1 chưa xử lý (xem V1 bên dưới).

## Chất lượng mã, bảo mật, kiểm thử còn thiếu

- **Kiến trúc:** đúng phân lớp `types → domain → repositories → UI`; component trình bày thuần, `App` là nơi duy nhất gọi repository. Mã gọn, không thừa trừu tượng.
- **Bảo mật cơ bản:** React tự thoát chuỗi, không dùng `dangerouslySetInnerHTML`/`innerHTML`; tìm kiếm dùng `String.includes` nên không có ReDoS/regex injection; giá trị `<select>` được kiểm bằng danh sách hằng (`parseStatus`/`parseEnvironment`) thay vì ép kiểu; class `status-${server.status}` chỉ nhận giá trị enum đã được `validateServer` kiểm. Không có dữ liệu nhạy cảm, không có gọi mạng.
- **Hiệu năng:** `filterServers` chạy mỗi lần render, với quy mô vài chục máy chủ là không đáng kể.
- **Kiểm thử còn thiếu (không chặn):**
  - Chưa có báo cáo độ phủ (repo chưa cài `@vitest/coverage-*`), nên không có số phần trăm. Đọc thủ công thì mọi nhánh của `filterServers`, `ServerList`, `ServerDetail` đều có test.
  - Chưa test chuẩn hóa Unicode (NFC/NFD) cho tìm kiếm tiếng Việt có dấu; hiện `toLowerCase()` đủ cho dữ liệu nhập thông thường.
  - Chưa kiểm tra bằng trình duyệt thật (không có trình duyệt trong môi trường QA; Dev cũng ghi chưa kiểm tra). Giao diện chỉ được xác nhận qua jsdom và build. Chưa kiểm tra bố cục CSS, tương phản màu, thao tác bàn phím thực tế.
  - Phép thử dùng `fireEvent` thay vì `user-event`: chấp nhận được vì story cấm thêm thư viện.

## Vấn đề tìm thấy

| # | Mức độ | Mô tả | Cách sửa | Chặn nghiệm thu? |
|---|---|---|---|---|
| V1 | **Trung bình** (tồn đọng từ qa-1.1 V1) | Các tệp cấu hình/types/data của Story 1.1 vẫn **chưa được commit**: `.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/`, `src/main.tsx`, `src/test/`, `src/types/`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts` (đang `??`). Hệ quả: checkout sạch từ `HEAD` (`7860560`) **không build và không chạy được test**, vì mã 1.2 import `../types/server` và `servers.json`. Kết quả QA ở trên là trên working tree, không phải trên `HEAD`. | Người điều phối/Dev `git add` đủ các tệp trên rồi commit; sau đó có thể chạy lại 3 lệnh trên bản clone sạch để xác nhận. Không phải lỗi của logic 1.2. | Không (cùng tiền lệ 1.1), nhưng cần làm trước khi coi sprint là bàn giao được |
| V2 | **Thấp** | Vitest khởi tạo jsdom 8 lần, chiếm ~80% thời gian (~51 giây cho 75 test). Vitest tự gợi ý `pool: 'vmThreads'` hoặc `isolate: false`. | Cân nhắc đổi cấu hình `vite.config.ts` trong story kỹ thuật riêng; thử trước để chắc không làm hỏng cô lập test. | Không |
| V3 | **Thấp** | Trang chi tiết có `<h2>` tên máy chủ và một dòng "Tên" lặp lại trong `<dl>`; chuyển danh sách ↔ chi tiết không quản lý focus (người dùng bàn phím/trình đọc màn hình bị mất vị trí sau khi bấm). Story không yêu cầu nên không tính lỗi. | Cân nhắc đưa focus vào `<h2>` khi mở chi tiết và vào ô tìm kiếm khi quay lại, ở một story cải thiện khả năng truy cập. | Không |

**Giả định của SM còn chờ PM xác nhận** (không phải lỗi mã): nhãn tiếng Việt ở AC2, phạm vi tìm kiếm tên/hostname/IP, không lưu bộ lọc qua lần tải lại, nút "Xóa bộ lọc". `epics.md`, `prd.md`, `architecture.md` vẫn là khung rỗng nên QA chỉ đối chiếu với story.

## Bàn giao

- **Đạt** → báo **Thiết Tướng (Scrum Master)**: story 1.2 = Done, có thể chuyển sang story 1.3. Nhắc xử lý V1 (commit đủ tệp) trước khi bàn giao sprint.
- Không phát sinh `bug-1.2.md`.
