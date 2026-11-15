# Story 1.1: Khung dự án React và mô hình dữ liệu máy chủ

- **Project:** ISS
- **Epic:** 1 – Quản lý thông tin máy chủ
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Ready
- **Phụ thuộc:** không (đây là story đầu tiên, là móng của Epic 1)
- **Bàn giao cho:** Kiếm Thánh · Developer

## Câu chuyện

Là một **lập trình viên của ISS**, tôi muốn **có sẵn khung ứng dụng React chạy được, cùng mô hình dữ liệu "Máy chủ" và lớp truy cập dữ liệu đọc từ file JSON**, để **các story sau (xem danh sách, thêm/sửa/xóa máy chủ, gắn ứng dụng cài đặt) xây trực tiếp lên nền này mà không phải dựng lại hạ tầng hay đổi cách lưu trữ**.

## Phạm vi

**Trong phạm vi:** khởi tạo project, kiểu dữ liệu `Server`, file JSON dữ liệu mẫu, lớp repository chỉ đọc, kiểm tra dữ liệu hợp lệ, màn hình khung tối thiểu, thiết lập test.

**Ngoài phạm vi (để story sau):** giao diện danh sách/chi tiết đầy đủ, thêm/sửa/xóa máy chủ, ghi dữ liệu xuống file/localStorage, định tuyến, xác thực, backend/API thật, ứng dụng cài đặt (Epic 2).

## Tiêu chí nghiệm thu

1. **AC1 – Project chạy được:** `npm install` rồi `npm run dev` khởi động ứng dụng React (Vite) không lỗi; `npm run build` thành công; `npm run lint` không có lỗi.
2. **AC2 – Kiểu dữ liệu `Server`:** có kiểu TypeScript `Server` với các trường: `id` (string, duy nhất), `name` (string, bắt buộc), `hostname` (string, bắt buộc), `ipAddress` (string, IPv4 hợp lệ), `os` (string), `environment` (`"production" | "staging" | "development"`), `status` (`"online" | "offline" | "maintenance"`), `description` (string, tùy chọn).
3. **AC3 – Dữ liệu JSON:** file `src/data/servers.json` chứa mảng ít nhất 3 máy chủ mẫu, phủ cả ba giá trị `status` và cả ba giá trị `environment`; mọi bản ghi đều hợp lệ theo AC2.
4. **AC4 – Repository chỉ đọc:** module `serverRepository` cung cấp `getAll(): Server[]` và `getById(id): Server | undefined`; `getById` với id không tồn tại trả về `undefined`, không ném lỗi. Giao diện (interface) tách khỏi nguồn JSON để sau này thay bằng API/localStorage mà không đổi nơi gọi.
5. **AC5 – Kiểm tra hợp lệ:** có hàm `validateServer(data: unknown)` trả về kết quả hợp lệ hoặc danh sách lỗi theo từng trường; từ chối bản ghi thiếu `name`/`hostname`, `ipAddress` sai định dạng, `status`/`environment` ngoài danh sách cho phép.
6. **AC6 – Phát hiện dữ liệu hỏng:** khi nạp JSON, bản ghi không hợp lệ hoặc trùng `id` bị loại khỏi kết quả và ghi cảnh báo qua `console.warn` (không làm sập ứng dụng).
7. **AC7 – Màn hình khung:** `App` hiển thị tiêu đề "ISS – Quản lý máy chủ" và dòng "Đã tải N máy chủ" với N là số máy chủ hợp lệ lấy từ repository (kiểm chứng đúng luồng JSON → repository → UI).
8. **AC8 – Test:** `npm test` chạy được và đạt toàn bộ; có test cho `validateServer` (hợp lệ và từng loại lỗi), `serverRepository` (`getAll`, `getById` có/không tồn tại, loại bản ghi hỏng/trùng id) và `App` (hiển thị đúng số máy chủ).

## Nhiệm vụ / việc con

- [ ] **T1 – Khởi tạo project (AC1)**
  - [ ] Tạo project Vite + React + TypeScript tại gốc repo, giữ nguyên thư mục `docs/` và `.git`.
  - [ ] Cấu hình ESLint, script `dev`, `build`, `lint`, `test` trong `package.json`.
  - [ ] Thêm `.gitignore` (`node_modules`, `dist`, v.v.).
- [ ] **T2 – Thiết lập test (AC8)**
  - [ ] Cài Vitest, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; cấu hình môi trường `jsdom` và file setup.
- [ ] **T3 – Kiểu dữ liệu (AC2)**
  - [ ] Tạo `src/types/server.ts` với `Server`, `ServerStatus`, `ServerEnvironment`.
