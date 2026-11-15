# Story 1.3: Thêm, sửa, xóa máy chủ và lưu dữ liệu vào localStorage

- **Project:** ISS
- **Epic:** 1 – Quản lý thông tin máy chủ
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Ready
- **Phụ thuộc:** Story 1.1 (Done) và Story 1.2 (Done) – dùng lại `Server`, `validateServer`, `serverRepository`, `ServerList`, `ServerDetail`, `App`
- **Bàn giao cho:** Kiếm Thánh · Developer

## Câu chuyện

Là một **quản trị viên hạ tầng của ISS**, tôi muốn **thêm máy chủ mới, sửa thông tin và xóa máy chủ không còn dùng, và các thay đổi vẫn còn sau khi tải lại trang**, để **danh sách máy chủ phản ánh đúng hạ tầng thực tế mà không phải sửa tay file dữ liệu**.

## Phạm vi

**Trong phạm vi:** thao tác ghi `create` / `update` / `remove` trong repository; tự sinh `id`; lưu và nạp dữ liệu bằng `localStorage` (file `servers.json` chỉ là dữ liệu khởi tạo lần đầu); biểu mẫu thêm/sửa có kiểm tra hợp lệ và báo lỗi theo từng trường; xóa có bước xác nhận ngay trong trang; thông báo kết quả; test.

**Ngoài phạm vi (để story sau):** ghi ngược xuống file JSON hoặc gọi backend/API; đồng bộ nhiều tab; hoàn tác sau khi xóa; kiểm tra trùng `hostname`/`ipAddress`; nhập/xuất dữ liệu; phân quyền; quản lý focus bàn phím khi chuyển màn hình (V3 của `qa-1.2.md`); định tuyến (`react-router`); ứng dụng cài đặt (Epic 2).

## Quyết định đã được người dùng xác nhận

- Lưu dữ liệu ghi bằng **localStorage**.
- Phạm vi gồm **Thêm + Sửa + Xóa** trong cùng một story.
- `id` **tự sinh**, người dùng không nhập; `id` không đổi khi sửa.
- Xóa có **xác nhận ngay trong trang** (không dùng `window.confirm`).

## Tiêu chí nghiệm thu

1. **AC1 – Repository có thao tác ghi:** `ServerRepository` bổ sung ba phương thức, giữ nguyên `getAll()` và `getById()`:
   - `create(input: ServerInput): SaveResult` – thêm máy chủ mới vào **cuối** danh sách.
   - `update(id: string, input: ServerInput): SaveResult` – thay thông tin của máy chủ có `id` đó, giữ nguyên `id` và vị trí trong danh sách; `id` không tồn tại thì trả `{ ok: false, errors: { id: 'Không tìm thấy máy chủ.' } }`, không ném lỗi và không thêm bản ghi mới.
   - `remove(id: string): boolean` – xóa máy chủ, trả `true` nếu đã xóa, `false` nếu `id` không tồn tại (không ném lỗi).
   - Kiểu: `ServerInput = Omit<Server, 'id'>`; `SaveResult = { ok: true; server: Server } | { ok: false; errors: ServerFieldErrors }`. `getAll()` vẫn trả bản sao mảng.
