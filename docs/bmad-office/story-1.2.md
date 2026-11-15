# Story 1.2: Danh sách, tìm kiếm/lọc và xem chi tiết máy chủ

- **Project:** ISS
- **Epic:** 1 – Quản lý thông tin máy chủ
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Done
- **Phụ thuộc:** Story 1.1 (Done) – dùng lại kiểu `Server`, `serverRepository`, `validateServer`
- **Bàn giao cho:** Kiếm Thánh · Developer

## Câu chuyện

Là một **quản trị viên hạ tầng của ISS**, tôi muốn **xem danh sách các máy chủ, tìm kiếm/lọc theo tên, trạng thái, môi trường và mở trang chi tiết của từng máy chủ**, để **nắm nhanh tình trạng hạ tầng và tra cứu đầy đủ thông tin một máy chủ mà không phải mở file dữ liệu**.

## Phạm vi

**Trong phạm vi (chỉ đọc):** bảng danh sách máy chủ lấy từ repository; ô tìm kiếm; bộ lọc trạng thái và môi trường; màn hình chi tiết một máy chủ; chuyển qua lại danh sách ↔ chi tiết bằng state; các trạng thái rỗng; test.

**Ngoài phạm vi (để story sau):** thêm/sửa/xóa máy chủ và mọi thao tác ghi dữ liệu (Story 1.3); lưu bộ lọc xuống localStorage/URL; sắp xếp theo cột; phân trang; định tuyến (`react-router`); backend/API; ứng dụng cài đặt (Epic 2).

## Quyết định đã được người dùng xác nhận

- Phạm vi 1.2 = danh sách + tìm kiếm/lọc + chi tiết, **chỉ đọc**.
- **Chưa ghi dữ liệu** ở story này.
- **Không thêm thư viện** điều hướng: chuyển danh sách ↔ chi tiết bằng state trong `App`.

## Tiêu chí nghiệm thu

1. **AC1 – Danh sách máy chủ:** `App` hiển thị bảng gồm mọi máy chủ từ `serverRepository.getAll()`, mỗi dòng có các cột: Tên, Hostname, Địa chỉ IP, Môi trường, Trạng thái. Thứ tự dòng giữ nguyên thứ tự repository trả về. Với dữ liệu mẫu hiện có thấy đủ 3 dòng (`srv-001`, `srv-002`, `srv-003`). Dòng "Đã tải N máy chủ" của Story 1.1 vẫn còn, N là tổng số máy chủ hợp lệ.
2. **AC2 – Nhãn tiếng Việt:** trạng thái và môi trường hiển thị bằng nhãn tiếng Việt, không lộ giá trị thô: `online` → "Đang hoạt động", `offline` → "Ngừng hoạt động", `maintenance` → "Bảo trì"; `production` → "Production", `staging` → "Staging", `development` → "Development". Trạng thái phải phân biệt được không chỉ bằng màu (luôn có chữ).
3. **AC3 – Tìm kiếm:** có ô nhập "Tìm kiếm" lọc danh sách theo **tên, hostname hoặc địa chỉ IP** chứa chuỗi nhập, không phân biệt hoa/thường, bỏ khoảng trắng đầu/cuối. Ô trống hoặc chỉ gồm khoảng trắng nghĩa là không lọc.
4. **AC4 – Lọc theo trạng thái và môi trường:** có hai ô chọn "Trạng thái" và "Môi trường", mỗi ô có lựa chọn "Tất cả" (mặc định) cộng ba giá trị tương ứng. Tìm kiếm và hai bộ lọc kết hợp theo **AND**.
5. **AC5 – Số lượng và trạng thái rỗng:** luôn hiển thị "Hiển thị X / N máy chủ" (X sau khi lọc, N tổng). Khi X = 0 mà N > 0 hiển thị "Không tìm thấy máy chủ phù hợp" kèm nút "Xóa bộ lọc" đưa ô tìm kiếm và hai bộ lọc về mặc định. Khi N = 0 hiển thị "Chưa có máy chủ nào" (không hiển thị nút xóa bộ lọc, không ném lỗi).
6. **AC6 – Xem chi tiết:** bấm vào tên máy chủ trên danh sách mở màn hình chi tiết của máy chủ đó, hiển thị đủ mọi trường: tên, id, hostname, địa chỉ IP, hệ điều hành, môi trường, trạng thái (nhãn tiếng Việt) và mô tả. Máy chủ không có `description` hiển thị "Không có mô tả". Dữ liệu chi tiết lấy qua `serverRepository.getById(id)`.
7. **AC7 – Quay lại danh sách:** màn hình chi tiết có nút "Quay lại danh sách"; bấm thì trở về danh sách và **giữ nguyên** nội dung tìm kiếm và bộ lọc đang chọn trước đó. Nếu `getById` trả `undefined` (id không còn tồn tại) hiển thị "Không tìm thấy máy chủ" kèm nút "Quay lại danh sách", không sập ứng dụng.
8. **AC8 – Kiến trúc và quy ước:** logic lọc là hàm thuần `filterServers` trong `src/domain/`, có test riêng. UI **không** import `servers.json`, chỉ đi qua repository. TypeScript `strict`, không dùng `any`, không thêm thư viện runtime mới.
9. **AC9 – Khả năng truy cập cơ bản:** danh sách dùng thẻ bảng chuẩn (`<table>`, `<th scope="col">`); mỗi ô nhập/chọn có `<label>` gắn đúng; tên máy chủ mở chi tiết là phần tử tương tác được bằng bàn phím (`<button>`). Nhờ vậy test truy vấn theo role/label được.
10. **AC10 – Test và chất lượng:** `npm test`, `npm run lint`, `npm run build` đều đạt. Có test cho: `filterServers` (từng điều kiện và kết hợp), `ServerList` (render, lọc, trạng thái rỗng, xóa bộ lọc), `ServerDetail` (đủ trường, không mô tả, không tìm thấy), `App` (luồng danh sách → chi tiết → quay lại giữ bộ lọc). Có thêm **một test `App` không mock** chạy trên `servers.json` thật, kỳ vọng "Đã tải 3 máy chủ" (xử lý V3 của `qa-1.1.md`).

