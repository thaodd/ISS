# Báo cáo QA: Story 2.1 · Danh mục ứng dụng (thêm, sửa, xóa, xem) và lưu localStorage

- **Project:** ISS
- **Agent:** Linh Y Tiên Tử · QA Engineer (Quinn)
- **Ngày kiểm thử:** 2026-11-15
- **Môi trường:** Node v22.13.0 (nvm), Windows 10; Vitest 5.1.0 + jsdom; Vite 8.3.8
- **Phạm vi kiểm tra:** commit `19fd9a2` (feat story-2.1) cùng cây làm việc hiện tại
- **Ghi chú đường dẫn:** lệnh giao việc nêu `docs/stories/2.1.story.md` và `docs/sprint-status.yaml`, nhưng tài liệu thật nằm ở `docs/bmad-office/story-2.1.md` và `docs/bmad-office/sprint-status.yaml`. Báo cáo này đặt ở `docs/bmad-office/qa-2.1.md`, cùng chỗ với `qa-1.1..1.3`.

## Kết quả

- **Trạng thái: ĐẠT (PASS).** AC1–AC19 đều đạt. Có 4 vấn đề, mức Trung bình đến Thấp, không có lỗi chức năng; không vấn đề nào chặn nghiệm thu.

## Test đã chạy (do QA chạy lại, Node 22.13.0)

| Lệnh | Kết quả |
|---|---|
| `npm run lint` (`eslint .`) | Đạt, không cảnh báo (exit 0) |
| `npm run build` (`tsc -b && vite build`) | Đạt, 33 module, bundle JS 241,64 kB (exit 0) |
| `npm test` (`vitest run`) | Đạt: 18 tệp, **229/229 test** (136 cũ giữ nguyên + 93 mới), 165,6 giây (exit 0) |

Số liệu khớp Dev Agent Record. QA không sửa mã ứng dụng.

## Đối chiếu tiêu chí nghiệm thu

