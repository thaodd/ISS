# Story 2.1: Danh mục ứng dụng (thêm, sửa, xóa, xem) và lưu localStorage

- **Project:** ISS
- **Epic:** 2 – Quản lý và ghi nhận cài đặt ứng dụng
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Ready
- **Phụ thuộc:** Không phụ thuộc dữ liệu máy chủ. Chỉ dùng lại khung dự án và mẫu thiết kế (kiểm tra → repository → UI, lưu `localStorage`) của Story 1.1–1.3 (đều Done).
- **Là nền cho:** Story 2.2 (gán ứng dụng vào máy chủ, tham chiếu ứng dụng theo `id`).
- **Bàn giao cho:** Kiếm Thánh · Developer

## Câu chuyện

Là một **quản trị viên hạ tầng của ISS**, tôi muốn **quản lý một danh mục các ứng dụng (xem, thêm, sửa, xóa) và các thay đổi vẫn còn sau khi tải lại trang**, để **có sẵn danh sách ứng dụng chuẩn làm cơ sở ghi nhận ứng dụng nào đã được cài trên máy chủ nào ở các story sau**.

## Phạm vi

**Trong phạm vi:** kiểu dữ liệu `Application`; hàm kiểm tra hợp lệ; chuẩn hóa dữ liệu nhập và tự sinh `id`; repository `applicationRepository` (đọc + `create`/`update`/`remove`) lưu bằng `localStorage`; dữ liệu mẫu khởi tạo `applications.json`; thanh điều hướng chuyển giữa "Máy chủ" và "Ứng dụng"; danh sách, chi tiết, biểu mẫu thêm/sửa, xóa có xác nhận trong trang cho ứng dụng; thông báo kết quả; test.

**Ngoài phạm vi (để story sau):** gán/ghi nhận ứng dụng vào máy chủ, phiên bản, ngày cài, trạng thái cài đặt (2.2, 2.3); hiển thị ứng dụng trong chi tiết máy chủ (2.2); ràng buộc khi xóa ứng dụng đang được dùng (2.2); tìm kiếm/lọc/sắp xếp danh mục ứng dụng; cài đặt thật hoặc gọi backend/API; đồng bộ nhiều tab; hoàn tác sau khi xóa; định tuyến (`react-router`); quản lý focus bàn phím khi chuyển màn hình; sửa bất kỳ hành vi nào của Epic 1.

## Quyết định đã được người dùng xác nhận (lập sprint 2, 2026-11-15)

- "Cài đặt ứng dụng" của Epic 2 là **ghi nhận** thủ công, **không cài thật**, không backend.
- Dữ liệu lưu bằng **localStorage** như Epic 1; **không sửa** schema `Server`.
- Epic 2 gồm 3 story theo thứ tự 2.1 → 2.2 → 2.3; story này là danh mục ứng dụng.

## Giả định của Scrum Master (PM/Architect cần xác nhận, Dev cứ làm theo)

`epics.md`, `prd.md`, `architecture.md` vẫn là khung rỗng, nên các điểm sau là **giả định** của SM, đã được chốt thành tiêu chí để Dev làm ngay được:

1. Trường ứng dụng: `id`, `name` (bắt buộc), `vendor` – nhà cung cấp (bắt buộc), `description` (không bắt buộc).
2. `id` dạng `app-NNN` (số lớn nhất + 1, đệm 0 tới 3 chữ số), tự sinh, không đổi khi sửa.
3. **Tên ứng dụng không được trùng** (so sánh sau khi cắt khoảng trắng, không phân biệt hoa/thường).
4. Khóa `localStorage` riêng: `iss.apps.v1`; dữ liệu khởi tạo từ `src/data/applications.json` (3 ứng dụng mẫu).
5. Điều hướng bằng hai nút "Máy chủ"/"Ứng dụng" trong `App` (không router).
6. Xóa ứng dụng chưa phải lo ràng buộc với bản ghi cài đặt vì chưa tồn tại; 2.2 sẽ quyết định xóa kèm hay cảnh báo.
7. Giống Epic 1: `id` lấy max+1 nên xóa ứng dụng cuối có thể làm `id` đó được dùng lại. Đây là rủi ro đã biết cho 2.2 (bản ghi cài đặt tham chiếu `appId`), không xử lý ở story này.

