# Story 1.2: Danh sách, tìm kiếm/lọc và xem chi tiết máy chủ

- **Project:** ISS
- **Epic:** 1 – Quản lý thông tin máy chủ
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Ready
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

- [ ] **T1 – Nhãn hiển thị (AC2)**
  - [ ] Tạo `src/domain/serverLabels.ts` xuất `STATUS_LABELS: Record<ServerStatus, string>` và `ENVIRONMENT_LABELS: Record<ServerEnvironment, string>` theo AC2.
  - [ ] Test: mọi giá trị trong `SERVER_STATUSES`/`SERVER_ENVIRONMENTS` đều có nhãn không rỗng.
- [ ] **T2 – Logic lọc (AC3, AC4, AC8)**
  - [ ] Tạo `src/domain/filterServers.ts`: `ServerFilters { query: string; status: ServerStatus | 'all'; environment: ServerEnvironment | 'all' }`, hằng `DEFAULT_FILTERS`, hàm `filterServers(servers, filters): Server[]` (thuần, không đổi mảng đầu vào, giữ thứ tự).
  - [ ] Test `filterServers.test.ts`: query khớp tên/hostname/IP; không phân biệt hoa/thường; trim; query rỗng/khoảng trắng; lọc status; lọc environment; kết hợp AND; không khớp → mảng rỗng; không làm thay đổi mảng đầu vào.
- [ ] **T3 – Thành phần danh sách (AC1, AC3, AC4, AC5, AC9)**
  - [ ] Tạo `src/components/ServerList.tsx` nhận `servers`, `filters`, `onFiltersChange`, `onSelect(id)`; hiển thị ô tìm kiếm, hai ô chọn, dòng "Hiển thị X / N máy chủ", bảng, các trạng thái rỗng và nút "Xóa bộ lọc".
  - [ ] Tên máy chủ là `<button>` gọi `onSelect(server.id)`.
  - [ ] Test `ServerList.test.tsx` (không cần repository): render đủ dòng và cột; gõ tìm kiếm/đổi bộ lọc → gọi `onFiltersChange` hoặc cập nhật bảng đúng; không khớp → "Không tìm thấy máy chủ phù hợp" + "Xóa bộ lọc"; danh sách rỗng → "Chưa có máy chủ nào"; bấm tên → `onSelect` đúng id.
- [ ] **T4 – Thành phần chi tiết (AC6, AC7, AC9)**
  - [ ] Tạo `src/components/ServerDetail.tsx` nhận `server: Server | undefined` và `onBack`; hiển thị đủ trường (dùng `<dl>`), "Không có mô tả", hoặc "Không tìm thấy máy chủ"; nút "Quay lại danh sách".
  - [ ] Test `ServerDetail.test.tsx`: đủ trường; không mô tả; `undefined`; bấm quay lại → `onBack`.
- [ ] **T5 – Ghép trong App (AC1, AC6, AC7, AC8)**
  - [ ] Sửa `src/App.tsx`: giữ tiêu đề "ISS – Quản lý máy chủ" và "Đã tải N máy chủ"; giữ `filters` (dùng `DEFAULT_FILTERS`) và `selectedId: string | null` bằng `useState`; `selectedId === null` → danh sách, ngược lại → chi tiết qua `serverRepository.getById`. Giữ `filters` ở `App` để quay lại không mất bộ lọc (AC7).
  - [ ] Chỉ import `serverRepository`; không import `servers.json`.
- [ ] **T6 – Test App (AC7, AC10)**
  - [ ] Cập nhật `src/App.test.tsx`: mock repository hiện tại trả `{id:'x'}`, không còn đủ trường, phải đổi sang dữ liệu `Server` đầy đủ. Giữ hai test cũ (tiêu đề, "Đã tải 2 máy chủ").
  - [ ] Thêm test luồng: gõ tìm kiếm → bấm tên → thấy chi tiết → "Quay lại danh sách" → ô tìm kiếm vẫn giữ giá trị và danh sách vẫn đã lọc.
  - [ ] Thêm test id không tồn tại (mock `getById` trả `undefined`) → "Không tìm thấy máy chủ".
  - [ ] Thêm **test không mock** (có thể tách `src/App.integration.test.tsx` để không dính `vi.mock` của tệp kia) kỳ vọng "Đã tải 3 máy chủ" và thấy 3 tên máy chủ mẫu.
- [ ] **T7 – Dọn tồn đọng nhỏ của 1.1 (V2)**
  - [ ] Thêm `"engines": { "node": ">=20.19" }` vào `package.json` (QA 1.1, V2).
- [ ] **T8 – Hoàn tất (AC10)**
  - [ ] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt (dùng Node ≥ 20.19).
  - [ ] Ghi kết quả và bằng chứng theo AC vào mục Dev Agent Record, đổi trạng thái story sang Review.

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

_(để trống – Developer điền)_

## QA Results

_(để trống – QA điền)_