2. **AC2 – Tự sinh id:** hàm thuần `generateServerId(existingIds: readonly string[]): string` trả `srv-NNN` (ít nhất 3 chữ số, đệm số 0) với NNN = **số lớn nhất** trong các id khớp mẫu `srv-<số>` cộng 1; id không khớp mẫu bị bỏ qua khi tính; danh sách rỗng trả `srv-001`. Id sinh ra không bao giờ trùng id đang tồn tại. Với dữ liệu mẫu (`srv-001`…`srv-003`) máy chủ mới đầu tiên có id `srv-004`.
3. **AC3 – Chuẩn hóa và kiểm tra hợp lệ trước khi ghi:** hàm thuần `normalizeServerInput` cắt khoảng trắng đầu/cuối của mọi trường chuỗi và **bỏ trường `description` nếu rỗng sau khi cắt**. `create`/`update` luôn chuẩn hóa rồi kiểm tra bằng `validateServer` (dùng lại, không viết bộ kiểm tra thứ hai). Dữ liệu không hợp lệ (thiếu tên/hostname/os, IPv4 sai, `status`/`environment` ngoài danh sách…) trả `{ ok: false, errors }` theo từng trường và **không làm thay đổi** dữ liệu trong bộ nhớ lẫn `localStorage`.
4. **AC4 – Lưu bền bằng localStorage:**
   - Khóa lưu là `iss.servers.v1`, giá trị là mảng JSON các `Server`.
   - Lần đầu (chưa có khóa) danh sách khởi tạo từ `servers.json` qua đúng quy trình kiểm tra hiện có của 1.1 (bỏ bản ghi hỏng/trùng id + `console.warn`).
   - Sau **mỗi** `create`/`update`/`remove` thành công, toàn bộ danh sách được ghi lại vào khóa trên.
   - Khi tạo repository mà khóa đã có, dữ liệu được nạp từ `localStorage` (qua cùng bộ kiểm tra: bản ghi hỏng/trùng id bị loại + `console.warn`), **không** nạp lại `servers.json`.
   - Khóa tồn tại với mảng rỗng `[]` nghĩa là danh sách rỗng thật (đã xóa hết), **không** được nạp lại dữ liệu mẫu.
   - Giá trị trong khóa không phải JSON hợp lệ hoặc không phải mảng → `console.warn` và quay về dữ liệu khởi tạo từ `servers.json`, không sập ứng dụng.
   - `localStorage` không dùng được (truy cập ném lỗi) hoặc ghi lỗi (đầy bộ nhớ) → ứng dụng vẫn chạy với dữ liệu trong bộ nhớ, ghi `console.warn`, không ném lỗi ra UI.
