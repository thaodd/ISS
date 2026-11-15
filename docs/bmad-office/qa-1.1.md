# Báo cáo QA: story 1.1 · Khung dự án React và mô hình dữ liệu máy chủ

- **Project:** ISS
- **Agent:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày kiểm thử:** 2026-11-15
- **Đầu vào:** `docs/bmad-office/story-1.1.md` (đề bài ghi `docs/stories/1.1.story.md`, đường dẫn thật là `docs/bmad-office/`), mã trong working tree (commit `6683830` + các tệp chưa commit).
- **Môi trường:** Node **v22.13.0** / npm 10.9.2 (lấy từ nvm; Node mặc định của máy là v10.24.1, không chạy được Vite/Vitest).

## Kết quả

- **Kết luận: ĐẠT (PASS)** – 8/8 tiêu chí nghiệm thu đạt, không có lỗi chặn. Có 1 vấn đề mức Trung bình về commit và vài đề xuất mức Thấp (xem bên dưới).

## Lệnh đã chạy (QA chạy lại độc lập, không dựa vào báo cáo của Dev)

| Lệnh | Kết quả |
|---|---|
| `npm test` (`vitest run`) | 3 tệp, **37/37 test đạt** (17 s) |
| `npm run lint` (`eslint .`) | không lỗi, không cảnh báo |
| `npm run build` (`tsc -b && vite build`) | thành công, 19 module, `dist/index-*.js` 221,94 kB (gzip 69,75 kB) |
| `npm run dev` (vite, cổng 5199) | khởi động ~1 s; `GET /`, `/src/main.tsx`, `/src/data/servers.json` đều **200**; `<title>` = "ISS – Quản lý máy chủ"; đã dừng tiến trình sau khi kiểm tra |
| `npm audit --omit=dev` | **0 lỗ hổng** (phụ thuộc runtime sạch) |
| `npm audit` (cả dev) | 7 lỗ hổng moderate, chuỗi `@typescript-eslint` (chỉ công cụ dev, không vào bản build) |

## Đối chiếu tiêu chí nghiệm thu

| AC | Nội dung | Kết quả | Bằng chứng |
|---|---|---|---|
| AC1 | Project chạy được (dev, build, lint) | **Đạt** | Bảng lệnh ở trên: `build` thành công, `lint` sạch, dev server trả 200. Chưa mở bằng trình duyệt thật (xem V4). |
| AC2 | Kiểu `Server` đủ trường | **Đạt** | `src/types/server.ts`: `id, name, hostname, ipAddress, os` (string), `environment` (`production\|staging\|development`), `status` (`online\|offline\|maintenance`), `description?`. Enum lấy từ hằng `as const` dùng chung với validator. TS `strict` bật, build qua. |
| AC3 | `servers.json` ≥ 3 máy chủ, phủ đủ status và environment, đều hợp lệ | **Đạt** | 3 bản ghi: srv-001 production/online, srv-002 staging/maintenance, srv-003 development/offline. Test "nạp được ít nhất 3 máy chủ mẫu, phủ đủ status và environment" đạt; không có `console.warn` khi nạp. |
| AC4 | Repository chỉ đọc, `getAll`/`getById`, interface tách khỏi nguồn JSON | **Đạt** | `interface ServerRepository` + `createJsonServerRepository(raw)` + thể hiện `serverRepository`. `getById('zzz')` trả `undefined`, không ném lỗi (test riêng). `getAll()` trả bản sao mảng (test). |
| AC5 | `validateServer(data: unknown)` trả hợp lệ hoặc lỗi theo trường | **Đạt** | Đọc mã `validateServer.ts` + test: thiếu `id/name/hostname/os`, chuỗi toàn khoảng trắng, 8 IP sai, 3 IP đúng, enum sai, `description` sai kiểu, đầu vào không phải object (null, undefined, số, chuỗi, mảng, boolean), gom nhiều lỗi. Regex IPv4 không nhận số 0 đứng đầu và không nhận khoảng trắng thừa. |
| AC6 | Bản ghi hỏng/trùng `id` bị loại + `console.warn`, không sập | **Đạt** | Test: 3 bản ghi hỏng (IP sai, name rỗng, `null`) → 3 lần `warn`, chỉ còn 1 bản hợp lệ; trùng id → giữ bản đầu, 1 lần `warn`; dữ liệu sạch → 0 `warn`. Không ném ngoại lệ. |
| AC7 | `App` hiển thị tiêu đề và "Đã tải N máy chủ" từ repository | **Đạt** | `App.tsx` chỉ import repository (không import JSON). Test: heading "ISS – Quản lý máy chủ" và "Đã tải 2 máy chủ" với repository giả 2 máy chủ. Với JSON mẫu thật sẽ hiển thị "Đã tải 3 máy chủ" (suy ra từ AC3, xem V3). |
| AC8 | `npm test` đạt; có test cho validator, repository, App | **Đạt** | 37 test / 3 tệp đạt; nội dung test khớp từng mục AC8. |

