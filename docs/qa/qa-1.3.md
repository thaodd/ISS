# Báo cáo QA: Story 1.3 · Thêm, sửa, xóa máy chủ và lưu dữ liệu vào localStorage

- **Project:** ISS
- **Người kiểm thử:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày:** 2026-11-15
- **Story:** `docs/stories/1.3.story.md` (bản sao `docs/bmad-office/story-1.3.md`)
- **Môi trường:** Windows 10, Node v22.13.0 (nvm; máy mặc định là Node 10 nên phải chuyển phiên bản)
- **Phạm vi:** kiểm thử trên working tree hiện tại (gồm các tệp chưa commit). Không sửa mã ứng dụng.

## Kết luận

**ĐẠT (PASS).** Cả 13 tiêu chí nghiệm thu đều đạt, có bằng chứng chạy thật và đọc mã. Không có vấn đề chặn. Còn 1 vấn đề Trung bình về quy trình (tệp cấu hình/types/data chưa commit, đã biết từ QA 1.1/1.2) và vài mục Thấp. Mục thử tay trên trình duyệt do Dev chuyển sang QA **không thực hiện được** (không có trình duyệt); thay bằng bài thử tự động trên `localStorage` thật của jsdom (xem "Kiểm thử bổ sung").

## Kết quả chạy

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | exit 0, không lỗi/cảnh báo |
| `npm run build` (`tsc -b && vite build`) | exit 0, 39 module, JS 251,17 kB (gzip 75,43 kB) |
| `npm test` (`vitest run`) | exit 0, **24/24 tệp, 331/331 test đạt**, ~170 s |
| Bài thử bổ sung của QA (`localStorage` thật + singleton `serverRepository`) | 2/2 đạt; **đã xóa tệp thử**, không để lại trong repo |

Test thuộc phạm vi 1.3: `serverInput.test.ts` (chuẩn hóa, sinh id), `serverRepository.test.ts` (create/update/remove + 11 test lưu bền), `ServerForm.test.tsx`, `ServerList.test.tsx`, `ServerDetail.test.tsx`, `App.crud.test.tsx` (13 test luồng, không mock module, mỗi test một kho giả riêng). `App.test.tsx` và `App.integration.test.tsx` (của 1.2) vẫn đạt, không bị hạ kỳ vọng.

## Đối chiếu tiêu chí nghiệm thu