## Tiêu chí nghiệm thu

1. **AC1 – Kiểu dữ liệu:** tạo `src/types/application.ts` xuất `interface Application { id: string; name: string; vendor: string; description?: string }`. Dùng tên `Application` (không dùng `App`, vì trùng tên component gốc). Không sửa `src/types/server.ts`.
2. **AC2 – Kiểm tra hợp lệ:** hàm thuần `validateApplication(data: unknown)` trong `src/domain/validateApplication.ts`, cùng dạng với `validateServer`: trả `{ valid: true; application }` hoặc `{ valid: false; errors: ApplicationFieldErrors }` (`ApplicationFieldErrors = Partial<Record<keyof Application, string>>`). Quy tắc và thông báo (nhận `unknown`, không ném lỗi với đầu vào bất kỳ):
   - không phải đối tượng thuần (`null`, mảng, kiểu nguyên thủy) → `errors.id = 'Bản ghi ứng dụng phải là một đối tượng.'`
   - `id` thiếu/rỗng/chỉ khoảng trắng → `'Thiếu mã ứng dụng (id).'`
   - `name` thiếu/rỗng/chỉ khoảng trắng → `'Thiếu tên ứng dụng (name).'`
   - `vendor` thiếu/rỗng/chỉ khoảng trắng → `'Thiếu nhà cung cấp (vendor).'`
   - `description` có mặt nhưng không phải chuỗi → `'Mô tả phải là chuỗi.'`
   - Nhiều trường sai thì báo đồng thời tất cả; trường lạ bị bỏ qua.
3. **AC3 – Chuẩn hóa và sinh id:** `src/domain/applicationInput.ts` xuất `ApplicationInput = Omit<Application, 'id'>`, hàm thuần `normalizeApplicationInput(input)` (cắt khoảng trắng đầu/cuối `name`, `vendor`, `description`; **bỏ** `description` nếu rỗng sau khi cắt; không đổi đối tượng đầu vào) và `generateApplicationId(existingIds: readonly string[]): string` trả `app-NNN` với NNN = số lớn nhất trong các id khớp mẫu `app-<số>` cộng 1, đệm 0 tới ít nhất 3 chữ số; id không khớp mẫu bị bỏ qua; danh sách rỗng → `app-001`; có khoảng trống (`app-001`, `app-007` → `app-008`); `app-999` → `app-1000`.
4. **AC4 – Repository có thao tác đọc/ghi:** `src/repositories/applicationRepository.ts` xuất interface `ApplicationRepository`:
   - `getAll(): Application[]` (trả **bản sao** mảng), `getById(id): Application | undefined`.
   - `create(input: ApplicationInput): ApplicationSaveResult` – chuẩn hóa → `validateApplication({ ...input, id })` → kiểm tra trùng tên (AC5) → thêm vào **cuối** danh sách.
   - `update(id, input): ApplicationSaveResult` – giữ nguyên `id` và vị trí; mọi `id` có trong `input` bị bỏ qua; `id` không tồn tại → `{ ok: false, errors: { id: 'Không tìm thấy ứng dụng.' } }`, không ném lỗi, không thêm bản ghi mới.
   - `remove(id): boolean` – `true` nếu đã xóa, `false` nếu `id` không tồn tại (không ném lỗi).
   - `ApplicationSaveResult = { ok: true; application: Application } | { ok: false; errors: ApplicationFieldErrors }`.
   - Dữ liệu không hợp lệ trả `{ ok: false, errors }` theo từng trường và **không làm thay đổi** bộ nhớ lẫn `localStorage`.