## Nhiệm vụ / việc con

- [x] **T1 – Nhãn hiển thị (AC2)**
  - [x] Tạo `src/domain/serverLabels.ts` xuất `STATUS_LABELS: Record<ServerStatus, string>` và `ENVIRONMENT_LABELS: Record<ServerEnvironment, string>` theo AC2.
  - [x] Test: mọi giá trị trong `SERVER_STATUSES`/`SERVER_ENVIRONMENTS` đều có nhãn không rỗng.
- [x] **T2 – Logic lọc (AC3, AC4, AC8)**
  - [x] Tạo `src/domain/filterServers.ts`: `ServerFilters { query: string; status: ServerStatus | 'all'; environment: ServerEnvironment | 'all' }`, hằng `DEFAULT_FILTERS`, hàm `filterServers(servers, filters): Server[]` (thuần, không đổi mảng đầu vào, giữ thứ tự).
  - [x] Test `filterServers.test.ts`: query khớp tên/hostname/IP; không phân biệt hoa/thường; trim; query rỗng/khoảng trắng; lọc status; lọc environment; kết hợp AND; không khớp → mảng rỗng; không làm thay đổi mảng đầu vào.
- [x] **T3 – Thành phần danh sách (AC1, AC3, AC4, AC5, AC9)**
  - [x] Tạo `src/components/ServerList.tsx` nhận `servers`, `filters`, `onFiltersChange`, `onSelect(id)`; hiển thị ô tìm kiếm, hai ô chọn, dòng "Hiển thị X / N máy chủ", bảng, các trạng thái rỗng và nút "Xóa bộ lọc".
  - [x] Tên máy chủ là `<button>` gọi `onSelect(server.id)`.
  - [x] Test `ServerList.test.tsx` (không cần repository): render đủ dòng và cột; gõ tìm kiếm/đổi bộ lọc → gọi `onFiltersChange` hoặc cập nhật bảng đúng; không khớp → "Không tìm thấy máy chủ phù hợp" + "Xóa bộ lọc"; danh sách rỗng → "Chưa có máy chủ nào"; bấm tên → `onSelect` đúng id.