5. **AC5 – Thêm máy chủ:** danh sách có nút **"Thêm máy chủ"** (hiển thị cả khi danh sách rỗng và khi lọc không ra kết quả). Bấm mở biểu mẫu tiêu đề "Thêm máy chủ" với các trường có `<label>`: Tên, Hostname, Địa chỉ IP, Hệ điều hành, Môi trường (ô chọn), Trạng thái (ô chọn), Mô tả (ô nhiều dòng, không bắt buộc). Giá trị mặc định: Tên/Hostname/IP/Hệ điều hành/Mô tả để trống, Môi trường = "Development", Trạng thái = "Đang hoạt động". Ô chọn dùng nhãn tiếng Việt của `STATUS_LABELS`/`ENVIRONMENT_LABELS` và **không** có lựa chọn "Tất cả". Bấm **"Lưu"** với dữ liệu hợp lệ thì tạo máy chủ (id tự sinh theo AC2), chuyển sang màn hình chi tiết của máy chủ vừa tạo, thấy đúng dữ liệu đã nhập và máy chủ có trong danh sách.
6. **AC6 – Sửa máy chủ:** màn hình chi tiết có nút **"Sửa"** (chỉ khi tìm thấy máy chủ). Bấm mở cùng biểu mẫu, tiêu đề "Sửa máy chủ", điền sẵn dữ liệu hiện tại (mô tả trống nếu chưa có); `id` chỉ **hiển thị, không cho sửa**. Lưu hợp lệ thì cập nhật, quay về chi tiết với dữ liệu mới, `id` và vị trí trong danh sách không đổi. Xóa hết nội dung Mô tả rồi lưu thì máy chủ không còn mô tả (chi tiết hiện "Không có mô tả").
7. **AC7 – Báo lỗi theo từng trường:** khi lưu mà dữ liệu không hợp lệ, biểu mẫu **ở nguyên màn hình**, **giữ nguyên mọi giá trị đã nhập**, hiện thông báo lỗi ngay cạnh từng trường sai (dùng thông báo tiếng Việt từ `validateServer`), đặt `aria-invalid="true"` và liên kết bằng `aria-describedby` cho trường sai. Nhiều trường sai thì hiện đồng thời tất cả. Sửa lại và lưu thành công thì lỗi biến mất. Không có thao tác ghi nào xảy ra khi còn lỗi.
8. **AC8 – Hủy:** biểu mẫu có nút **"Hủy"**: từ "Thêm máy chủ" quay về **danh sách**, từ "Sửa máy chủ" quay về **chi tiết** của máy chủ đó; dữ liệu không thay đổi. Quay về danh sách giữ nguyên tìm kiếm/bộ lọc đang chọn (kế thừa AC7 của 1.2).
9. **AC9 – Xóa có xác nhận:** màn hình chi tiết có nút **"Xóa"** (chỉ khi tìm thấy máy chủ). Bấm không xóa ngay mà hiện vùng xác nhận trong trang với nội dung `Xóa máy chủ "<tên>"? Thao tác này không thể hoàn tác.` cùng hai nút **"Xác nhận xóa"** và **"Hủy"**. "Hủy" đóng vùng xác nhận, máy chủ còn nguyên. "Xác nhận xóa" gọi `remove`, quay về danh sách (giữ bộ lọc) và máy chủ không còn trong danh sách lẫn trong `localStorage`. Không dùng `window.confirm`/`alert`/`prompt`.
10. **AC10 – Thông báo và làm mới:** sau thao tác thành công hiện thông báo trong vùng `role="status"`: `Đã thêm máy chủ "<tên>"`, `Đã cập nhật máy chủ "<tên>"`, `Đã xóa máy chủ "<tên>"`. Thông báo biến mất khi người dùng chuyển sang màn hình khác. Dòng "Đã tải N máy chủ" và "Hiển thị X / N máy chủ" **cập nhật ngay** theo dữ liệu mới mà không cần tải lại trang. Máy chủ mới thêm có thể không hiện trong bảng nếu không khớp bộ lọc đang chọn; đó là hành vi chấp nhận được vì "Hiển thị X / N" vẫn đúng.
11. **AC11 – Bền qua lần tải lại:** thêm/sửa/xóa xong, tạo lại ứng dụng/repository trên cùng `localStorage` (mô phỏng tải lại trang) thì dữ liệu đúng như trước khi tải lại, kể cả trường hợp đã xóa hết máy chủ.
12. **AC12 – Kiến trúc, quy ước, khả năng truy cập:** UI không import `servers.json` và không gọi trực tiếp `localStorage`; chỉ `repository` đọc/ghi `localStorage`, chỉ `App` gọi repository, component trình bày nhận dữ liệu và callback qua props. TypeScript `strict`, không `any`, không thêm thư viện runtime (không thư viện form/validation/uuid). Mỗi ô nhập/chọn có `<label>` gắn đúng, dùng `<form>` thật với nút "Lưu" là `type="submit"` (nhấn Enter trong ô nhập cũng lưu), các nút khác là `type="button"`; test truy vấn được theo role/label.
13. **AC13 – Test và chất lượng:** `npm test`, `npm run lint`, `npm run build` đều đạt. Toàn bộ test của 1.1 và 1.2 vẫn đạt (được phép sửa tối thiểu phần mock/dữ liệu nếu `App` hoặc repository đổi chữ ký, nhưng không xóa test hay hạ kỳ vọng). Có test mới cho từng nhóm ở T1–T7 bên dưới.

## Nhiệm vụ / việc con

- [ ] **T1 – Kiểu và hàm thuần cho dữ liệu nhập (AC2, AC3, AC12)**
  - [ ] Tạo `src/domain/serverInput.ts`: kiểu `ServerInput`, hàm `normalizeServerInput(input)` (cắt khoảng trắng, bỏ `description` rỗng, không đổi đối tượng đầu vào), hàm `generateServerId(existingIds)`.
  - [ ] Test `serverInput.test.ts`: chuẩn hóa từng trường; mô tả toàn khoảng trắng bị bỏ; không đổi đầu vào; `generateServerId` với danh sách rỗng, liên tiếp, có khoảng trống (`srv-001`, `srv-007` → `srv-008`), id lạ không khớp mẫu bị bỏ qua, quá 3 chữ số (`srv-999` → `srv-1000`).