5. **AC5 – Tên không trùng:** `create`/`update` từ chối khi `name` (sau khi cắt, so sánh không phân biệt hoa/thường) trùng tên của ứng dụng **khác** đang có: `{ ok: false, errors: { name: 'Tên ứng dụng đã tồn tại.' } }`. Khi `update`, giữ nguyên hoặc chỉ đổi hoa/thường tên của chính ứng dụng đó **không** bị coi là trùng. Quy tắc trùng tên chỉ áp dụng lúc `create`/`update`; khi nạp dữ liệu (AC6) không loại bản ghi vì trùng tên.
6. **AC6 – Lưu bền bằng localStorage:** cùng quy tắc với AC4 của Story 1.3, đổi khóa thành `iss.apps.v1`:
   - Lần đầu (chưa có khóa) danh sách khởi tạo từ `applications.json`, qua bộ kiểm tra `validateApplication` (bỏ bản ghi hỏng/trùng `id` + `console.warn`).
   - Sau **mỗi** `create`/`update`/`remove` thành công, ghi toàn bộ danh sách vào khóa; thao tác thất bại thì không ghi.
   - Khóa đã có thì nạp từ `localStorage` (qua cùng bộ kiểm tra), **không** nạp lại `applications.json`. Khóa chứa `[]` nghĩa là danh sách rỗng thật, **không** nạp lại dữ liệu mẫu.
   - Giá trị khóa không phải JSON hợp lệ hoặc không phải mảng → `console.warn` và quay về dữ liệu khởi tạo, không sập.
   - `localStorage` không truy cập được hoặc ghi lỗi → ứng dụng vẫn chạy với dữ liệu trong bộ nhớ, `console.warn`, không ném lỗi ra UI.
   - Hàm `createApplicationRepository(seedRecords, storage?)` (storage có kiểu `Pick<Storage, 'getItem' | 'setItem'>`) để test truyền kho giả; thể hiện `applicationRepository` dùng `window.localStorage`. Xuất hằng `APPLICATIONS_STORAGE_KEY = 'iss.apps.v1'`.