| AC | Nội dung | Kết quả | Bằng chứng |
|---|---|---|---|
| AC1 | Kiểu `Application`, không sửa `types/server.ts` | Đạt | `src/types/application.ts` đúng 4 trường. `git diff HEAD~1 HEAD --name-only` không có `types/server.ts` |
| AC2 | `validateApplication(unknown)` | Đạt | `validateApplication.ts:13-37`: đúng 5 thông báo nguyên văn, báo đồng thời nhiều lỗi, trường lạ bị bỏ, không ném lỗi. Có `validateApplication.test.ts` |
| AC3 | `normalizeApplicationInput`, `generateApplicationId` | Đạt | `applicationInput.ts`: cắt khoảng trắng, bỏ mô tả rỗng, không đổi đầu vào; id max+1 đệm 3 chữ số, bỏ id lạ, `app-999` → `app-1000`. Có `applicationInput.test.ts` |
| AC4 | Repository đọc/ghi | Đạt | `applicationRepository.ts:112-125`: `getAll` trả bản sao (`Array.from`), `create` thêm cuối, `update` giữ id/vị trí (`Map.set` trên khóa cũ, `id` trong input bị bỏ), id lạ → `Không tìm thấy ứng dụng.`, `remove` trả boolean. Dữ liệu sai thoát trước `set`/`persist` nên không đổi bộ nhớ lẫn kho |
| AC5 | Tên không trùng | Đạt | `applicationRepository.ts:101-105`: so sánh `trim().toLocaleLowerCase()`, loại trừ chính bản ghi (`other.id !== id`). Nạp dữ liệu không kiểm trùng tên (`toApplicationMap`) |
| AC6 | Lưu bền `localStorage` | Đạt | Khóa `iss.apps.v1`. Có khóa → nạp từ kho, `[]` là rỗng thật. JSON hỏng/không phải mảng/`getItem`/`setItem` ném lỗi → `console.warn`, không sập. Chỉ ghi sau thao tác thành công. Hàm `createApplicationRepository(seed, storage?)` có xuất |
| AC7 | Dữ liệu mẫu | Đạt | `applications.json` có đúng 3 bản ghi như đặc tả (PostgreSQL có mô tả). Test xác nhận 3 bản ghi hợp lệ và id kế tiếp là `app-004` |
| AC8 | Điều hướng | Đạt | `App.tsx:242-270`: `<nav aria-label="Điều hướng chính">`, hai nút `type="button"`, `aria-current="page"`, mặc định "Máy chủ". `filters` nằm ở `App` nên giữ khi đổi mục. `switchSection` xóa notice và lỗi. Chỉ hiện dòng "Đã tải…" và `h1` của mục đang mở. Test: nhóm "điều hướng" (3 test) |
| AC9 | Danh sách ứng dụng | Đạt | `ApplicationList.tsx`: nút "Thêm ứng dụng" luôn có, `Có N ứng dụng`, bảng Tên (`link-button`)/Nhà cung cấp/Mô tả, rỗng → `Chưa có ứng dụng nào` |
| AC10 | Chi tiết ứng dụng | Đạt | `ApplicationDetail.tsx`: vùng `aria-label`, nút quay lại, `h2` tên, Sửa/Xóa, `dl` Tên/ID/Nhà cung cấp/Mô tả; không tìm thấy → `Không tìm thấy ứng dụng`, không có Sửa/Xóa |
| AC11 | Thêm ứng dụng | Đạt | `ApplicationForm.tsx`: `<form>`, 3 trường có `<label htmlFor>`, mô tả là `textarea`, `Lưu` submit, `Hủy` button. `App.handleCreateApplication` chuyển sang chi tiết ứng dụng mới. Test: "thêm hợp lệ…" |
| AC12 | Sửa ứng dụng | Đạt | Điền sẵn, `id` chỉ là chữ (`ID: <strong>`), cập nhật xong quay về chi tiết. Test "sửa xóa hết mô tả" → `Không có mô tả` |
| AC13 | Lỗi theo từng trường | Đạt | `fieldProps` đặt `aria-invalid`/`aria-describedby`; lỗi hiện cạnh trường; giá trị giữ nguyên (state cục bộ); `errors.id` → `role="alert"`; sửa ứng dụng đã biến mất → rơi về `renderApplicationDetail` ("Không tìm thấy ứng dụng") |
| AC14 | Hủy | Đạt | Thêm → danh sách, sửa → chi tiết (`App.tsx:205,219`). Có test cho cả hai |
| AC15 | Xóa có xác nhận | Đạt | `role="alertdialog"` + `aria-label="Xác nhận xóa"`, nội dung đúng nguyên văn, hai nút, không dùng `window.confirm/alert/prompt` (grep không thấy). Test hủy rồi xác nhận, kiểm tra cả `localStorage` |
| AC16 | Thông báo và làm mới | Đạt | Ba thông báo đúng mẫu trong `<p role="status">`; `goToApplication` xóa notice rồi mới đặt notice mới; `applications` làm mới sau mỗi thao tác; xóa hết → `Chưa có ứng dụng nào` + nút Thêm |
| AC17 | Bền qua tải lại | Đạt | Nhóm "bền qua lần tải lại" (2 test): render `App` mới với repository mới trên cùng kho, kể cả xóa hết (không nạp lại dữ liệu mẫu) |
| AC18 | Kiến trúc/quy ước/không phá Epic 1 | Đạt | Grep `localStorage`/`applications.json`/`any` trong `Application*.tsx` và `App.tsx` không có kết quả. Chỉ `App` gọi repository. Prop `applicationRepository?` đã thêm, `repository?` giữ nguyên. Mỗi ô nhập có `<label>`. Tệp Epic 1 đổi duy nhất là `App.tsx` (và `App.css`). 136 test cũ vẫn đạt, không xóa/hạ test |
| AC19 | Lint/build/test | Đạt | Xem bảng "Test đã chạy" |

