# Báo cáo QA: Story 1.1 · Khung dự án React và mô hình dữ liệu máy chủ

- **Project:** ISS
- **Người kiểm thử:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày:** 2026-11-15
- **Story:** `docs/stories/1.1.story.md` (bản sao `docs/bmad-office/story-1.1.md`)
- **Môi trường:** Windows 10, Node v22.13.0 / npm 10.9.2 (máy mặc định là Node 10 nên phải chuyển qua nvm)
- **Phạm vi:** kiểm thử trên working tree hiện tại (gồm các tệp chưa commit). Không sửa mã ứng dụng.

## Kết luận

**ĐẠT (PASS).** Cả 8 tiêu chí nghiệm thu đều đạt, có bằng chứng chạy thật. Có 1 vấn đề mức Trung bình về quy trình (tệp cấu hình chưa commit) và vài vấn đề mức Thấp; không có vấn đề chặn.

## Kết quả chạy

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | exit 0, không lỗi/cảnh báo |
| `npm run build` (`tsc -b && vite build`) | exit 0, 39 module, JS 251 kB (gzip 75 kB) |
| `npm test` (`vitest run`) | exit 0, **24/24 tệp, 331/331 test đạt**, ~199 s |
| `vite` dev (cổng 5199) | khởi động ~1,9 s; `GET /`, `/src/main.tsx`, `/src/data/servers.json` đều 200 |
| `npm audit --omit=dev` | 0 lỗ hổng |

## Đối chiếu tiêu chí nghiệm thu

| AC | Kết quả | Bằng chứng |
|---|---|---|
| AC1 – Project chạy được | **Đạt** | lint, build, dev server như bảng trên; `package.json` có `engines.node ">=20.19"` và script `dev/build/lint/test`; `eslint.config.js` đặt `@typescript-eslint/no-explicit-any: error`; `.gitignore` có `node_modules`, `dist`, `.env`, `*.local`. |
| AC2 – Kiểu `Server` | **Đạt** | `src/types/server.ts`: đủ 8 trường đúng kiểu; `environment`/`status` suy ra từ hằng `as const` dùng chung với validator; `description?` tùy chọn. `tsc -b` strict qua. |
| AC3 – Dữ liệu JSON | **Đạt** | `src/data/servers.json` có 3 bản ghi (srv-001..003) phủ `online/maintenance/offline` và `production/staging/development`; cả 3 qua `validateServer`; test "nạp được ít nhất 3 máy chủ mẫu, phủ đủ status và environment" đạt; `resolveJsonModule: true`. |
| AC4 – Repository | **Đạt** | `ServerRepository` (interface) tách khỏi nguồn JSON; `getAll()`, `getById()`; id lạ trả `undefined`, không ném lỗi (test riêng). `getAll()` trả bản sao. Interface nay có thêm `create/update/remove` (do 1.3), không làm hỏng hợp đồng đọc. |
| AC5 – `validateServer` | **Đạt** | `src/domain/validateServer.ts`: nhận `unknown`, trả `{valid:true, server}` hoặc `{valid:false, errors}` theo từng trường. Test phủ: hợp lệ, không có description, đầu vào không phải object (null/undefined/số/chuỗi/mảng/bool), thiếu `id/name/hostname/os`, chuỗi trắng, 8 IP sai và 3 IP đúng, enum sai, `description` sai kiểu, gom nhiều lỗi. |
| AC6 – Dữ liệu hỏng | **Đạt** | `toServerMap` loại bản ghi không hợp lệ/trùng `id` (giữ bản đầu) và gọi `console.warn`, không ném lỗi. Test: 3 bản ghi hỏng → 3 cảnh báo; trùng id → giữ "Đầu", 1 cảnh báo; dữ liệu sạch → 0 cảnh báo. |
| AC7 – Màn hình khung | **Đạt** | `src/App.tsx` hiển thị `<h1>ISS – Quản lý máy chủ</h1>` và `Đã tải {servers.length} máy chủ` với `servers` lấy từ `repository.getAll()`. UI không import `servers.json` (grep xác nhận chỉ `serverRepository.ts` import). `App` đã mở rộng bởi 1.2–2.3 nhưng AC7 vẫn đúng. |
| AC8 – Test | **Đạt** | `npm test` 331/331. Có test `validateServer`, `serverRepository`, `App` (repo giả: "Đã tải 2 máy chủ"; repo rỗng: "Đã tải 0 máy chủ") và test không mock "Đã tải 3 máy chủ" trong `src/App.integration.test.tsx` (đọc `servers.json` thật). |