7. **AC7 – Dữ liệu mẫu:** `src/data/applications.json` gồm đúng 3 ứng dụng hợp lệ: `app-001` "Nginx" / "F5", `app-002` "PostgreSQL" / "PostgreSQL Global Development Group" (có mô tả), `app-003` "Jenkins" / "Jenkins Project". Máy mới thêm ứng dụng đầu tiên nhận `id` `app-004`.
8. **AC8 – Điều hướng:** `App` có `<nav aria-label="Điều hướng chính">` chứa hai nút `type="button"` **"Máy chủ"** và **"Ứng dụng"**; nút của mục đang mở có `aria-current="page"`. Mặc định mở "Máy chủ" và toàn bộ giao diện/hành vi Epic 1 giữ nguyên (tiêu đề `ISS – Quản lý máy chủ`, dòng `Đã tải N máy chủ`, mọi nhãn/nút). Bấm "Ứng dụng" hiện tiêu đề `ISS – Quản lý ứng dụng`, dòng `Đã tải N ứng dụng` và **danh sách ứng dụng**; bấm "Máy chủ" quay về **danh sách máy chủ** (bộ lọc máy chủ đang chọn được giữ nguyên). Chuyển mục xóa thông báo `role="status"` và lỗi biểu mẫu đang có. Chỉ hiển thị dòng "Đã tải…" của mục đang mở.
9. **AC9 – Danh sách ứng dụng:** vùng `aria-label="Danh sách ứng dụng"` có nút **"Thêm ứng dụng"** (luôn hiển thị, kể cả khi danh sách rỗng), dòng `Có N ứng dụng`, và bảng với cột **Tên** (nút `link-button`, bấm mở chi tiết), **Nhà cung cấp**, **Mô tả** (hiển thị nguyên văn, ô trống nếu không có) theo thứ tự trong repository. Danh sách rỗng hiện `Chưa có ứng dụng nào` thay cho bảng.
10. **AC10 – Chi tiết ứng dụng:** vùng `aria-label="Chi tiết ứng dụng"` có nút **"Quay lại danh sách ứng dụng"**; khi tìm thấy hiện tiêu đề `h2` là tên, nút **"Sửa"** và **"Xóa"**, và danh sách định nghĩa gồm Tên, ID, Nhà cung cấp, Mô tả (`Không có mô tả` nếu chưa có). Khi `id` không tồn tại hiện `Không tìm thấy ứng dụng` và **không** có nút Sửa/Xóa.
11. **AC11 – Thêm ứng dụng:** bấm "Thêm ứng dụng" mở biểu mẫu `<form>` tiêu đề "Thêm ứng dụng" với các trường có `<label>`: **Tên**, **Nhà cung cấp**, **Mô tả** (ô nhiều dòng, không bắt buộc), mặc định đều trống. Nút **"Lưu"** (`type="submit"`; Enter trong ô nhập cũng lưu) và **"Hủy"** (`type="button"`). Lưu hợp lệ thì tạo ứng dụng (`id` theo AC3), chuyển sang chi tiết của ứng dụng vừa tạo với đúng dữ liệu đã nhập, và nó có trong danh sách.
12. **AC12 – Sửa ứng dụng:** nút "Sửa" mở cùng biểu mẫu tiêu đề "Sửa ứng dụng", điền sẵn dữ liệu hiện tại (mô tả trống nếu chưa có); `id` chỉ **hiển thị chữ** (`ID: app-00X`), không phải ô nhập. Lưu hợp lệ thì cập nhật, quay về chi tiết với dữ liệu mới; `id` và vị trí trong danh sách không đổi. Xóa hết nội dung Mô tả rồi lưu → chi tiết hiện `Không có mô tả`.
13. **AC13 – Báo lỗi theo từng trường:** lưu dữ liệu sai (thiếu tên, thiếu nhà cung cấp, tên trùng…) thì biểu mẫu **ở nguyên màn hình**, **giữ nguyên mọi giá trị đã nhập**, hiện thông báo lỗi ngay cạnh từng trường sai (thông báo lấy nguyên từ repository/`validateApplication`), đặt `aria-invalid="true"` và `aria-describedby` trỏ tới thông báo; nhiều trường sai thì hiện đồng thời. Sửa lại rồi lưu thành công thì lỗi biến mất. `errors.id` (sửa ứng dụng không còn tồn tại) hiện bằng `role="alert"` ở đầu biểu mẫu như `ServerForm`; nếu ứng dụng đã biến mất lúc đang ở màn hình sửa thì `App` hiện chi tiết "Không tìm thấy ứng dụng".
14. **AC14 – Hủy:** "Hủy" ở biểu mẫu thêm quay về **danh sách ứng dụng**; ở biểu mẫu sửa quay về **chi tiết** ứng dụng đó; dữ liệu không đổi.
15. **AC15 – Xóa có xác nhận:** bấm "Xóa" ở chi tiết không xóa ngay mà hiện vùng xác nhận trong trang (`role="alertdialog"`, `aria-label="Xác nhận xóa"`) với nội dung `Xóa ứng dụng "<tên>"? Thao tác này không thể hoàn tác.` cùng hai nút **"Xác nhận xóa"** và **"Hủy"**. "Hủy" đóng vùng xác nhận, ứng dụng còn nguyên. "Xác nhận xóa" gọi `remove`, quay về danh sách ứng dụng, ứng dụng không còn trong danh sách lẫn `localStorage`. Không dùng `window.confirm`/`alert`/`prompt`.
16. **AC16 – Thông báo và làm mới:** sau thao tác thành công hiện trong vùng `role="status"` đúng một trong: `Đã thêm ứng dụng "<tên>"`, `Đã cập nhật ứng dụng "<tên>"`, `Đã xóa ứng dụng "<tên>"`. Thông báo biến mất khi chuyển màn hình hoặc chuyển mục. Dòng `Đã tải N ứng dụng` **cập nhật ngay** theo dữ liệu mới. Xóa hết ứng dụng thì danh sách hiện `Chưa có ứng dụng nào` cùng nút "Thêm ứng dụng".
17. **AC17 – Bền qua lần tải lại:** thêm/sửa/xóa xong, tạo lại repository (và render lại `App`) trên cùng `localStorage` thì dữ liệu đúng như trước khi "tải lại", kể cả khi đã xóa hết ứng dụng (không nạp lại dữ liệu mẫu).
18. **AC18 – Kiến trúc, quy ước, khả năng truy cập, không phá Epic 1:** UI không import `applications.json` và không gọi trực tiếp `localStorage`; chỉ repository đọc/ghi `localStorage`; chỉ `App` gọi repository, component trình bày nhận dữ liệu và callback qua props. `App` nhận thêm prop tùy chọn `applicationRepository?: ApplicationRepository` (mặc định `applicationRepository`), giữ nguyên prop `repository?` của máy chủ. TypeScript `strict`, không `any`, không thêm thư viện runtime. Mỗi ô nhập có `<label>` gắn đúng; dùng `<form>` thật; test truy vấn được theo role/label. **Không sửa** mã Epic 1 ngoài `App.tsx` (và `App.css`); toàn bộ test hiện có (136 test) vẫn đạt, không xóa test hay hạ kỳ vọng.
19. **AC19 – Test và chất lượng:** `npm run lint`, `npm run build`, `npm test` đều đạt bằng Node ≥ 20.19. Có test mới cho từng nhóm ở T1–T7.

