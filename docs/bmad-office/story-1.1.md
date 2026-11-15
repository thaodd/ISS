# Story 1.1: Khung dự án React và mô hình dữ liệu máy chủ

- **Project:** ISS
- **Epic:** 1 – Quản lý thông tin máy chủ
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Done
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

- [x] **T1 – Khởi tạo project (AC1)**
  - [x] Tạo project Vite + React + TypeScript tại gốc repo, giữ nguyên thư mục `docs/` và `.git`.
  - [x] Cấu hình ESLint, script `dev`, `build`, `lint`, `test` trong `package.json`.
  - [x] Thêm `.gitignore` (`node_modules`, `dist`, v.v.).
- [x] **T2 – Thiết lập test (AC8)**
  - [x] Cài Vitest, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; cấu hình môi trường `jsdom` và file setup.
- [x] **T3 – Kiểu dữ liệu (AC2)**
  - [x] Tạo `src/types/server.ts` với `Server`, `ServerStatus`, `ServerEnvironment`.
- [x] **T4 – Dữ liệu mẫu (AC3)**
  - [x] Tạo `src/data/servers.json` với ≥ 3 máy chủ phủ đủ `status` và `environment`.
  - [x] Bật `resolveJsonModule` trong `tsconfig` để import JSON.
- [x] **T5 – Kiểm tra hợp lệ (AC5)**
  - [x] Tạo `src/domain/validateServer.ts`.
  - [x] Viết test cho từng quy tắc: thiếu trường bắt buộc, IP sai, enum sai, bản ghi hợp lệ.
- [x] **T6 – Repository (AC4, AC6)**
  - [x] Tạo `src/repositories/serverRepository.ts` (interface `ServerRepository`) và bản cài đặt đọc từ JSON.
  - [x] Lọc bản ghi không hợp lệ/trùng `id`, cảnh báo bằng `console.warn`.
  - [x] Viết test cho `getAll`, `getById`, bản ghi hỏng, trùng id.
- [x] **T7 – Màn hình khung (AC7)**
  - [x] Cập nhật `src/App.tsx` hiển thị tiêu đề và "Đã tải N máy chủ" từ repository.
  - [x] Viết test render cho `App`.
- [x] **T8 – Hoàn tất (AC1, AC8)**
  - [x] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt.
  - [x] Ghi kết quả vào mục Dev Agent Record.

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

**Agent:** Kiếm Thánh · Developer (Amelia) – hoàn thành 2026-11-15. Trạng thái: **Review**.

### Môi trường
- Máy mặc định dùng Node v10.24.1 / npm 6 (quá cũ cho Vite/Vitest). Đã dùng Node **v22.13.0** (có sẵn trong nvm, gắn vào PATH theo từng lệnh, không đổi cấu hình máy). Cần Node ≥ 20.19 hoặc ≥ 22.12 để chạy dự án.
- Phiên bản cài được: Vite 8.3.8, Vitest 5.1.0, React 19.3.1, TypeScript 6.0.3, ESLint 10.15.0, `@testing-library/react` 16.3.3, `@testing-library/jest-dom` 7.0.1, jsdom 29.1.1.