## Chất lượng mã và bảo mật cơ bản

- TypeScript `strict`, `noUnusedLocals/Parameters`; không có `any` trong mã nguồn (grep).
- Phân lớp đúng: `types` → `domain` (hàm thuần) → `repositories` → UI.
- Không có `dangerouslySetInnerHTML`, `innerHTML`, `eval`; React tự escape khi hiển thị dữ liệu. Dữ liệu từ ranh giới (JSON, localStorage) đều đi qua `validateServer` (`unknown` → kiểu `Server`), `JSON.parse` được bọc `try/catch`.
- Lỗi lưu trữ (`localStorage` bị chặn/đầy) chỉ cảnh báo, không làm sập ứng dụng.
- Không có bí mật trong mã; `.env` bị bỏ qua bởi git; `npm audit` sạch.
- Regex IPv4 chặt (không nhận số 0 đứng đầu, không nhận khoảng trắng đầu/cuối).

## Vấn đề tìm thấy

| # | Mức | Mô tả | Cách sửa |
|---|---|---|---|
| V1 | Trung bình | HEAD (`eff284d`) chỉ có `package.json` và mã `src/`; **chưa commit**: `.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `src/main.tsx`, `src/vite-env.d.ts`, `src/types/server.ts`, `src/data/servers.json`, `src/test/setup.ts`, `src/App.installations.test.tsx`. Clone sạch từ HEAD sẽ không build/test được (thiếu kiểu `Server`, JSON, cấu hình). Đây là nợ T8 mà Dev đã ghi nhận; Dev không được phép commit theo quy tắc văn phòng. | Ứng dụng tự commit working tree ngay sau bước này; SM kiểm tra `git status` sạch trước khi bắt đầu 2.3. Sau commit nên chạy lại `npm ci && npm run build` trên bản clone sạch. |
| V2 | Thấp | Thiếu test cho `os` chỉ gồm khoảng trắng (chỉ test `id/name/hostname`). Mã đã xử lý đúng (`trim().length === 0`), chỉ thiếu bằng chứng. | Thêm `'os'` vào `it.each(['id','name','hostname'])` ở `validateServer.test.ts`. |
| V3 | Thấp | Bản ghi nạp từ JSON/localStorage không được chuẩn hóa (trim); ví dụ `name: "  A  "` giữ nguyên khoảng trắng. Đường `create/update` thì đã chuẩn hóa nhờ `normalizeServerInput`. Không ảnh hưởng nguồn mẫu hiện tại. | Để story sau quyết định (có thể trim trong `toServerMap`). |
| V4 | Thấp | Bộ test chậm (~199 s) vì jsdom tạo 24 lần (78% thời gian). | Cân nhắc `pool: 'vmThreads'` hoặc `isolate: false` trong `vite.config.ts`. |
| V5 | Thông tin | Test không mock "Đã tải 3 máy chủ" nằm ở `App.integration.test.tsx` chứ không phải `App.test.tsx` như bảng tệp của story; hành vi vẫn đúng AC8. Tài liệu kiến trúc (`architecture.md`) vẫn là khung rỗng nên các giả định Vite/TS/Vitest và tập trường `Server` chờ PM/Architect xác nhận. | Không chặn; ghi nhận. |

## Kiểm thử còn thiếu (đề xuất, không chặn)

- Test cho `os` toàn khoảng trắng (V2).
- Test hồi quy: `description` toàn khoảng trắng nạp từ JSON (hiện được giữ nguyên).

## Bàn giao

- Kết quả: **ĐẠT** → báo Thiết Tướng (Scrum Master); story 1.1 chuyển `Done`, `docs/bmad-office/sprint-status.yaml` cập nhật.
- Không có bug report (`bug-1.1.md`) cần gửi Dev.
- Việc cần SM theo dõi: V1 (commit đủ tệp để HEAD build được).