## Nhiệm vụ / việc con

- [ ] **T1 – Kiểu, kiểm tra hợp lệ, dữ liệu nhập (AC1, AC2, AC3, AC7, AC18)**
  - [ ] Tạo `src/types/application.ts` (`Application`).
  - [ ] Tạo `src/domain/validateApplication.ts` (`validateApplication`, `ApplicationFieldErrors`, `ApplicationValidationResult`) và `validateApplication.test.ts`: hợp lệ tối thiểu, có mô tả, từng trường thiếu/rỗng/chỉ khoảng trắng, `description` sai kiểu, đầu vào không phải đối tượng (`null`, mảng, chuỗi, số), nhiều lỗi cùng lúc, trường lạ bị bỏ.
  - [ ] Tạo `src/domain/applicationInput.ts` (`ApplicationInput`, `normalizeApplicationInput`, `generateApplicationId`) và `applicationInput.test.ts`: chuẩn hóa từng trường, mô tả toàn khoảng trắng bị bỏ, không đổi đầu vào; sinh id: rỗng, liên tiếp, khoảng trống, id lạ bị bỏ qua, `app-999` → `app-1000`.
  - [ ] Tạo `src/data/applications.json` đúng AC7 (kiểm tra bằng test repository mục T2 rằng cả 3 bản ghi đều hợp lệ).
- [ ] **T2 – Repository (AC4, AC5, AC6, AC7)**
  - [ ] Tạo `src/repositories/applicationRepository.ts` theo mẫu `serverRepository.ts` (`createApplicationRepository(seed, storage?)`, `ApplicationSaveResult`, `APPLICATIONS_STORAGE_KEY`, chế độ chỉ-bộ-nhớ khi không có `localStorage`), thêm kiểm tra trùng tên (AC5). Không import/ sửa `serverRepository.ts`.
  - [ ] Tạo `applicationRepository.test.ts` với kho giả `createMemoryStorage` (`src/test/memoryStorage.ts`, có sẵn): đọc (`getAll` là bản sao, `getById`), nạp dữ liệu mẫu hợp lệ (3 bản ghi), `create` (id, vị trí cuối, dữ liệu sai không đổi gì, tên trùng kể cả khác hoa/thường/khoảng trắng), `update` (giữ id/vị trí, tên chính mình không bị coi trùng, tên trùng ứng dụng khác bị từ chối, id lạ), `remove` có/không tồn tại; lưu bền: chưa có khóa, có khóa, `[]`, bản ghi hỏng/trùng id (có `console.warn`), JSON hỏng, không phải mảng, `getItem`/`setItem` ném lỗi, "tải lại" bằng repository thứ hai, xóa hết rồi tải lại.