- [ ] **T2 – Repository ghi dữ liệu (AC1, AC3, AC4)**
  - [ ] Sửa `src/repositories/serverRepository.ts`: mở rộng interface `ServerRepository` với `create`, `update`, `remove`; xuất kiểu `SaveResult`. Giữ hành vi `getAll`/`getById` cũ và các cảnh báo `console.warn` của 1.1.
  - [ ] `create`/`update` gọi `normalizeServerInput` rồi `validateServer({ ...input, id })`; `create` dùng `generateServerId`; `update` bỏ qua mọi `id` có trong `input`, dùng `id` truyền vào.
  - [ ] Test: tạo thành công (id, vị trí cuối), dữ liệu sai không đổi dữ liệu, `update` giữ id/vị trí, `update` id lạ, `remove` có/không tồn tại, `getAll` vẫn trả bản sao.
- [ ] **T3 – Lưu bền bằng localStorage (AC4, AC11)**
  - [ ] Cho phép repository nhận nguồn lưu trữ qua tham số (ví dụ `createServerRepository(seed, storage)` với `storage` có kiểu giao diện `Pick<Storage, 'getItem' | 'setItem'>`), để test truyền kho giả; thể hiện `serverRepository` dùng `window.localStorage` và khóa `iss.servers.v1`. Khi `window.localStorage` không truy cập được thì dùng chế độ chỉ-bộ-nhớ.
  - [ ] Cài đặt đủ các quy tắc nạp/ghi ở AC4 (khóa chưa có, khóa có, `[]`, JSON hỏng, không phải mảng, bản ghi hỏng/trùng id trong kho, `getItem`/`setItem` ném lỗi).
  - [ ] Test với kho giả trong bộ nhớ (không phụ thuộc thứ tự test): từng quy tắc ở AC4 và kịch bản "tải lại" (tạo repository thứ hai trên cùng kho) của AC11.
- [ ] **T4 – Biểu mẫu `ServerForm` (AC5, AC6, AC7, AC8, AC12)**
  - [ ] Tạo `src/components/ServerForm.tsx` (thuần trình bày): props gồm `mode: 'create' | 'edit'`, `initialValues?: Server`, `errors: ServerFieldErrors`, `onSubmit(input: ServerInput)`, `onCancel()`. Giữ giá trị đang nhập bằng state cục bộ; không tự kiểm tra hợp lệ, chỉ hiển thị `errors` nhận từ ngoài.
  - [ ] Tạo biểu mẫu `<form>`, các trường và nhãn theo AC5; `id` ở chế độ sửa chỉ hiển thị chữ; lỗi theo trường với `aria-invalid`/`aria-describedby`.
  - [ ] Test `ServerForm.test.tsx`: giá trị mặc định khi thêm; điền sẵn khi sửa và `id` không phải ô nhập; submit gọi `onSubmit` với đúng dữ liệu (trường mô tả trống vẫn gửi chuỗi rỗng được, việc chuẩn hóa là của repository); hiển thị lỗi từng trường kèm `aria-invalid`; giữ nguyên giá trị khi có lỗi; "Hủy" gọi `onCancel`; không có lựa chọn "Tất cả" trong ô chọn.
- [ ] **T5 – Cập nhật `ServerList` và `ServerDetail` (AC5, AC6, AC9)**
  - [ ] `ServerList`: thêm prop `onCreate()` và nút "Thêm máy chủ" luôn hiển thị (cả khi `servers` rỗng và khi không có kết quả lọc).
  - [ ] `ServerDetail`: thêm props `onEdit()` và `onDelete()`; nút "Sửa" và "Xóa" chỉ khi `server` tồn tại; bấm "Xóa" hiện vùng xác nhận (state cục bộ của component) với "Xác nhận xóa"/"Hủy"; chỉ "Xác nhận xóa" mới gọi `onDelete()`.
  - [ ] Cập nhật/ bổ sung test của hai component: nút mới, luồng xác nhận (hủy không gọi `onDelete`, xác nhận gọi đúng một lần), không có nút Sửa/Xóa khi không tìm thấy máy chủ.
