# Báo cáo QA: story 1.3 · Thêm, sửa, xóa máy chủ và lưu dữ liệu vào localStorage

- **Project:** ISS
- **Agent:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày kiểm thử:** 2026-11-15 · Node v22.13.0 (máy mặc định là Node 10, quá cũ)
- **Tài liệu đầu vào:** `docs/bmad-office/story-1.3.md` (tài liệu thật nằm ở `docs/bmad-office/`, không phải `docs/stories/` hay `docs/qa/`), commit `4bfc5ea`
- **Mã đã đọc:** `serverRepository.ts`, `serverInput.ts`, `ServerForm.tsx`, `ServerDetail.tsx`, `ServerList.tsx` (diff), `App.tsx`; danh sách test của `App.crud.test.tsx` và `serverRepository.test.ts`
- **Kết luận:** **ĐẠT** (AC1–AC13 đều đạt, không có lỗi chặn; còn các vấn đề mức Trung bình/Thấp ngoài mã ứng dụng, xem bên dưới)

## Test đã chạy (QA tự chạy lại, không dựa vào báo cáo của Dev)

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | Đạt, không cảnh báo |
| `npm run build` (`tsc -b && vite build`) | Đạt, 26 module, bundle JS 232,58 kB |
| `npm test` (`vitest run`) | **11 tệp, 136/136 test đạt** (trước story: 75), thời gian 76 giây |
| Quét mã tìm `localStorage`, `servers.json`, `window.confirm/alert/prompt`, `dangerouslySetInnerHTML`, `any` | Chỉ `serverRepository.ts` chạm `localStorage` và import `servers.json`; không còn gì còn lại |

Chưa chạy thử giao diện trên trình duyệt thật (`npm run dev`); luồng UI chỉ được kiểm bằng test jsdom và đọc mã.

## Đối chiếu tiêu chí nghiệm thu

| AC | Nội dung | Kết quả | Bằng chứng |
|---|---|---|---|
| AC1 | Repository có `create`/`update`/`remove`, kiểu `ServerInput`/`SaveResult`, `getAll` vẫn trả bản sao | Đạt | `serverRepository.ts:12-18, 87-100`; test nhóm `create`/`update`/`remove` (thêm vào cuối, giữ id và vị trí, id lạ → `{ errors: { id: 'Không tìm thấy máy chủ.' } }`, `remove` trả true/false, `getAll` là bản sao) |
| AC2 | `generateServerId` (`srv-NNN`, max+1, bỏ id lạ, rỗng → `srv-001`) | Đạt | `serverInput.ts:21-28`; `serverInput.test.ts`; `App.crud.test.tsx` máy chủ đầu tiên có id `srv-004` |
| AC3 | Chuẩn hóa rồi `validateServer`; dữ liệu sai không đổi bộ nhớ/localStorage | Đạt | `serverRepository.ts:79-85` dùng lại `validateServer`, chỉ `set` và `persist` sau khi hợp lệ; `normalizeServerInput` không đổi đầu vào, bỏ `description` rỗng; test "dữ liệu sai … không đổi bộ nhớ lẫn localStorage" |
| AC4 | Lưu bền `iss.servers.v1`: lần đầu từ seed, ghi sau mỗi thao tác, nạp từ kho, `[]` là rỗng thật, JSON hỏng/không phải mảng → seed, `getItem`/`setItem` lỗi không ném | Đạt | `serverRepository.ts:39-77`; 11 test nhóm "lưu bền" bao phủ đủ từng quy tắc (kể cả `getItem`/`setItem` ném lỗi, bản ghi hỏng/trùng id) |
| AC5 | Thêm máy chủ: nút luôn hiện, biểu mẫu, mặc định, không có "Tất cả", lưu → chi tiết | Đạt | `ServerList.tsx` nút "Thêm máy chủ" ngoài điều kiện rỗng/lọc; `ServerForm.tsx:39-49` mặc định Development/Đang hoạt động; test `ServerForm.test.tsx` + `App.crud.test.tsx` (thêm hợp lệ, máy chủ rỗng vẫn có nút) |
| AC6 | Sửa máy chủ: điền sẵn, `id` chỉ hiển thị, giữ id/vị trí, xóa mô tả → "Không có mô tả" | Đạt | `ServerForm.tsx:87-93` (id là chữ, không phải ô nhập); `ServerDetail.tsx:27` nút "Sửa" chỉ khi có `server`; test "sửa hợp lệ" và "xóa hết mô tả" |
| AC7 | Báo lỗi từng trường, giữ giá trị, `aria-invalid`/`aria-describedby`, không ghi khi lỗi | Đạt | `ServerForm.tsx:64-81`; giá trị giữ trong state cục bộ, `App.handleCreate/handleUpdate` chỉ `setErrors` rồi `return`; test "thêm sai" và "sửa sai" |
| AC8 | "Hủy": thêm → danh sách (giữ bộ lọc), sửa → chi tiết | Đạt | `App.tsx:86, 100`, `filters` nằm ở `App` nên giữ nguyên; test "hủy khi thêm/sửa" |
| AC9 | Xóa có xác nhận trong trang, nội dung đúng, không dùng `confirm` | Đạt | `ServerDetail.tsx:35-45` (nội dung và hai nút đúng đặc tả); `onDelete` chỉ gọi từ "Xác nhận xóa"; test `ServerDetail.test.tsx` + `App.crud.test.tsx`; quét mã không thấy `window.confirm/alert/prompt` |
| AC10 | Thông báo `role="status"`, biến mất khi chuyển màn hình, "Đã tải N" cập nhật ngay | Đạt | `App.tsx:28-66, 124-125` (`goTo` xóa `notice`, `refresh()` đọc lại danh sách); test "thông báo biến mất khi chuyển màn hình" |
| AC11 | Bền qua lần tải lại kể cả đã xóa hết | Đạt | Hai test "tải lại" ở `App.crud.test.tsx` và hai test tương ứng ở repository |
| AC12 | Kiến trúc, quy ước, khả năng truy cập | Đạt | Chỉ repository chạm `localStorage` và `servers.json`; chỉ `App` gọi repository; ESLint cấm `any` đạt; `package.json` không thêm thư viện runtime; `<form>` thật, "Lưu" là `type="submit"`, các nút còn lại `type="button"`; mỗi trường có `<label htmlFor>`; test Enter lưu được |
| AC13 | `test`, `lint`, `build` đạt, test 1.1/1.2 giữ nguyên | Đạt | Xem bảng chạy lại ở trên; `App.test.tsx`, `App.integration.test.tsx` không bị sửa; ba tệp test của 1.2 chỉ thêm props mới, không xóa/hạ kỳ vọng |