- [ ] **T3 – Biểu mẫu `ApplicationForm` (AC11, AC12, AC13, AC14, AC18)**
  - [ ] Tạo `src/components/ApplicationForm.tsx` (thuần trình bày, mẫu theo `ServerForm.tsx`): props `mode: 'create' | 'edit'`, `initialValues?: Application`, `errors: ApplicationFieldErrors`, `onSubmit(input: ApplicationInput)`, `onCancel()`; state cục bộ giữ giá trị; không tự kiểm tra hợp lệ; `id` ở chế độ sửa chỉ là chữ; lỗi theo trường với `aria-invalid`/`aria-describedby`; `id` các ô dùng tiền tố `application-form-` (tránh trùng `server-form-`).
  - [ ] Tạo `ApplicationForm.test.tsx`: mặc định trống khi thêm; điền sẵn khi sửa và `id` không phải ô nhập; submit gọi `onSubmit` đúng dữ liệu (mô tả trống gửi `''`, chuẩn hóa là việc của repository); lỗi từng trường kèm `aria-invalid`/`aria-describedby`; giữ giá trị khi có lỗi; `errors.id` hiện `role="alert"`; "Hủy" gọi `onCancel`; Enter (submit form) lưu được.
- [ ] **T4 – `ApplicationList` và `ApplicationDetail` (AC9, AC10, AC15, AC18)**
  - [ ] Tạo `src/components/ApplicationList.tsx` (props `applications`, `onSelect`, `onCreate`) và `.test.tsx`: nút "Thêm ứng dụng" kể cả khi rỗng, `Chưa có ứng dụng nào`, dòng `Có N ứng dụng`, các cột, bấm tên gọi `onSelect(id)`, mô tả trống không làm vỡ bảng.
  - [ ] Tạo `src/components/ApplicationDetail.tsx` (props `application | undefined`, `onBack`, `onEdit`, `onDelete`; vùng xác nhận xóa dùng state cục bộ như `ServerDetail`) và `.test.tsx`: hiển thị đủ trường, `Không có mô tả`, `Không tìm thấy ứng dụng` không có Sửa/Xóa, bấm "Xóa" hiện đúng nội dung xác nhận, "Hủy" không gọi `onDelete`, "Xác nhận xóa" gọi đúng một lần, `onEdit`/`onBack` được gọi.
- [ ] **T5 – Ghép trong `App` và điều hướng (AC8, AC11–AC16, AC18)**
  - [ ] Sửa `src/App.tsx`: thêm trạng thái mục đang mở (`servers` | `applications`) và `<nav>` theo AC8; thêm các màn hình ứng dụng (danh sách/chi tiết/thêm/sửa) bằng `useState` (không router) — có thể mở rộng `Screen` hoặc tách thành hai nhánh/hai component trang, chọn cách ít đổi hành vi Epic 1 nhất; giữ `filters` máy chủ ở `App`; danh sách ứng dụng lưu trong state và đọc lại từ repository sau mỗi thao tác ghi.
  - [ ] Thêm prop `applicationRepository?`; gọi `create`/`update`/`remove`, truyền `errors` xuống `ApplicationForm`, đặt thông báo `role="status"` theo AC16, xóa thông báo/lỗi khi chuyển màn hình hoặc chuyển mục. Chỉ hiện dòng "Đã tải…" và tiêu đề `h1` của mục đang mở.
  - [ ] Sửa tùy chọn `src/App.css`: style thanh điều hướng (nút đang chọn), tái sử dụng class có sẵn (`form-field`, `field-error`, `form-actions`, `detail-actions`, `confirm-delete`, `link-button`).