| AC | Kết quả | Bằng chứng |
|---|---|---|
| AC1 – Repository có thao tác ghi | **Đạt** | `serverRepository.ts`: interface có `create`, `update`, `remove` bên cạnh `getAll`/`getById`; `SaveResult` đúng dạng union. `create` thêm vào cuối (Map giữ thứ tự chèn); `update` id lạ trả `{ ok:false, errors:{ id:'Không tìm thấy máy chủ.' } }`, không ném, không thêm bản ghi; `save` ghi đè `id` bằng id truyền vào nên `id` trong input bị bỏ qua và `Map.set` lên khóa cũ giữ vị trí; `remove` trả `true/false`; `getAll` trả `Array.from(...)` (bản sao). Test: `create` (thêm vào cuối), `update` (giữ id/vị trí, bỏ qua id input, id lạ), `remove` (có/không), "getAll vẫn trả bản sao…". |
| AC2 – Tự sinh id | **Đạt** | `generateServerId`: regex `^srv-(\d+)$`, lấy max+1, `padStart(3,'0')`, id lạ bị bỏ qua, rỗng → `srv-001`. `serverInput.test.ts` phủ danh sách rỗng, liên tiếp, khoảng trống (`srv-007`→`srv-008`), id lạ, `srv-999`→`srv-1000`. Thử thật: dữ liệu mẫu 3 máy chủ → máy chủ mới `srv-004` (QA probe). |
| AC3 – Chuẩn hóa và kiểm tra | **Đạt** | `normalizeServerInput` cắt khoảng trắng 4 trường chuỗi, bỏ `description` rỗng, trả đối tượng mới (không đổi đầu vào). `save()` luôn chuẩn hóa rồi gọi `validateServer` (dùng lại, không có bộ kiểm tra thứ hai); lỗi → `{ ok:false, errors }`, không `set`/`persist`. Test: "dữ liệu sai trả lỗi theo từng trường và không đổi bộ nhớ lẫn localStorage", "từ chối status/environment ngoài danh sách", "dữ liệu sai không làm thay đổi bản ghi cũ…". Probe: IP `999.1.1.1` → lỗi và `localStorage` vẫn `null`. |
| AC4 – Lưu bền bằng localStorage | **Đạt** | Khóa `iss.servers.v1`; chưa có khóa → nạp `servers.json` và **không ghi** cho tới lần ghi đầu; `persist()` gọi sau mỗi `save` thành công và `remove` thành công; khóa có → `loadStoredRecords` rồi qua `toServerMap` (loại hỏng/trùng + `console.warn`); `[]` là rỗng thật (`stored ?? seed` — `[]` không phải `undefined`); JSON hỏng/không phải mảng → `undefined` → seed + `warn`; `getItem`/`setItem` ném lỗi được bắt bằng try/catch + `warn`; `getBrowserStorage` bọc try/catch cho `window.localStorage`. Test nhóm "lưu bền bằng localStorage" (11 test, kho giả `memoryStorage.ts`) đủ từng quy tắc; probe chạy thật `'{oops'` → seed 3 máy chủ + `warn`. |
| AC5 – Thêm máy chủ | **Đạt** | `ServerList.tsx:32` nút "Thêm máy chủ" luôn render (nằm ngoài nhánh rỗng/lọc). `ServerForm` mode `create`: tiêu đề "Thêm máy chủ", 7 trường có `<label htmlFor>`; mặc định Development/`online` ("Đang hoạt động"); ô chọn lấy nhãn từ `ENVIRONMENT_LABELS`/`STATUS_LABELS`, lặp qua `SERVER_*` nên không có "Tất cả". `App.handleCreate` → `refresh()` → `goTo(detail)` → thông báo. Test: `ServerForm.test` (mặc định, nhãn), `ServerList.test`, `App.crud` "thêm hợp lệ…". |
| AC6 – Sửa máy chủ | **Đạt** | `ServerDetail` nút "Sửa" chỉ trong nhánh `server !== undefined`. `ServerForm` mode `edit`: tiêu đề "Sửa máy chủ", `initialValues` điền sẵn (mô tả → `''`), `id` hiển thị bằng `<strong>` (không phải ô nhập). `handleUpdate` → `repository.update(id,…)` giữ id/vị trí; mô tả toàn khoảng trắng bị bỏ → chi tiết "Không có mô tả"; edit mà máy chủ biến mất → `renderDetail` → "Không tìm thấy máy chủ". Test: `App.crud` "sửa hợp lệ…", "xóa hết mô tả…". Probe: sửa mô tả `'  ghi chú  '` → lưu `'ghi chú'`. |
| AC7 – Báo lỗi theo từng trường | **Đạt** | `ServerForm.fieldProps` đặt `aria-invalid="true"` và `aria-describedby` trỏ `<p id=…-error>` cạnh từng trường sai; state cục bộ giữ giá trị khi `errors` đổi; lỗi `id` bằng `<p role="alert">` ở đầu form; lỗi hiển thị đồng thời cho nhiều trường; `handleCreate/Update` không ghi khi `ok:false`; `goTo` xóa `errors` nên lỗi biến mất sau khi thành công. Test: `ServerForm.test` (lỗi từng trường + `aria-*`, giữ giá trị), `App.crud` "thêm sai…", "sửa sai…". |
| AC8 – Hủy | **Đạt** | create → `goTo(list)`, edit → `goTo(detail,id)`; `filters` là state của `App` nằm ngoài nhánh render nên được giữ. Test: `App.crud` "hủy khi thêm… giữ bộ lọc", "hủy khi sửa…". |
| AC9 – Xóa có xác nhận | **Đạt** | `ServerDetail`: "Xóa" chỉ mở `role="alertdialog"` `aria-label="Xác nhận xóa"`, nội dung `Xóa máy chủ "<tên>"? Thao tác này không thể hoàn tác.`, hai nút "Xác nhận xóa"/"Hủy"; chỉ "Xác nhận xóa" gọi `onDelete`; không có `window.confirm/alert/prompt` (grep trong `src/`, không có). Dòng cảnh báo `installedCount > 0` của 2.2 giữ nguyên, không ảnh hưởng AC9. Test: `ServerDetail.test`, `App.crud` "xóa có xác nhận…". Probe: xác nhận xóa → `localStorage` còn 3 bản ghi. |
| AC10 – Thông báo và làm mới | **Đạt** | `App`: `<p role="status">{notice}</p>`; ba mẫu `Đã thêm/cập nhật/xóa máy chủ "<tên>"`, thêm ` và N bản ghi cài đặt` khi N>0; `goTo` xóa thông báo khi chuyển màn; `refresh()` đọc lại `repository.getAll()` nên "Đã tải N máy chủ" và "Hiển thị X / N" cập nhật ngay (state `servers`). Test: `App.crud` "thêm hợp lệ…" (Đã tải 4), "thông báo biến mất khi chuyển màn hình". |
| AC11 – Bền qua lần tải lại | **Đạt** | Repository mới trên cùng kho nạp lại đúng dữ liệu, kể cả đã xóa hết (không nạp lại seed). Test: `serverRepository.test` "tải lại…", "xóa hết rồi tải lại vẫn rỗng…"; `App.crud` 2 test "tải lại". Probe: sau thêm+sửa, `vi.resetModules()` + import lại module (mô phỏng tải lại trang) → 4 máy chủ. |
| AC12 – Kiến trúc, quy ước, truy cập | **Đạt** | Grep ngoài test: chỉ 3 tệp `*Repository.ts` chạm `localStorage`/`servers.json`; component nhận props, chỉ `App` gọi repository; không `any` (grep + ESLint `no-explicit-any`); `dependencies` chỉ `react`, `react-dom`; `<form noValidate onSubmit>` thật, "Lưu" `type="submit"`, "Hủy" và các nút khác `type="button"`; mọi ô có `<label htmlFor>` khớp `id`. Test có "Enter/submit" và truy vấn theo role/label. |
| AC13 – Test và chất lượng | **Đạt** | lint/build/test đạt (bảng trên); 331 test gồm toàn bộ test 1.1, 1.2 và Epic 2; có test cho từng nhóm T1–T7. |