### Tệp đã tạo
- Cấu hình: `package.json`, `package-lock.json`, `.gitignore`, `index.html`, `vite.config.ts` (gồm cấu hình Vitest: jsdom, globals, setup), `tsconfig.json`, `tsconfig.app.json` (strict, `resolveJsonModule`), `tsconfig.node.json`, `eslint.config.js` (cấm `any`).
- Mã nguồn: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/types/server.ts`, `src/data/servers.json`, `src/domain/validateServer.ts`, `src/repositories/serverRepository.ts`.
- Test: `src/test/setup.ts`, `src/domain/validateServer.test.ts`, `src/repositories/serverRepository.test.ts`, `src/App.test.tsx`.
- Tài liệu sửa: chỉ `story-1.1.md` (tệp này) và `sprint-status.yaml`.

### Lệnh đã chạy và kết quả
| Lệnh | Kết quả |
|---|---|
| `npm install` | thành công |
| `npm test` (`vitest run`) | **3 tệp, 37 test, đạt toàn bộ** |
| `npm run lint` (`eslint .`) | không lỗi, không cảnh báo |
| `npm run build` (`tsc -b && vite build`) | thành công, 19 module, `dist/` ~222 kB |
| `npm run dev` | Vite khởi động (ready ~1 s); `GET /`, `/src/main.tsx`, `/src/data/servers.json` đều trả 200; đã dừng sau khi kiểm tra |

### Bằng chứng theo AC
- **AC1:** dev/build/lint đạt như bảng trên.
- **AC2:** `src/types/server.ts` – `Server`, `ServerStatus`, `ServerEnvironment` (kèm hằng `SERVER_STATUSES`, `SERVER_ENVIRONMENTS` để dùng chung với validator).
- **AC3:** `servers.json` có 3 máy chủ (`srv-001` production/online, `srv-002` staging/maintenance, `srv-003` development/offline); test `serverRepository (nguồn servers.json)` xác nhận phủ đủ 3 status và 3 environment.
- **AC4:** interface `ServerRepository { getAll, getById }`; `createJsonServerRepository(raw)` là bản cài đặt JSON, `serverRepository` là thể hiện dùng JSON mẫu. `getById` id lạ → `undefined`, không ném lỗi (có test).
- **AC5:** `validateServer(data: unknown)` trả `{valid:true, server}` hoặc `{valid:false, errors}` theo từng trường; test phủ thiếu `id/name/hostname/os`, chuỗi toàn khoảng trắng, 8 IP sai, 3 IP đúng, enum sai, `description` sai kiểu, đầu vào không phải object, gom nhiều lỗi.
- **AC6:** bản ghi hỏng hoặc trùng `id` bị loại + `console.warn` (có test đếm số lần cảnh báo; giữ bản ghi đầu tiên khi trùng id).
- **AC7:** `App.tsx` hiển thị "ISS – Quản lý máy chủ" và "Đã tải N máy chủ"; UI chỉ import repository, không import JSON. Test dùng repository giả (2 máy chủ → "Đã tải 2 máy chủ").
- **AC8:** `npm test` đạt như trên.

### Quyết định / lệch so với story
- `architecture.md` còn là khung rỗng nên bám hoàn toàn vào story (giả định Vite + TS + Vitest của SM giữ nguyên). Không có mâu thuẫn cần báo lại.
- Tài liệu thực tế nằm ở `docs/bmad-office/story-1.1.md` (không phải `docs/stories/1.1.story.md` như đề bài ghi).
- Bổ sung ngoài danh sách T1–T2 nhưng cần thiết kỹ thuật: `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `@types/node`, `@testing-library/dom` (peer của testing-library/react), và bộ ESLint (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`). Không thêm router/state manager/UI kit.
- Quy tắc validator tự quyết thêm (story chưa nêu): `id` và `os` bắt buộc không rỗng; chuỗi chỉ gồm khoảng trắng bị coi là thiếu; IPv4 không chấp nhận số 0 đứng đầu (vd `01.2.3.4`); `getAll()` trả bản sao mảng.
- `npm audit` báo 7 lỗ hổng mức moderate trong cây phụ thuộc dev (chuỗi `@typescript-eslint`); chưa chạy `audit fix --force` vì có thể phá vỡ phiên bản. Chỉ ảnh hưởng công cụ dev, không vào bản build.
- Chưa kiểm tra giao diện trên trình duyệt thật (không có trình duyệt tự động); mới kiểm chứng bằng test render (jsdom) và dev server trả 200.

### Bàn giao QA
Linh Y Tiên Tử chạy lại `npm install && npm test && npm run lint && npm run build` bằng Node ≥ 20.19, và nên mở `npm run dev` xem trang hiển thị "Đã tải 3 máy chủ". Lưu ý `qa-1.1.md` hiện là bản "mô phỏng" cũ, cần viết lại sau khi kiểm thử thật.

## QA Results

**QA:** Linh Y Tiên Tử · QA Engineer (Quinn) – 2026-11-15. **Kết luận: ĐẠT (PASS).** Chi tiết: `qa-1.1.md`.

- Chạy lại độc lập bằng Node v22.13.0: `npm test` 37/37 đạt; `npm run lint` sạch; `npm run build` thành công; `npm run dev` trả 200 cho `/`, `/src/main.tsx`, `/src/data/servers.json`; `npm audit --omit=dev` 0 lỗ hổng.
- AC1–AC8: **đạt cả 8**, có bằng chứng trong `qa-1.1.md`.
- Vấn đề: V1 (Trung bình) – commit `6683830` thiếu `package.json`, `tsconfig*`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/types/`, `src/data/servers.json`, `src/test/setup.ts`… (đang untracked) → cần commit đủ trước khi hợp nhất. V2 (Thấp) thêm `engines` Node ≥ 20.19; V3 (Thấp) thêm test App không mock; V4 (Thấp) chưa xem trên trình duyệt thật; V5 (Thấp) `npm audit` dev 7 moderate.
- Trạng thái story: **Done**.