- [ ] **T6 – Test luồng `App` (AC8, AC11–AC17, AC19)**
  - [ ] Tạo `src/App.applications.test.tsx` (không mock module; mỗi test tạo repository ứng dụng mới trên kho giả riêng và truyền qua prop `applicationRepository`; repository máy chủ cũng truyền kho giả riêng để không đụng `localStorage` thật): điều hướng sang "Ứng dụng" và quay lại "Máy chủ" (bộ lọc máy chủ được giữ, `aria-current`); thêm hợp lệ → chi tiết + thông báo + `Đã tải 4 ứng dụng` + id `app-004`; thêm thiếu tên/nhà cung cấp → lỗi từng trường, giữ giá trị, không đổi "Đã tải N"; thêm tên trùng (khác hoa/thường) → lỗi tên; sửa hợp lệ, sửa giữ nguyên tên, sửa xóa mô tả; hủy khi thêm/sửa; xóa có xác nhận (hủy rồi xác nhận); xóa hết → `Chưa có ứng dụng nào` + nút "Thêm ứng dụng"; "tải lại" (render `App` mới với repository mới trên cùng kho) thấy dữ liệu đã đổi, kể cả khi đã xóa hết; chuyển mục xóa thông báo.
  - [ ] Chạy lại và giữ cho đạt toàn bộ test Epic 1, đặc biệt `App.test.tsx` (mock module `serverRepository`), `App.integration.test.tsx`, `App.crud.test.tsx`. Chỉ sửa tối thiểu nếu bắt buộc, ghi rõ lý do trong Dev Agent Record.
- [ ] **T7 – Hoàn tất (AC19)**
  - [ ] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt bằng Node ≥ 20.19.
  - [ ] Ghi kết quả và bằng chứng theo từng AC vào mục Dev Agent Record, đổi trạng thái story sang `Review` và cập nhật `sprint-status.yaml`.

## Ghi chú cho Dev

### Căn cứ

- Tài liệu thật nằm ở `docs/bmad-office/` (không có `docs/epics.md`, `docs/architecture.md`, `docs/stories/`). `epics.md`/`architecture.md` là khung rỗng nên kiến trúc dưới đây **rút ra từ mã thật của Story 1.1–1.3**; mẫu để bám là các tệp `server*` tương ứng. Nếu PM/Architect cập nhật tài liệu mâu thuẫn với story này, báo lại Scrum Master, đừng tự đổi hướng.
- Dữ liệu đọc từ `localStorage` là **dữ liệu không tin cậy**: luôn đi qua `validateApplication`; không dùng `dangerouslySetInnerHTML`.

### Tệp cần tạo / sửa

| Tệp | Hành động |
|---|---|
| `src/types/application.ts` | Tạo |
| `src/domain/validateApplication.ts` (+ `.test.ts`) | Tạo |
| `src/domain/applicationInput.ts` (+ `.test.ts`) | Tạo |
| `src/data/applications.json` | Tạo (3 ứng dụng mẫu, AC7) |
| `src/repositories/applicationRepository.ts` (+ `.test.ts`) | Tạo |
| `src/components/ApplicationForm.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ApplicationList.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ApplicationDetail.tsx` (+ `.test.tsx`) | Tạo |
| `src/App.tsx` | Sửa: điều hướng, màn hình ứng dụng, prop `applicationRepository` |
| `src/App.applications.test.tsx` | Tạo (luồng đầy đủ, không mock module) |
| `src/App.css` | Sửa tùy chọn: style thanh điều hướng |

**Không sửa:** `types/server.ts`, `validateServer.ts`, `serverInput.ts`, `serverLabels.ts`, `filterServers.ts`, `serverRepository.ts`, `servers.json`, các component `Server*`, `test/memoryStorage.ts` (dùng nguyên). Nếu thấy buộc phải sửa, báo lại Scrum Master. Không sửa `docs/` ngoài mục Dev Agent Record của tệp này và `sprint-status.yaml` khi đổi trạng thái.

### Quy ước (từ kiến trúc Epic 1)