- [ ] **T6 – Ghép trong `App` (AC5–AC10, AC12)**
  - [ ] Sửa `src/App.tsx`: mở rộng trạng thái màn hình (danh sách / chi tiết / thêm / sửa) bằng `useState` (không router); giữ `filters` ở `App` như 1.2; lưu danh sách máy chủ trong state và đọc lại từ repository sau mỗi thao tác ghi để giao diện cập nhật.
  - [ ] Nhận prop tùy chọn `repository?: ServerRepository` mặc định là `serverRepository` để test truyền repository riêng (kho giả) mà không dùng `localStorage` thật.
  - [ ] Gọi `create`/`update`/`remove`, truyền `errors` của `SaveResult` xuống `ServerForm`, đặt thông báo `role="status"` theo AC10 và xóa thông báo khi chuyển màn hình.
- [ ] **T7 – Test luồng `App` (AC5–AC11, AC13)**
  - [ ] Thêm test tích hợp không mock module (ví dụ `src/App.crud.test.tsx`), mỗi test tạo repository mới trên kho giả riêng và truyền qua prop `repository`: thêm hợp lệ → chi tiết + thông báo + "Đã tải 4 máy chủ"; thêm sai → lỗi từng trường, giữ giá trị, không đổi "Đã tải N"; sửa hợp lệ và sửa xóa mô tả; hủy khi thêm/sửa; xóa có xác nhận (hủy rồi xác nhận) và danh sách giữ nguyên bộ lọc; xóa hết rồi thấy "Chưa có máy chủ nào" cùng nút "Thêm máy chủ"; "tải lại" (render lại `App` với repository mới trên cùng kho) thấy dữ liệu đã đổi.
  - [ ] Chạy lại và giữ cho đạt `App.test.tsx` và `App.integration.test.tsx` (mock module chỉ có `getAll`/`getById` vẫn dùng được nếu nhánh đọc không gọi phương thức ghi; nếu phải sửa, sửa tối thiểu).
- [ ] **T8 – Hoàn tất (AC13)**
  - [ ] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt bằng Node ≥ 20.19.
  - [ ] Ghi kết quả và bằng chứng theo từng AC vào mục Dev Agent Record, đổi trạng thái story sang `Review` và cập nhật `sprint-status.yaml`.

## Ghi chú cho Dev

### Căn cứ và giả định (đọc kỹ)

- `epics.md`, `prd.md`, `architecture.md` vẫn là **khung rỗng**; story này dựa trên yêu cầu #1 (`yeu-cau/yeu-cau-001.md`), kiến trúc thực tế rút ra từ mã của 1.1/1.2, và các quyết định người dùng ở trên. Nếu PM/Architect cập nhật tài liệu mâu thuẫn với story này, báo lại Scrum Master, đừng tự đổi hướng.
- **Giả định của Scrum Master (PM cần xác nhận):** định dạng id `srv-NNN` (lấy số lớn nhất + 1, nên xóa máy chủ cuối có thể làm id đó được dùng lại); giá trị mặc định của biểu mẫu thêm (Development, Đang hoạt động); **không** bắt buộc `hostname`/`ipAddress` duy nhất; thông điệp thông báo và nhãn nút ở các AC; khóa `iss.servers.v1`; không có hoàn tác sau khi xóa.
- Thông báo lỗi trường lấy nguyên từ `validateServer` (vd "Thiếu tên máy chủ (name)."); chưa có yêu cầu làm gọn lại câu chữ.
- Dữ liệu đọc từ `localStorage` là **dữ liệu không tin cậy**: luôn đi qua `validateServer`; React tự thoát chuỗi nên không dùng `dangerouslySetInnerHTML`.

### Tệp cần tạo / sửa

| Tệp | Hành động |
|---|---|
| `src/domain/serverInput.ts` (+ `.test.ts`) | Tạo |
| `src/repositories/serverRepository.ts` (+ `.test.ts`) | Sửa: thêm `create`/`update`/`remove`, lưu localStorage, `SaveResult` |
| `src/components/ServerForm.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ServerList.tsx` (+ `.test.tsx`) | Sửa: prop `onCreate`, nút "Thêm máy chủ" |
| `src/components/ServerDetail.tsx` (+ `.test.tsx`) | Sửa: nút Sửa/Xóa, xác nhận xóa |
| `src/App.tsx` | Sửa theo T6 |
| `src/App.crud.test.tsx` | Tạo (luồng thêm/sửa/xóa, không mock module) |
| `src/App.test.tsx`, `src/App.integration.test.tsx` | Chỉ sửa tối thiểu nếu bắt buộc |
| `src/App.css` | Sửa tùy chọn: style biểu mẫu, thông báo, vùng xác nhận |