Bảo mật cơ bản: dữ liệu từ `localStorage` là dữ liệu không tin cậy và luôn đi qua `JSON.parse` trong try/catch, kiểm `Array.isArray`, rồi `validateServer` từng bản ghi; giá trị nhập được React tự thoát chuỗi, không có `dangerouslySetInnerHTML`. Không phát hiện lỗ hổng.

## Vấn đề tìm thấy

| # | Mức độ | Mô tả | Cách sửa đề xuất |
|---|---|---|---|
| V1 | Trung bình | Các tệp cấu hình/types/data của 1.1 (`.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/`, `src/main.tsx`, `src/test/setup.ts`, `src/types/`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`) vẫn **untracked**, nên HEAD không build được trên bản clone mới (tiếp nối V1 của `qa-1.1.md`/`qa-1.2.md`). Ngoài ra `src/App.css` (thêm 41 dòng style biểu mẫu/xác nhận) có thay đổi chưa commit; `git ls-files` xác nhận `src/types` và `vite.config.ts` chưa được track. | Người điều phối `git add` đủ các tệp trên rồi commit trước khi đóng sprint. Đây là việc quy trình, không phải lỗi mã. |
| V2 | Thấp | Biểu mẫu đã báo lỗi vẫn giữ nguyên thông báo cũ khi người dùng đang sửa tiếp, đến lúc bấm "Lưu" lần nữa mới cập nhật. Không có quản lý focus: sau khi lưu lỗi, focus không chuyển tới trường sai đầu tiên; chuyển màn hình cũng không đặt lại focus (V3 của `qa-1.2.md`, story đã đưa ra ngoài phạm vi). | Story sau: xóa lỗi của trường khi người dùng gõ; chuyển focus đến trường sai đầu tiên và đến tiêu đề màn hình mới. |
| V3 | Thấp | `npm test` mất khoảng 76 giây vì jsdom khởi tạo 11 lần (79% thời gian), tăng từ 51 giây ở 1.2 (V2 của `qa-1.2.md`). | Đặt `pool: 'vmThreads'` hoặc `isolate: false` trong `vitest.config`, hoặc gom bớt tệp test. |
| V4 | Thấp | `id` dạng max+1 nên xóa máy chủ cuối rồi thêm mới sẽ dùng lại id đã xóa; nếu `getItem` ném lỗi lúc khởi tạo thì lần ghi đầu tiên có thể ghi đè dữ liệu cũ trong kho bằng dữ liệu mẫu. Cả hai đúng đặc tả/giả định của Scrum Master, ghi lại để PM xác nhận. | Không cần sửa trong story này; PM xác nhận hoặc đổi chiến lược sinh id nếu cần. |
| V5 | Thấp (thông tin) | Thông báo lỗi lấy nguyên từ `validateServer` (vd "Thiếu tên máy chủ (name).") có tên trường tiếng Anh trong ngoặc; Dev đã ghi nhận và story cho phép. | Gọn lại câu chữ khi PM chốt nội dung. |
| V6 | Thấp | Chưa xem thử giao diện trên trình duyệt thật; kiểm thử UI chỉ qua jsdom. | Chạy `npm run dev` thử nhanh một lượt Thêm → Sửa → Xóa → tải lại trang trước khi phát hành. |

Không có test bị thiếu ở mức đáng kể: mọi AC đều có ít nhất một test chạy thật. Có thể bổ sung sau (không chặn): test xóa một máy chủ rồi thấy `localStorage` thật của trình duyệt, test cho id có hơn 3 chữ số trong `App`.

## Kết luận

Story 1.3 **đạt** mọi tiêu chí nghiệm thu AC1–AC13. `lint`, `build` và `test` (136/136) đều đạt khi QA tự chạy lại bằng Node 22.13.0, mã đúng phân lớp, không có `any`, không có thư viện mới, không dùng `window.confirm`. Chuyển trạng thái story sang **Done**.

**Bàn giao:** Scrum Master (Thiết Tướng) để đóng story và nhắc người điều phối xử lý V1 (commit đủ tệp chưa được track).