- TypeScript `strict`; cấm `any` (ESLint `no-explicit-any: error`); dùng `unknown` ở ranh giới dữ liệu (đọc `localStorage`, `validateApplication`).
- Phân lớp `types` → `domain` (hàm thuần) → `repositories` (**nơi duy nhất chạm `localStorage`**) → UI. `domain/` thuần, không đụng `localStorage`/React.
- Component trình bày nhận dữ liệu và callback qua props; chỉ `App` gọi repository.
- Test đặt cạnh mã nguồn, tên `*.test.ts(x)`; Vitest + Testing Library + `@testing-library/jest-dom` (cấu hình ở `src/test/setup.ts`); ưu tiên truy vấn theo role/label; dùng `fireEvent` (không thêm `user-event`).
- Nhãn giao diện bằng tiếng Việt; tên mã (biến, hàm, kiểu) bằng tiếng Anh.
- ESLint `react-refresh`: mỗi tệp component chỉ xuất component; hằng/hàm dùng chung đặt ở `domain/`.
- Không thêm router, state manager, UI kit, thư viện form/uuid. Chỉ dùng React hooks.

### Gợi ý kỹ thuật

- Chấp nhận lặp nhẹ giữa mã máy chủ và mã ứng dụng (nạp/ghi `localStorage`, biểu mẫu); **đừng** tổng quát hóa hay sửa mã Epic 1 trong story này. Nếu thấy cần trừu tượng hóa chung, ghi đề xuất vào Dev Agent Record để Retrospective xem xét.
- `serverRepository` và `applicationRepository` đều là singleton tạo lúc import: các test ghi dữ liệu **không** được dùng `localStorage` thật của jsdom; truyền repository riêng qua prop (`repository`, `applicationRepository`) với kho giả.
- `App.test.tsx` mock module `serverRepository` chỉ với `getAll`/`getById`. Test này không mock `applicationRepository`, nên singleton ứng dụng sẽ đọc `localStorage` jsdom; không sao miễn là các test cũ không bấm sang mục "Ứng dụng".
- Kiểm tra trùng tên đặt trong repository (nơi có danh sách đầy đủ), không đặt trong `validateApplication` (hàm kiểm tra một bản ghi). So sánh: `name.trim().toLocaleLowerCase()`.
- `update` giữ vị trí nếu dùng `Map` và `set` lên khóa đã có (như `serverRepository`).
- Chuẩn hóa/kiểm tra chạy ở repository (một nguồn sự thật); `ApplicationForm` chỉ hiện `errors` nhận từ `App`. Khi chuyển màn hình, đặt lại `errors`.
- Mỗi tệp test mới khởi tạo jsdom riêng làm test chậm (~6 giây/tệp); gom test theo tệp hợp lý, không tách quá nhỏ.

### Lưu ý môi trường và repo

- Máy mặc định dùng Node 10 (quá cũ). Dùng Node **≥ 20.19** (ví dụ v22.13.0 trong nvm) cho từng lệnh.
- **Nợ V1 của sprint 1 vẫn còn:** các tệp cấu hình/types/data của 1.1 (`.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/`, `src/main.tsx`, `src/test/setup.ts`, `src/types/`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`) và `src/App.css` đang chưa được commit. Không xóa/ghi đè; người điều phối cần commit đủ trước/khi bàn giao story này.

### Lệnh

```
npm install
npm run dev      # xem thử: chuyển sang "Ứng dụng", thêm/sửa/xóa; tải lại trang thấy dữ liệu còn
npm run lint
npm run build
npm test         # vitest run
```

Khi xem thử bằng `npm run dev`, muốn quay về dữ liệu mẫu thì xóa khóa `iss.apps.v1` trong DevTools → Application → Local Storage.

### Definition of Done

Mọi ô nhiệm vụ đã đánh dấu; `lint`, `build`, `test` đều đạt; AC1–AC19 có bằng chứng trong Dev Agent Record; sau đó chuyển story sang `review` để QA (Linh Y Tiên Tử) kiểm thử.

## Dev Agent Record

## QA Results