Ràng buộc "Quy ước" của story cũng đạt: không dùng `any` (ESLint `no-explicit-any: error`, grep không thấy `any`), dùng `unknown` ở ranh giới dữ liệu, tách lớp types → domain → repositories → UI, test đặt cạnh mã nguồn, nhãn UI tiếng Việt, tên mã tiếng Anh, không thêm router/state manager/UI kit.

## Chất lượng mã và bảo mật cơ bản

- Mã ngắn, rõ, tách lớp đúng như thiết kế; validator là hàm thuần, dễ tái sử dụng cho story thêm/sửa sau này.
- Bảo mật: không có `dangerouslySetInnerHTML`, `eval`, hay truy cập mạng; dữ liệu JSON tĩnh được kiểm tra qua `validateServer` trước khi dùng; React tự escape khi hiển thị. `.gitignore` loại `node_modules`, `dist`, `.env`, `*.local`. Không có bí mật trong repo. Phụ thuộc runtime không có lỗ hổng.
- Không phát hiện lỗi logic trong `validateServer`/`createJsonServerRepository`. `Map` nên id kiểu `__proto__` không gây ô nhiễm prototype.

## Vấn đề tìm thấy

| # | Mức độ | Mô tả | Đề xuất sửa |
|---|---|---|---|
| V1 | **Trung bình** | Commit `6683830` của Dev chỉ chứa `src/App*`, `validateServer*`, `serverRepository*` và tài liệu. Các tệp sau **chưa được commit** (đang `??` trong `git status`): `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.gitignore`, `src/main.tsx`, `src/vite-env.d.ts`, `src/types/`, `src/data/servers.json`, `src/test/setup.ts`. Tại HEAD, `git clone` rồi `npm install`/`build` sẽ **không chạy được** (thiếu `package.json`, kiểu `Server`, JSON). Working tree thì đầy đủ và đạt mọi AC. | Thêm toàn bộ tệp trên vào một commit trước khi hợp nhất/bàn giao Scrum Master (Dev hoặc người điều phối commit). Không cần sửa mã. |
| V2 | Thấp | Chưa khai báo phiên bản Node tối thiểu. Vite 8/Vitest 5 cần Node ≥ 20.19 hoặc ≥ 22.12, nhưng máy mặc định là Node 10, `npm install` dưới Node cũ sẽ lỗi khó hiểu. | Thêm `"engines": { "node": ">=20.19" }` vào `package.json` và/hoặc `.nvmrc`; ghi vào README khi có. |
| V3 | Thấp | Test `App` dùng repository giả (`vi.mock`), nên chưa có test nào chứng minh luồng **JSON thật → repository → UI** hiển thị "Đã tải 3 máy chủ" như AC7 mô tả ("kiểm chứng đúng luồng"). Từng khâu đều có test riêng nên rủi ro thấp. | Thêm một test render `App` không mock, kỳ vọng "Đã tải 3 máy chủ" (hoặc ≥ 3) ở story kế tiếp. |
| V4 | Thấp | Chưa kiểm tra giao diện trên trình duyệt thật (môi trường không có trình duyệt tự động); mới có render jsdom và dev server trả 200. | Người dùng/PO mở `npm run dev` xem nhanh trang hiển thị "Đã tải 3 máy chủ". |
| V5 | Thấp | `npm audit` (cả dev) báo 7 lỗ hổng moderate ở chuỗi `@typescript-eslint` (cần `audit fix --force`, có thể đổi phiên bản lớn). Chỉ ảnh hưởng công cụ dev; runtime sạch. | Theo dõi, nâng `typescript-eslint` khi có bản vá; không chặn story. |

Kiểm thử còn thiếu (đều không chặn): test tích hợp App không mock (V3); chưa có test cho trường hợp `description` là `null`/chuỗi rỗng (hiện `null` bị từ chối, chuỗi rỗng được chấp nhận; hành vi hợp lý nhưng chưa được ghi thành test).

## Kết luận

Story 1.1 **đạt**: 8/8 AC có bằng chứng chạy thật, lint/build/test sạch, mã đúng quy ước. Chuyển trạng thái story sang **Done** và cập nhật `sprint-status.yaml`. Điều kiện đi kèm: xử lý V1 (commit đủ tệp) trước khi hợp nhất; V2–V5 là cải tiến, có thể làm ở story sau.

**Bàn giao:** Thiết Tướng · Scrum Master (đạt) – cân nhắc nêu V1 với Dev/người điều phối để commit đủ tệp.