- [ ] **T4 – Dữ liệu mẫu (AC3)**
  - [ ] Tạo `src/data/servers.json` với ≥ 3 máy chủ phủ đủ `status` và `environment`.
  - [ ] Bật `resolveJsonModule` trong `tsconfig` để import JSON.
- [ ] **T5 – Kiểm tra hợp lệ (AC5)**
  - [ ] Tạo `src/domain/validateServer.ts`.
  - [ ] Viết test cho từng quy tắc: thiếu trường bắt buộc, IP sai, enum sai, bản ghi hợp lệ.
- [ ] **T6 – Repository (AC4, AC6)**
  - [ ] Tạo `src/repositories/serverRepository.ts` (interface `ServerRepository`) và bản cài đặt đọc từ JSON.
  - [ ] Lọc bản ghi không hợp lệ/trùng `id`, cảnh báo bằng `console.warn`.
  - [ ] Viết test cho `getAll`, `getById`, bản ghi hỏng, trùng id.
- [ ] **T7 – Màn hình khung (AC7)**
  - [ ] Cập nhật `src/App.tsx` hiển thị tiêu đề và "Đã tải N máy chủ" từ repository.
  - [ ] Viết test render cho `App`.
- [ ] **T8 – Hoàn tất (AC1, AC8)**
  - [ ] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt.
  - [ ] Ghi kết quả vào mục Dev Agent Record.

## Ghi chú cho Dev

### Căn cứ và giả định (đọc kỹ)

- `epics.md`, `prd.md`, `architecture.md` hiện **còn là khung rỗng**, nên story này dựa trên yêu cầu #1 (`yeu-cau/yeu-cau-001.md`) và **quyết định của người dùng**: phạm vi 1.1 = "khung dự án + mô hình máy chủ"; công nghệ = **React, dữ liệu lưu tạm trong JSON**.
- **Giả định của Scrum Master (cần PM/Architect xác nhận):** dùng Vite + TypeScript + Vitest; tập trường của `Server` ở AC2 (đặc biệt `environment`, `os`); chưa có backend nên "lưu tạm trong JSON" hiểu là file JSON tĩnh nạp lúc build, chưa ghi ngược.
- Nếu Architect sau này cập nhật `architecture.md` mâu thuẫn với story này thì báo lại Scrum Master, không tự đổi hướng.

### Tệp cần tạo / sửa

| Tệp | Hành động |
|---|---|
| `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `index.html`, `.gitignore`, cấu hình ESLint | Tạo (khởi tạo Vite) |
| `src/main.tsx`, `src/App.tsx` | Tạo / sửa `App.tsx` theo AC7 |
| `src/types/server.ts` | Tạo |
| `src/data/servers.json` | Tạo |
| `src/domain/validateServer.ts` (+ `.test.ts`) | Tạo |
| `src/repositories/serverRepository.ts` (+ `.test.ts`) | Tạo |
| `src/App.test.tsx`, `src/test/setup.ts` | Tạo |

Không sửa `docs/` ngoài mục Dev Agent Record của chính tệp này.

### Quy ước

- Dùng TypeScript `strict`; không dùng `any` (dùng `unknown` ở ranh giới dữ liệu như `validateServer`).
- Tách lớp: `types` (kiểu) → `domain` (luật nghiệp vụ, thuần hàm) → `repositories` (truy cập dữ liệu) → UI. UI **không** import trực tiếp `servers.json`, chỉ đi qua repository.
- Test đặt cạnh mã nguồn, đặt tên `*.test.ts(x)`.
- Thông báo/nhãn giao diện bằng tiếng Việt; tên mã (biến, hàm, kiểu) bằng tiếng Anh.
- Không thêm thư viện ngoài danh sách ở T1–T2 khi chưa cần (không router, không state manager, không UI kit).

### Lệnh

```
npm install
npm run dev      # chạy thử
npm run lint
npm run build
npm test         # vitest run
```

Lưu ý: `npm create vite@latest` có thể hỏi khi thư mục không rỗng; có thể khởi tạo ở thư mục tạm rồi chép vào gốc repo, tránh ghi đè `docs/`.

### Definition of Done

Mọi ô nhiệm vụ đã đánh dấu; `lint`, `build`, `test` đều đạt; các AC1–AC8 có bằng chứng trong Dev Agent Record; sau đó chuyển story sang `review` để QA (Linh Y Tiên Tử) kiểm thử.

## Dev Agent Record

_(Để trống – Developer điền: mô hình/agent dùng, danh sách tệp đã tạo/sửa, lệnh test đã chạy và kết quả, các quyết định/lệch so với story.)_

## QA Results

_(Để trống – QA điền sau khi kiểm thử.)_