- [x] **T4 – Thành phần chi tiết (AC6, AC7, AC9)**
  - [x] Tạo `src/components/ServerDetail.tsx` nhận `server: Server | undefined` và `onBack`; hiển thị đủ trường (dùng `<dl>`), "Không có mô tả", hoặc "Không tìm thấy máy chủ"; nút "Quay lại danh sách".
  - [x] Test `ServerDetail.test.tsx`: đủ trường; không mô tả; `undefined`; bấm quay lại → `onBack`.
- [x] **T5 – Ghép trong App (AC1, AC6, AC7, AC8)**
  - [x] Sửa `src/App.tsx`: giữ tiêu đề "ISS – Quản lý máy chủ" và "Đã tải N máy chủ"; giữ `filters` (dùng `DEFAULT_FILTERS`) và `selectedId: string | null` bằng `useState`; `selectedId === null` → danh sách, ngược lại → chi tiết qua `serverRepository.getById`. Giữ `filters` ở `App` để quay lại không mất bộ lọc (AC7).
  - [x] Chỉ import `serverRepository`; không import `servers.json`.
- [x] **T6 – Test App (AC7, AC10)**
  - [x] Cập nhật `src/App.test.tsx`: mock repository hiện tại trả `{id:'x'}`, không còn đủ trường, phải đổi sang dữ liệu `Server` đầy đủ. Giữ hai test cũ (tiêu đề, "Đã tải 2 máy chủ").
  - [x] Thêm test luồng: gõ tìm kiếm → bấm tên → thấy chi tiết → "Quay lại danh sách" → ô tìm kiếm vẫn giữ giá trị và danh sách vẫn đã lọc.
  - [x] Thêm test id không tồn tại (mock `getById` trả `undefined`) → "Không tìm thấy máy chủ".
  - [x] Thêm **test không mock** (có thể tách `src/App.integration.test.tsx` để không dính `vi.mock` của tệp kia) kỳ vọng "Đã tải 3 máy chủ" và thấy 3 tên máy chủ mẫu.
- [x] **T7 – Dọn tồn đọng nhỏ của 1.1 (V2)**
  - [x] Thêm `"engines": { "node": ">=20.19" }` vào `package.json` (QA 1.1, V2).
- [x] **T8 – Hoàn tất (AC10)**
  - [x] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt (dùng Node ≥ 20.19).
  - [x] Ghi kết quả và bằng chứng theo AC vào mục Dev Agent Record, đổi trạng thái story sang Review.

## Ghi chú cho Dev

### Căn cứ và giả định

- `epics.md`, `prd.md`, `architecture.md` vẫn là **khung rỗng**, nên 1.2 dựa trên yêu cầu #1 (`yeu-cau/yeu-cau-001.md`), kiến trúc thực tế rút ra từ mã của Story 1.1 và các quyết định người dùng ở trên. Nếu Architect/PM cập nhật tài liệu mâu thuẫn với story này, báo lại Scrum Master, đừng tự đổi hướng.
- **Giả định của Scrum Master (PM cần xác nhận):** các nhãn tiếng Việt ở AC2; tìm kiếm trên tên/hostname/IP; không lưu bộ lọc qua lần tải lại trang; nút "Xóa bộ lọc".
- Chưa có thiết kế giao diện: chỉ cần HTML ngữ nghĩa gọn gàng, CSS tối thiểu (có thể thêm một tệp `src/App.css`). Không dùng UI kit.

### Tệp cần tạo / sửa

| Tệp | Hành động |
|---|---|
| `src/domain/serverLabels.ts` (+ `.test.ts`) | Tạo |
| `src/domain/filterServers.ts` (+ `.test.ts`) | Tạo |
| `src/components/ServerList.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ServerDetail.tsx` (+ `.test.tsx`) | Tạo |
| `src/App.tsx` | Sửa theo T5 |
| `src/App.test.tsx` | Sửa theo T6 |
| `src/App.integration.test.tsx` | Tạo (test không mock) |
| `package.json` | Sửa: thêm `engines` |
| `src/App.css` (tùy chọn) | Tạo nếu cần style |

Không sửa `types/server.ts`, `validateServer.ts`, `serverRepository.ts`, `servers.json` (nếu cần đổi, báo lại Scrum Master). Không sửa `docs/` ngoài mục Dev Agent Record của tệp này và `sprint-status.yaml` khi đổi trạng thái.