Không sửa `types/server.ts`, `validateServer.ts`, `serverLabels.ts`, `filterServers.ts`, `servers.json` (nếu cần đổi, báo lại Scrum Master). Không sửa `docs/` ngoài mục Dev Agent Record của tệp này và `sprint-status.yaml` khi đổi trạng thái.

### Quy ước (từ kiến trúc 1.1/1.2)

- TypeScript `strict`; cấm `any` (ESLint `no-explicit-any: error`); dùng `unknown` ở ranh giới dữ liệu (đọc `localStorage`).
- Phân lớp `types` → `domain` (hàm thuần) → `repositories` (truy cập dữ liệu, **nơi duy nhất chạm `localStorage`**) → UI. `domain/serverInput.ts` là hàm thuần, không đụng `localStorage`/React.
- Component trình bày nhận dữ liệu và callback qua props; chỉ `App` gọi repository.
- Test đặt cạnh mã nguồn, tên `*.test.ts(x)`; Vitest + Testing Library + `@testing-library/jest-dom` đã cấu hình ở `src/test/setup.ts`; ưu tiên truy vấn theo role/label; dùng `fireEvent` (không thêm `user-event`).
- Nhãn giao diện bằng tiếng Việt; tên mã (biến, hàm, kiểu) bằng tiếng Anh.
- ESLint `react-refresh`: mỗi tệp component chỉ xuất component; hằng/hàm dùng chung đặt ở `domain/`.
- Không thêm router, state manager, UI kit, thư viện form/uuid. Chỉ dùng React hooks.

### Gợi ý kỹ thuật

- `serverRepository` là singleton tạo lúc import; **đừng** để các test dùng chung `localStorage` thật của jsdom làm trạng thái rò rỉ giữa các test. Test ghi dữ liệu dùng kho giả và repository riêng (qua prop `repository` của `App`).
- Trong `ServerForm`, kiểm tra hợp lệ chỉ ở repository (một nguồn sự thật); `App` truyền `errors` từ `SaveResult` xuống. Khi người dùng chuyển màn hình, đặt lại `errors` về rỗng.
- Với `update`, thứ tự bản ghi giữ nguyên nếu dùng `Map` và `set` lên khóa đã có.
- Mỗi tệp test mới khởi tạo jsdom riêng làm test chậm (~6 giây/tệp, V2 của `qa-1.2.md`); gom test theo tệp hợp lý, không tách quá nhỏ.

### Lưu ý môi trường và repo

- Máy mặc định dùng Node 10 (quá cũ). Dùng Node **≥ 20.19** (ví dụ v22.13.0 trong nvm) cho từng lệnh.
- V1 của `qa-1.1.md`/`qa-1.2.md` **vẫn còn**: các tệp cấu hình/types/data của 1.1 (`.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/`, `src/main.tsx`, `src/test/`, `src/types/`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`) đang chưa được commit (`??` trong `git status`). Không xóa/ghi đè chúng; người điều phối cần commit đủ khi bàn giao.
- Tài liệu thực tế nằm ở `docs/bmad-office/` (không phải `docs/stories/`).

### Lệnh

```
npm install
npm run dev      # xem thử: thêm, sửa, xóa máy chủ; tải lại trang thấy dữ liệu còn
npm run lint
npm run build
npm test         # vitest run
```

Khi xem thử bằng `npm run dev`, muốn quay về dữ liệu mẫu thì xóa khóa `iss.servers.v1` trong DevTools → Application → Local Storage.

### Definition of Done

Mọi ô nhiệm vụ đã đánh dấu; `lint`, `build`, `test` đều đạt; AC1–AC13 có bằng chứng trong Dev Agent Record; sau đó chuyển story sang `review` để QA (Linh Y Tiên Tử) kiểm thử.

## Dev Agent Record

## QA Results