## Chất lượng mã và bảo mật cơ bản

- Phân lớp đúng: `types` → `domain` (hàm thuần) → `repositories` (nơi duy nhất chạm `localStorage`) → UI. Kiểm tra hợp lệ chỉ ở repository (một nguồn sự thật); `App` chuyển `errors` xuống biểu mẫu.
- Dữ liệu từ `localStorage` được xử lý như không tin cậy: `JSON.parse` trong try/catch, `Array.isArray`, rồi `validateServer` từng bản ghi.
- Chống XSS: không có `dangerouslySetInnerHTML`, `innerHTML`, `eval`. Thử nhập tên `<img src=x onerror=alert(1)>`: được hiển thị như chữ trong thông báo và danh sách, không tạo phần tử `<img>` (probe xác nhận `document.querySelector('img') === null`).
- Không có bí mật trong mã, không có lời gọi mạng.
- Hai điểm của Epic 2 (xóa kèm bản ghi cài đặt trong `handleDelete`; `installedCount` trong `ServerDetail`) được giữ nguyên và không làm lệch AC9/AC10.

## Kiểm thử bổ sung của QA

Tạm thời tạo `src/qa13probe.test.tsx` (đã xóa sau khi chạy) chạy trên `window.localStorage` **thật** của jsdom và singleton `serverRepository` (các test của dev chỉ dùng kho giả hoặc prop `repository`):

1. Thêm với IP sai → lỗi, `localStorage` vẫn `null`; sửa IP → lưu, `srv-004`, nội dung `localStorage` đúng.
2. Tên chứa HTML được hiển thị như chữ, không chèn phần tử.
3. Sửa mô tả có khoảng trắng → lưu đã cắt; "tải lại" (reset module) thấy 4 máy chủ; xóa có xác nhận → còn 3 bản ghi trong `localStorage`.
4. Giá trị `'{oops'` trong khóa → quay về seed 3 máy chủ + `console.warn`.

Kết quả: 2/2 đạt.

## Vấn đề tìm thấy