### Quy ước (từ kiến trúc Story 1.1)

- TypeScript `strict`; cấm `any` (ESLint `no-explicit-any: error`).
- Tách lớp `types` → `domain` (hàm thuần) → `repositories` → UI (`components`, `App`). Component trình bày nhận dữ liệu qua props, không tự gọi repository; chỉ `App` đọc repository.
- Test đặt cạnh mã nguồn, tên `*.test.ts(x)`; dùng Vitest + Testing Library + `@testing-library/jest-dom` đã cấu hình ở `src/test/setup.ts`. Ưu tiên truy vấn theo role/label.
- Nhãn giao diện bằng tiếng Việt; tên mã (biến, hàm, kiểu) bằng tiếng Anh.
- Không thêm router, state manager, UI kit. Chỉ dùng React hooks.
- Lưu ý ESLint `react-refresh`: mỗi tệp component chỉ xuất component; hằng/hàm dùng chung đặt ở `domain/`.

### Lưu ý môi trường và repo

- Máy mặc định dùng Node 10 (quá cũ). Dùng Node **≥ 20.19** (ví dụ v22.13.0 trong nvm) cho từng lệnh.
- `qa-1.1.md` V1: nhiều tệp cấu hình/types/data của 1.1 vẫn **chưa được commit** (đang `??` trong `git status`). Không xóa/ghi đè chúng; Dev hoặc người điều phối cần commit đủ khi bàn giao.

### Lệnh

```
npm install
npm run dev      # xem thử: danh sách 3 máy chủ, tìm kiếm/lọc, chi tiết
npm run lint
npm run build
npm test         # vitest run
```

### Definition of Done

Mọi ô nhiệm vụ đã đánh dấu; `lint`, `build`, `test` đều đạt; AC1–AC10 có bằng chứng trong Dev Agent Record; sau đó chuyển story sang `review` để QA (Linh Y Tiên Tử) kiểm thử.

## Dev Agent Record

**Developer:** Kiếm Thánh (Amelia) · 2026-11-15 · Node v22.13.0

### Tệp đã tạo / sửa

| Tệp | Hành động |
|---|---|
| `src/domain/serverLabels.ts` (+ `.test.ts`) | Tạo – `STATUS_LABELS`, `ENVIRONMENT_LABELS` |
| `src/domain/filterServers.ts` (+ `.test.ts`) | Tạo – `ServerFilters`, `DEFAULT_FILTERS`, `filterServers` (hàm thuần) |
| `src/components/ServerList.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ServerDetail.tsx` (+ `.test.tsx`) | Tạo |
| `src/App.tsx` | Sửa – giữ `filters`, `selectedId` bằng `useState`; chỉ import `serverRepository` |
| `src/App.test.tsx` | Sửa – mock dữ liệu `Server` đầy đủ; thêm test luồng, id không tồn tại, repo rỗng |
| `src/App.integration.test.tsx` | Tạo – test không mock trên `servers.json` thật |
| `src/App.css` | Tạo – CSS tối thiểu |
| `package.json` | Sửa – thêm `"engines": { "node": ">=20.19" }` |
| `docs/bmad-office/story-1.2.md`, `sprint-status.yaml` | Cập nhật trạng thái |

Không sửa `types/server.ts`, `validateServer.ts`, `serverRepository.ts`, `servers.json`.

### Lệnh đã chạy (Node v22.13.0)

```
npm run lint    -> đạt (0 lỗi, 0 cảnh báo)
npm test        -> 8 tệp test, 75 test, tất cả đạt
npm run build   -> tsc -b + vite build đạt (24 module)
```

### Bằng chứng theo AC