## Vấn đề tìm thấy

| # | Mức độ | Mô tả | Cách sửa đề xuất |
|---|---|---|---|
| V1 | **Trung bình** (nợ kỹ thuật kéo dài từ sprint 1) | `git status` cho thấy 13 tệp vẫn chưa commit: `.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/servers.json`, `src/main.tsx`, `src/test/setup.ts`, `src/types/server.ts`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`. Commit `19fd9a2` import `types/server.ts` và `servers.json`, nên **checkout sạch của HEAD không build được**. Cây làm việc hiện tại vẫn đạt vì có các tệp này | Người điều phối `git add` đủ các tệp trên rồi commit trước khi bắt đầu Story 2.2. Việc của điều phối, không phải Dev |
| V2 | Thấp | `ApplicationDetail.tsx:54` dùng `application.description ?? 'Không có mô tả'`. Một bản ghi nạp từ `localStorage` hoặc seed có `description: ""` vẫn qua `validateApplication` (là chuỗi) và chi tiết sẽ hiện ô trống thay vì `Không có mô tả`. Luồng thêm/sửa thường không sinh ra trường hợp này vì repository bỏ mô tả rỗng, nên chỉ xảy ra với dữ liệu nạp thủ công/cũ. Đây là suy luận từ mã, chưa có test chứng minh | Dùng `application.description \|\| 'Không có mô tả'`, hoặc chuẩn hóa khi nạp. Có thể làm cùng Story 2.2 |
| V3 | Thấp | Lỗi biểu mẫu không tự xóa khi người dùng gõ lại, chỉ xóa sau khi lưu thành công hoặc chuyển màn hình (giống ghi nhận ở qa-1.3). Chưa quản lý focus khi đổi màn hình hoặc sau khi lưu lỗi (nằm ngoài phạm vi theo story) | Retrospective cân nhắc xóa lỗi từng trường theo `onChange`, và đặt focus vào trường lỗi đầu tiên |
| V4 | Thấp | Test chậm: 18 tệp mất ~165 giây, jsdom khởi tạo lại 18 lần (Vitest tự gợi ý `pool: 'vmThreads'`). Chưa xem thử giao diện bằng trình duyệt thật: QA chỉ đọc `App.css` (kiểu `.main-nav`, nút `aria-current` đậm + nền xanh nhạt) và không thể đánh giá hiển thị thực tế. Id max+1 có thể dùng lại id đã xóa (giả định số 7 của story, rủi ro cho 2.2 vì bản ghi cài đặt sẽ tham chiếu `appId`) | Thử `pool: 'vmThreads'` trong Retrospective. Xem nhanh `npm run dev` trước khi demo. Với id tái sử dụng: Story 2.2 phải chốt xóa kèm bản ghi cài đặt hay chặn xóa, hoặc dùng bộ đếm id tăng dần |

## Kiểm thử còn thiếu / khuyến nghị

- Chưa có test cho bản ghi nạp từ `localStorage` có `description: ""` (V2).
- Chưa có test e2e/trình duyệt thật; toàn bộ kiểm chứng giao diện qua jsdom + Testing Library (đúng phạm vi Epic 1 đã làm).
- Bảo mật cơ bản: dữ liệu nạp từ `localStorage` luôn đi qua `validateApplication`; không có `dangerouslySetInnerHTML`; React tự thoát chuỗi khi hiển thị; không thêm thư viện runtime. Không thấy vấn đề.

## Kết luận

Story 2.1 **đạt**. Cả 19 tiêu chí có bằng chứng bằng mã và test, QA chạy lại lint/build/229 test đều đạt trên Node 22.13.0, và không phá hành vi Epic 1. Story chuyển sang **Done**; `sprint-status.yaml` được cập nhật. Bàn giao cho **Scrum Master (Thiết Tướng)** để soạn Story 2.2. Điều kiện kèm theo: người điều phối commit đủ tệp V1 trước khi Dev nhận 2.2.