| # | Mức | Mô tả | Cách sửa |
|---|---|---|---|
| V1 | Trung bình | Nợ kỹ thuật đã biết từ QA 1.1/1.2: `git status` vẫn cho thấy chưa commit `.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/servers.json`, `src/main.tsx`, `src/test/setup.ts`, `src/types/server.ts`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`, `src/App.installations.test.tsx`; `src/App.css` và vài test đang `M`. Clone sạch từ HEAD sẽ không build/test được. Không ảnh hưởng kết quả kiểm thử trên working tree. | Ứng dụng tự commit đủ working tree; SM kiểm `git status` sạch trước 2.3, rồi chạy `npm ci && npm run build` trên bản clone sạch. |
| V2 | Thấp | Chưa thử tay trên trình duyệt thật (Dev và QA đều không có trình duyệt). Rủi ro còn lại nhỏ vì đã có test luồng đầy đủ và bài thử trên `localStorage` thật của jsdom. | Người dùng/SM thử nhanh `npm run dev`: Thêm → Sửa → Xóa → tải lại trang (xóa khóa `iss.servers.v1` trong DevTools để quay về dữ liệu mẫu). |
| V3 | Thấp | Nếu `getItem` ném lỗi lúc khởi tạo, repository dùng dữ liệu mẫu và lần ghi đầu có thể ghi đè dữ liệu cũ trong kho bằng dữ liệu mẫu. Đã được Dev ghi nhận, ngoài AC. | Story sau: nhớ trạng thái "kho không đọc được" và không ghi đè (hoặc báo người dùng). |
| V4 | Thấp | Id `max+1` có thể dùng lại id của máy chủ cuối vừa xóa; hiện bản ghi cài đặt đã bị xóa kèm nên không mồ côi, nhưng cần lưu ý nếu sau này có dữ liệu tham chiếu khác. | Cân nhắc bộ đếm id tăng đơn điệu nếu thêm tham chiếu ngoài. |
| V5 | Thấp | Truy cập/UX: lỗi biểu mẫu không tự xóa khi gõ lại; chưa quản lý focus khi chuyển màn hình; thông báo lỗi lấy nguyên từ `validateServer` có chữ kỹ thuật (vd "(name)", "(id)"). Đều nằm ngoài phạm vi của story. | Story sau: xóa lỗi theo trường khi `onChange`, đưa focus vào tiêu đề/lỗi đầu tiên, gọn câu chữ. |
| V6 | Thấp | Bộ test chậm (~170 s cho 24 tệp; jsdom khởi tạo 24 lần chiếm ~76% thời gian). | Cân nhắc `pool: 'vmThreads'` hoặc `isolate: false` trong `vite.config.ts`. |
| V7 | Thông tin | Giả định của SM (id `srv-NNN`, mặc định biểu mẫu, không bắt buộc hostname/IP duy nhất, câu chữ thông báo, khóa `iss.servers.v1`, không hoàn tác) vẫn chờ PM xác nhận; `architecture.md` vẫn là khung rỗng. | Không chặn; ghi nhận. |

## Kiểm thử còn thiếu (đề xuất, không chặn)

- Test UI cho "Hiển thị X / N" khi máy chủ mới thêm không khớp bộ lọc đang chọn (AC10 cho phép, hiện chỉ kiểm "Đã tải N").
- Test cho trường hợp `update` trả lỗi `id` hiển thị `role="alert"` qua `App` (hiện chỉ kiểm ở mức `ServerForm`).
- Test khóa việc không dùng RegExp/HTML thô với tên chứa ký tự đặc biệt (QA đã thử thủ công bằng probe, chưa có trong bộ test chính thức).

## Bàn giao

- Kết quả: **ĐẠT** → báo Thiết Tướng (Scrum Master); story 1.3 chuyển `Done`, `docs/bmad-office/sprint-status.yaml` cập nhật (tệp `docs/sprint-status.yaml` không tồn tại, tệp thật nằm ở `docs/bmad-office/`).
- Không có bug report (`bug-1.3.md`) cần gửi Dev.
- Việc cần SM theo dõi: V1 (commit đủ tệp để HEAD build được), V2 (thử tay nhanh trên trình duyệt).