| AC | Bằng chứng |
|---|---|
| AC1 | `ServerList.test.tsx` (đủ 5 cột, đủ dòng, đúng thứ tự); `App.integration.test.tsx` (3 máy chủ thật, "Đã tải 3 máy chủ"); `App.tsx` vẫn giữ dòng "Đã tải N máy chủ" |
| AC2 | `serverLabels.test.ts`; `ServerList.test.tsx` kiểm tra nhãn tiếng Việt và không lộ giá trị thô; trạng thái luôn có chữ |
| AC3 | `filterServers.test.ts` (tên/hostname/IP, hoa-thường, trim, rỗng/khoảng trắng); `ServerList.test.tsx` |
| AC4 | `filterServers.test.ts` (status, environment, AND); `ServerList.test.tsx` (mặc định "Tất cả", kết hợp AND) |
| AC5 | `ServerList.test.tsx`: "Hiển thị X / N", "Không tìm thấy máy chủ phù hợp" + "Xóa bộ lọc" đưa về mặc định, "Chưa có máy chủ nào" không có nút xóa; `App.test.tsx` repo rỗng |
| AC6 | `ServerDetail.test.tsx` (đủ trường, "Không có mô tả"); `App.integration.test.tsx` (chi tiết qua `getById` thật) |
| AC7 | `App.test.tsx`: luồng gõ tìm kiếm + lọc → chi tiết → quay lại giữ nguyên; `getById` trả `undefined` → "Không tìm thấy máy chủ" + quay lại được |
| AC8 | `filterServers` là hàm thuần ở `src/domain/`; UI không import `servers.json`; `strict`, không `any`, không thêm thư viện runtime |
| AC9 | `<table>`, `<th scope="col">`, `<label htmlFor>` cho ô nhập/chọn, tên máy chủ là `<button>`, chi tiết dùng `<dl>`; test truy vấn theo role/label |
| AC10 | lint, build, test đạt như trên; đủ các nhóm test yêu cầu, có test `App` không mock |

### Ghi chú

- Đường dẫn tài liệu thực tế là `docs/bmad-office/` (không phải `docs/stories/`, `docs/architecture.md`); `architecture.md` vẫn là khung rỗng nên bám quy ước trong story.
- `ServerList` tự gọi `filterServers` từ props `servers` + `filters` (tổng N = `servers.length`); `App` giữ `filters` để quay lại không mất bộ lọc. Giá trị của `<select>` được kiểm tra bằng `SERVER_STATUSES`/`SERVER_ENVIRONMENTS` thay vì ép kiểu.
- Không dùng `@testing-library/user-event` (không thêm thư viện); dùng `fireEvent`.
- Máy mặc định là Node 10; phải thêm Node ≥ 20.19 vào `PATH` khi chạy lệnh. `engines` đã thêm (V2 của qa-1.1).
- Vitest chạy chậm (~70 giây, chủ yếu do khởi tạo jsdom từng tệp), không ảnh hưởng kết quả.
- Chưa kiểm tra bằng trình duyệt thật (`npm run dev`); giao diện chỉ được xác nhận qua test jsdom và build.
- V1 của qa-1.1 **vẫn còn**: các tệp cấu hình/types/data của 1.1 và toàn bộ mã 1.2 đang chưa được commit (`??`). Người điều phối cần commit đủ khi bàn giao.

## QA Results

**QA:** Linh Y Tiên Tử (Quinn) · 2026-11-15 · Node v22.13.0 · Báo cáo đầy đủ: `qa-1.2.md`

**Kết luận: ĐẠT (PASS)** – AC1–AC10 đều đạt.

- Chạy lại độc lập: `npm run lint` đạt (0 lỗi/0 cảnh báo); `npm run build` đạt (24 module); `npm test` đạt 8 tệp, 75/75 test.
- Đã đọc toàn bộ mã và test của story; kiểm tra tĩnh: UI không import `servers.json`, không `any`, không `dangerouslySetInnerHTML`, không thêm thư viện runtime.
- V2/V3 của qa-1.1 đã xử lý (`engines`, test `App` không mock).
- Vấn đề còn lại, không chặn: **V1 (Trung bình)** mã 1.1 + 1.2 chưa commit đủ nên checkout sạch từ `HEAD` không build được, cần commit đủ tệp; V2 (Thấp) jsdom khởi tạo 8 lần làm test chậm ~51 giây; V3 (Thấp) chưa quản lý focus khi chuyển danh sách ↔ chi tiết.
- Hạn chế: chưa kiểm tra bằng trình duyệt thật, chưa có báo cáo độ phủ.

**Trạng thái:** Done.
