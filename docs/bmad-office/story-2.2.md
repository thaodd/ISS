# Story 2.2: Ghi nhận ứng dụng đã cài trên máy chủ (gán ứng dụng vào máy chủ)

- **Project:** ISS
- **Epic:** 2 – Quản lý và ghi nhận cài đặt ứng dụng
- **Người soạn:** Thiết Tướng · Scrum Master (Bob)
- **Trạng thái:** Ready
- **Phụ thuộc:** Story 2.1 (danh mục ứng dụng, `applicationRepository`) và Story 1.3 (`serverRepository`, thao tác xóa máy chủ), cả hai đã Done; Story 1.2 (màn hình chi tiết máy chủ).
- **Là nền cho:** Story 2.3 (trạng thái và cập nhật phiên bản của bản ghi cài đặt, gỡ, lọc theo ứng dụng).
- **Bàn giao cho:** Kiếm Thánh · Developer

## Câu chuyện

Là một **quản trị viên hạ tầng của ISS**, tôi muốn **ghi nhận một ứng dụng (kèm phiên bản và ngày cài) đã được cài trên một máy chủ, xem danh sách ứng dụng đã cài ngay trong trang chi tiết máy chủ, và xóa bản ghi ghi nhận nhầm, với dữ liệu vẫn còn sau khi tải lại trang**, để **biết mỗi máy chủ đang chạy những ứng dụng nào ở phiên bản nào mà không cần tra cứu bên ngoài**.

## Phạm vi

**Trong phạm vi:** kiểu `Installation`; hàm kiểm tra hợp lệ; chuẩn hóa dữ liệu nhập và tự sinh `id`; repository `installationRepository` (đọc + `create`/`remove` + xóa hàng loạt theo máy chủ/ứng dụng) lưu bằng `localStorage`; mục "Ứng dụng đã cài" trong chi tiết máy chủ; màn hình biểu mẫu "Ghi nhận cài đặt"; xóa bản ghi cài đặt có xác nhận trong trang; **cảnh báo và xóa kèm** bản ghi cài đặt khi xóa máy chủ hoặc xóa ứng dụng; thông báo kết quả; test.

**Ngoài phạm vi (để story sau hoặc không làm):**

- Sửa phiên bản/ngày cài của bản ghi đã có, trạng thái cài đặt (đã cài/đang cài/lỗi/đã gỡ), gỡ cài đặt, lọc máy chủ theo ứng dụng → **Story 2.3**.
- Hiển thị danh sách máy chủ trong chi tiết ứng dụng (chỉ chi tiết máy chủ liệt kê ứng dụng; chi tiết ứng dụng chỉ có thêm lời cảnh báo khi xóa).
- Cài đặt thật, gọi backend/API, đồng bộ nhiều tab, hoàn tác, định tuyến (`react-router`), quản lý focus bàn phím, tìm kiếm/sắp xếp trong mục cài đặt.
- Sửa schema `Server` hoặc `Application`.

## Quyết định đã được người dùng xác nhận (soạn story 2.2, 2026-11-15)

Cộng với các quyết định của sprint 2 (ghi nhận thủ công, không cài thật, `localStorage`, không sửa schema `Server`):

1. **Xóa liên quan = cảnh báo + xóa kèm.** Vùng xác nhận xóa máy chủ/ứng dụng nói rõ sẽ xóa theo N bản ghi cài đặt; người dùng xác nhận thì xóa cả bản ghi cài đặt. Không để lại bản ghi mồ côi, nên rủi ro "id max+1 dùng lại id đã xóa" của máy chủ/ứng dụng không còn làm bản ghi cài đặt trỏ nhầm.
2. **Nơi ghi nhận = chi tiết máy chủ.** Người dùng ghi nhận cài đặt từ trang chi tiết máy chủ.
3. **Trường:** phiên bản **bắt buộc**; ngày cài **tùy chọn** (dạng `YYYY-MM-DD`, không ở tương lai).
4. **Thao tác:** thêm + xem + xóa bản ghi; **mỗi cặp (máy chủ, ứng dụng) chỉ có một bản ghi.**

## Giả định của Scrum Master (PM/Architect cần xác nhận, Dev cứ làm theo)

`epics.md`, `prd.md`, `architecture.md` vẫn là khung rỗng, nên các điểm sau là giả định của SM, đã được chốt thành tiêu chí để Dev làm ngay được:

1. Tên kiểu là `Installation` (bản ghi cài đặt) với trường `id`, `serverId`, `appId`, `version`, `installedAt?`.
2. `id` dạng `ins-NNN` (số lớn nhất + 1, đệm 0 tới 3 chữ số), tự sinh, không đổi.
3. Khóa `localStorage` riêng: `iss.installs.v1`. Dữ liệu khởi tạo `src/data/installations.json` là **mảng rỗng** `[]` (các id máy chủ/ứng dụng mẫu có thể đổi nên không gán sẵn).
4. Kiểm tra "ngày cài không ở tương lai" so với ngày hiện tại **theo giờ địa phương**, thực hiện khi `create` (không khi nạp dữ liệu).
5. Khi nạp dữ liệu, bản ghi trùng cặp (`serverId`, `appId`) bị bỏ (giữ bản đầu) kèm `console.warn`, vì Story 2.3 cần bất biến "một bản ghi mỗi cặp".
6. Repository cài đặt **không** tự kiểm tra `serverId`/`appId` có tồn tại: giao diện chỉ cho chọn máy chủ đang xem và ứng dụng có trong danh mục. Bản ghi mồ côi (chỉ có thể do dữ liệu `localStorage` bị sửa tay) được hiển thị an toàn (AC9).
7. Chỉ nhắc N bản ghi cài đặt trong thông báo xóa khi N > 0, để không đổi thông báo hiện có của Epic 1/2.1.

## Tiêu chí nghiệm thu

1. **AC1 – Kiểu dữ liệu:** tạo `src/types/installation.ts` xuất `interface Installation { id: string; serverId: string; appId: string; version: string; installedAt?: string }`. Không sửa `src/types/server.ts` và `src/types/application.ts`.
2. **AC2 – Kiểm tra hợp lệ:** hàm thuần `validateInstallation(data: unknown)` trong `src/domain/validateInstallation.ts`, cùng dạng `validateApplication`: trả `{ valid: true; installation }` hoặc `{ valid: false; errors: InstallationFieldErrors }` (`InstallationFieldErrors = Partial<Record<keyof Installation, string>>`). Nhận `unknown`, không ném lỗi với đầu vào bất kỳ. Quy tắc và thông báo:
   - không phải đối tượng thuần (`null`, mảng, kiểu nguyên thủy) → `errors.id = 'Bản ghi cài đặt phải là một đối tượng.'`
   - `id` thiếu/rỗng/chỉ khoảng trắng → `'Thiếu mã cài đặt (id).'`
   - `serverId` thiếu/rỗng/chỉ khoảng trắng → `'Thiếu mã máy chủ (serverId).'`
   - `appId` thiếu/rỗng/chỉ khoảng trắng → `'Chưa chọn ứng dụng (appId).'`
   - `version` thiếu/rỗng/chỉ khoảng trắng → `'Thiếu phiên bản (version).'`
   - `installedAt` có mặt (khác `undefined`) nhưng không phải chuỗi `YYYY-MM-DD` hoặc không phải ngày có thật (ví dụ `2026-02-30`, `2026-13-01`, `''`, `'15/11/2026'`, số) → `'Ngày cài phải có dạng YYYY-MM-DD và là ngày hợp lệ.'`
   - Nhiều trường sai thì báo đồng thời tất cả; trường lạ bị bỏ qua. Việc "không ở tương lai" **không** nằm trong hàm này (xem AC5).
3. **AC3 – Chuẩn hóa, sinh id, định dạng ngày:** `src/domain/installationInput.ts` xuất:
   - `InstallationInput = Omit<Installation, 'id'>`;
   - `normalizeInstallationInput(input)`: cắt khoảng trắng đầu/cuối `serverId`, `appId`, `version`, `installedAt`; **bỏ** `installedAt` nếu rỗng sau khi cắt; không đổi đối tượng đầu vào;
   - `generateInstallationId(existingIds: readonly string[]): string` trả `ins-NNN` với NNN = số lớn nhất trong các id khớp `ins-<số>` cộng 1, đệm 0 tới ít nhất 3 chữ số; id không khớp bị bỏ qua; danh sách rỗng → `ins-001`; có khoảng trống (`ins-001`, `ins-007` → `ins-008`); `ins-999` → `ins-1000`;
   - `formatLocalDate(date: Date): string` trả `YYYY-MM-DD` theo **giờ địa phương** (đệm 0 tháng/ngày), để so sánh chuỗi với `installedAt`.
4. **AC4 – Repository:** `src/repositories/installationRepository.ts` xuất interface `InstallationRepository`:
   - `getAll(): Installation[]` (trả **bản sao** mảng), `getById(id): Installation | undefined`;
   - `getByServerId(serverId): Installation[]` và `getByAppId(appId): Installation[]` (bản sao, theo thứ tự thêm);
   - `create(input: InstallationInput): InstallationSaveResult` – chuẩn hóa → `validateInstallation({ ...input, id })` → kiểm tra ngày và trùng cặp (AC5) → thêm vào **cuối** danh sách;
   - `remove(id): boolean` – `true` nếu đã xóa, `false` nếu `id` không tồn tại (không ném lỗi);
   - `removeByServerId(serverId): number` và `removeByAppId(appId): number` – xóa mọi bản ghi tương ứng, trả số bản ghi đã xóa (0 nếu không có, khi đó **không** ghi `localStorage`);
   - `InstallationSaveResult = { ok: true; installation: Installation } | { ok: false; errors: InstallationFieldErrors }`;
   - dữ liệu không hợp lệ trả `{ ok: false, errors }` theo từng trường và **không làm thay đổi** bộ nhớ lẫn `localStorage`.
5. **AC5 – Ngày không ở tương lai và không trùng cặp:** sau khi `validateInstallation` đạt, `create` còn kiểm tra và báo **đồng thời** nếu cả hai cùng sai:
   - `installedAt` lớn hơn ngày hiện tại (so sánh chuỗi `YYYY-MM-DD` với `formatLocalDate(now())`; bằng ngày hôm nay là hợp lệ) → `errors.installedAt = 'Ngày cài không được ở tương lai.'`;
   - đã có bản ghi cùng (`serverId`, `appId`) (sau khi chuẩn hóa) → `errors.appId = 'Ứng dụng này đã được ghi nhận trên máy chủ.'`.
   Đồng hồ được tiêm qua đối số để test cố định ngày (AC7).
6. **AC6 – Xóa theo máy chủ/ứng dụng:** `removeByServerId('srv-001')` chỉ xóa bản ghi của máy chủ đó, giữ nguyên thứ tự các bản ghi còn lại; tương tự `removeByAppId`. Sau khi xóa thành công (N > 0) ghi lại toàn bộ danh sách vào `localStorage` đúng một lần.
7. **AC7 – Lưu bền bằng localStorage:** cùng quy tắc với AC6 của Story 2.1, đổi khóa thành `iss.installs.v1`:
   - Lần đầu (chưa có khóa) danh sách khởi tạo từ `installations.json`, qua `validateInstallation` (bỏ bản ghi hỏng/trùng `id`/trùng cặp + `console.warn`).
   - Sau **mỗi** `create`/`remove`/`removeByServerId`/`removeByAppId` thành công, ghi toàn bộ danh sách; thao tác thất bại thì không ghi.
   - Khóa đã có thì nạp từ `localStorage` (qua cùng bộ kiểm tra), **không** nạp lại `installations.json`. Khóa chứa `[]` là danh sách rỗng thật.
   - Giá trị khóa không phải JSON hợp lệ hoặc không phải mảng → `console.warn` và quay về dữ liệu khởi tạo, không sập.
   - `localStorage` không truy cập được hoặc ghi lỗi → ứng dụng vẫn chạy với dữ liệu trong bộ nhớ, `console.warn`, không ném lỗi ra UI.
   - Hàm `createInstallationRepository(seedRecords, storage?, now?)` với `storage: Pick<Storage, 'getItem' | 'setItem'>` và `now: () => Date` (mặc định `() => new Date()`); thể hiện `installationRepository` dùng `window.localStorage`. Xuất hằng `INSTALLATIONS_STORAGE_KEY = 'iss.installs.v1'`.
8. **AC8 – Dữ liệu khởi tạo:** `src/data/installations.json` chứa đúng `[]`. Máy mới ghi nhận bản ghi đầu tiên nhận `id` `ins-001`.
9. **AC9 – Mục "Ứng dụng đã cài" trong chi tiết máy chủ:** khi máy chủ tồn tại, bên dưới phần chi tiết máy chủ có vùng `aria-label="Ứng dụng đã cài"` gồm: tiêu đề `h3` "Ứng dụng đã cài", nút **"Ghi nhận cài đặt"** (luôn hiển thị, kể cả khi chưa có bản ghi), dòng `Có N ứng dụng đã ghi nhận`, và bảng cột **Ứng dụng**, **Phiên bản**, **Ngày cài**, **Thao tác**, theo thứ tự thêm. Danh sách rỗng hiện `Chưa ghi nhận ứng dụng nào` thay cho bảng.
   - Cột Ứng dụng hiện **tên ứng dụng** (tra theo `appId` trong danh mục); nếu không tìm thấy hiện `<appId> (không tìm thấy)`. Không có `installedAt` thì ô Ngày cài hiện `Không rõ`.
   - Chỉ hiện bản ghi của máy chủ đang xem. Khi `id` máy chủ không tồn tại ("Không tìm thấy máy chủ") thì **không** hiện vùng này.
   - Vùng này không làm thay đổi bất kỳ nhãn/nút nào hiện có của chi tiết máy chủ.
10. **AC10 – Biểu mẫu ghi nhận:** bấm "Ghi nhận cài đặt" mở màn hình biểu mẫu `<form>` tiêu đề **"Ghi nhận cài đặt"**, hiện chữ `Máy chủ: <tên máy chủ>` (không phải ô nhập), với các trường có `<label>`:
    - **Ứng dụng** (`<select>`, tùy chọn đầu `-- Chọn ứng dụng --` giá trị rỗng, sau đó **chỉ các ứng dụng chưa được ghi nhận trên máy chủ này**, theo thứ tự danh mục, hiển thị tên);
    - **Phiên bản** (ô văn bản, bắt buộc);
    - **Ngày cài** (`<input type="date">`, không bắt buộc).
    Mặc định cả ba trống. Nút **"Lưu"** (`type="submit"`; Enter trong ô nhập cũng lưu) và **"Hủy"** (`type="button"`). Lưu hợp lệ thì tạo bản ghi, quay về **chi tiết máy chủ**, bản ghi hiện trong mục "Ứng dụng đã cài" với đúng dữ liệu đã nhập (phiên bản đã cắt khoảng trắng).
    - Nếu không còn ứng dụng nào để chọn (danh mục rỗng hoặc đã ghi nhận hết) hiện `Không còn ứng dụng nào để ghi nhận trên máy chủ này` và chỉ có nút "Hủy" (không có "Lưu").
11. **AC11 – Báo lỗi theo từng trường:** lưu dữ liệu sai (chưa chọn ứng dụng, thiếu phiên bản, ngày ở tương lai…) thì biểu mẫu **ở nguyên màn hình**, **giữ nguyên mọi giá trị đã nhập**, hiện thông báo lỗi ngay cạnh từng trường sai (nguyên văn từ repository/`validateInstallation`), đặt `aria-invalid="true"` và `aria-describedby` trỏ tới thông báo; nhiều trường sai thì hiện đồng thời. Sửa lại rồi lưu thành công thì lỗi biến mất. `errors.id`/`errors.serverId` (nếu có) hiện bằng `role="alert"` ở đầu biểu mẫu như `ServerForm`. Nếu máy chủ đã biến mất lúc đang ở màn hình biểu mẫu thì `App` hiện chi tiết "Không tìm thấy máy chủ".
12. **AC12 – Hủy:** "Hủy" ở biểu mẫu quay về **chi tiết máy chủ** đó; dữ liệu không đổi, không có thông báo.
13. **AC13 – Xóa bản ghi cài đặt có xác nhận:** mỗi dòng có nút **"Xóa bản ghi"** với `aria-label` = `Xóa bản ghi cài đặt <tên ứng dụng>` (dùng `<appId>` nếu không tìm thấy tên). Bấm không xóa ngay mà hiện vùng `role="alertdialog"` `aria-label="Xác nhận xóa bản ghi cài đặt"` với nội dung `Xóa bản ghi cài đặt "<tên ứng dụng>" khỏi máy chủ "<tên máy chủ>"? Thao tác này không thể hoàn tác.` cùng nút **"Xác nhận xóa bản ghi"** và **"Hủy"**. "Hủy" đóng vùng này, bản ghi còn nguyên. "Xác nhận xóa bản ghi" gọi `remove`, ở lại chi tiết máy chủ, bản ghi biến mất khỏi danh sách lẫn `localStorage`, và ứng dụng đó lại chọn được ở biểu mẫu ghi nhận. Chỉ một vùng xác nhận mở tại một thời điểm. Không dùng `window.confirm`/`alert`/`prompt`.
14. **AC14 – Xóa máy chủ có bản ghi cài đặt:** `ServerDetail` nhận thêm prop tùy chọn `installedCount?: number`. Khi `installedCount > 0`, vùng xác nhận xóa máy chủ giữ nguyên đoạn `Xóa máy chủ "<tên>"? Thao tác này không thể hoàn tác.` và **thêm** đoạn `Máy chủ này có N bản ghi cài đặt; các bản ghi này sẽ bị xóa theo.`. Khi `installedCount` là `0` hoặc không truyền thì giao diện **y hệt trước đây**. "Xác nhận xóa" xóa máy chủ rồi gọi `removeByServerId`; không còn bản ghi nào của máy chủ đó trong repository lẫn `localStorage`. Thông báo: `Đã xóa máy chủ "<tên>"` nếu N = 0 (như cũ), `Đã xóa máy chủ "<tên>" và N bản ghi cài đặt` nếu N > 0. "Hủy" không xóa gì.
15. **AC15 – Xóa ứng dụng đang được ghi nhận:** `ApplicationDetail` nhận thêm prop tùy chọn `installedCount?: number`. Khi `installedCount > 0`, vùng xác nhận xóa ứng dụng giữ nguyên đoạn cũ và **thêm** đoạn `Ứng dụng này đang được ghi nhận trên N máy chủ; các bản ghi cài đặt sẽ bị xóa theo.`. `installedCount` 0/không truyền: giao diện không đổi. "Xác nhận xóa" xóa ứng dụng rồi gọi `removeByAppId`. Thông báo: `Đã xóa ứng dụng "<tên>"` nếu N = 0 (như cũ), `Đã xóa ứng dụng "<tên>" và N bản ghi cài đặt` nếu N > 0. Sau đó mở chi tiết các máy chủ liên quan không còn dòng của ứng dụng đó.
16. **AC16 – Thông báo và làm mới:** sau thao tác thành công hiện trong vùng `role="status"` đúng một trong: `Đã ghi nhận cài đặt "<tên ứng dụng>" trên máy chủ "<tên máy chủ>"`, `Đã xóa bản ghi cài đặt "<tên ứng dụng>" khỏi máy chủ "<tên máy chủ>"`, hoặc các thông báo xóa ở AC14/AC15. Thông báo biến mất khi chuyển màn hình hoặc chuyển mục (như hiện nay). Dòng `Có N ứng dụng đã ghi nhận` **cập nhật ngay**; xóa hết bản ghi thì hiện `Chưa ghi nhận ứng dụng nào` cùng nút "Ghi nhận cài đặt".
17. **AC17 – Bền qua lần tải lại:** ghi nhận/xóa bản ghi xong, hoặc xóa máy chủ/ứng dụng kèm bản ghi, rồi tạo lại repository (và render lại `App`) trên cùng `localStorage` thì dữ liệu đúng như trước khi "tải lại", kể cả khi đã xóa hết bản ghi (không nạp lại dữ liệu khởi tạo).
18. **AC18 – Kiến trúc, quy ước, khả năng truy cập, không phá Epic 1/2.1:** UI không import `installations.json` và không gọi trực tiếp `localStorage`; chỉ repository đọc/ghi `localStorage`; chỉ `App` gọi repository, component trình bày nhận dữ liệu và callback qua props. `App` nhận thêm prop tùy chọn `installationRepository?: InstallationRepository` (mặc định `installationRepository`), giữ nguyên `repository?` và `applicationRepository?`. TypeScript `strict`, không `any`, không thêm thư viện runtime. Mỗi ô nhập có `<label>` gắn đúng; dùng `<form>` thật; test truy vấn được theo role/label. Chỉ **được sửa** từ mã cũ: `App.tsx`, `App.css`, `ServerDetail.tsx` và `ApplicationDetail.tsx` (chỉ thêm prop `installedCount?` theo AC14/AC15). Toàn bộ **229 test hiện có** vẫn đạt, không xóa test hay hạ kỳ vọng.
19. **AC19 – Test và chất lượng:** `npm run lint`, `npm run build`, `npm test` đều đạt bằng Node ≥ 20.19. Có test mới cho từng nhóm ở T1–T8.

## Nhiệm vụ / việc con

- [ ] **T1 – Kiểu, kiểm tra hợp lệ, dữ liệu nhập (AC1, AC2, AC3, AC8, AC18)**
  - [ ] Tạo `src/types/installation.ts` (`Installation`).
  - [ ] Tạo `src/domain/validateInstallation.ts` (`validateInstallation`, `InstallationFieldErrors`, `InstallationValidationResult`) và `validateInstallation.test.ts`: hợp lệ tối thiểu (không `installedAt`), có `installedAt`, từng trường thiếu/rỗng/chỉ khoảng trắng/sai kiểu, `installedAt` sai định dạng (`''`, `15/11/2026`, `2026-02-30`, `2026-13-01`, số), năm nhuận (`2028-02-29` hợp lệ, `2027-02-29` không), đầu vào không phải đối tượng (`null`, mảng, chuỗi, số), nhiều lỗi cùng lúc, trường lạ bị bỏ.
  - [ ] Tạo `src/domain/installationInput.ts` (`InstallationInput`, `normalizeInstallationInput`, `generateInstallationId`, `formatLocalDate`) và `installationInput.test.ts`: chuẩn hóa từng trường, `installedAt` toàn khoảng trắng bị bỏ, không đổi đầu vào; sinh id: rỗng, liên tiếp, khoảng trống, id lạ bị bỏ qua, `ins-999` → `ins-1000`; `formatLocalDate` đệm 0 (ví dụ `new Date(2026, 0, 5)` → `2026-01-05`).
  - [ ] Tạo `src/data/installations.json` = `[]`.
- [ ] **T2 – Repository (AC4–AC8)**
  - [ ] Tạo `src/repositories/installationRepository.ts` theo mẫu `applicationRepository.ts` (`createInstallationRepository(seed, storage?, now?)`, `InstallationSaveResult`, `INSTALLATIONS_STORAGE_KEY`, chế độ chỉ-bộ-nhớ khi không có `localStorage`), thêm `getByServerId`, `getByAppId`, `removeByServerId`, `removeByAppId`, kiểm tra ngày/trùng cặp (AC5), bỏ bản ghi trùng cặp khi nạp. Không import/sửa `serverRepository.ts` hay `applicationRepository.ts`.
  - [ ] Tạo `installationRepository.test.ts` với `createMemoryStorage` (`src/test/memoryStorage.ts`, có sẵn) và `now` cố định (ví dụ `() => new Date(2026, 10, 15)`): `getAll` là bản sao, `getById`, `getByServerId`/`getByAppId`; `create` (id `ins-001`, vị trí cuối, trường được cắt khoảng trắng, dữ liệu sai không đổi gì kể cả `localStorage`, ngày hôm nay hợp lệ, ngày mai bị từ chối, trùng cặp bị từ chối, **cùng ứng dụng trên máy chủ khác thì được**, cả ngày tương lai lẫn trùng cặp báo đồng thời); `remove` có/không tồn tại; `removeByServerId`/`removeByAppId` (đúng bản ghi, trả đúng số lượng, giữ thứ tự, N = 0 không gọi `setItem`); lưu bền: chưa có khóa, có khóa, `[]`, bản ghi hỏng/trùng id/trùng cặp (có `console.warn`), JSON hỏng, không phải mảng, `getItem`/`setItem` ném lỗi, "tải lại" bằng repository thứ hai, xóa hết rồi tải lại; seed `installations.json` là mảng rỗng.
- [ ] **T3 – Biểu mẫu `InstallationForm` (AC10, AC11, AC12, AC18)**
  - [ ] Tạo `src/components/InstallationForm.tsx` (thuần trình bày, mẫu theo `ServerForm.tsx`): props `server: Server`, `applications: readonly Application[]` (đã lọc những ứng dụng còn chọn được), `errors: InstallationFieldErrors`, `onSubmit(input: InstallationInput)`, `onCancel()`; state cục bộ giữ giá trị; không tự kiểm tra hợp lệ; `serverId` lấy từ `server.id` khi gửi; lỗi theo trường với `aria-invalid`/`aria-describedby`; `id` các ô dùng tiền tố `installation-form-`; trạng thái "không còn ứng dụng" theo AC10.
  - [ ] Tạo `InstallationForm.test.tsx`: mặc định trống và chỉ liệt kê ứng dụng được truyền; submit gọi `onSubmit` đúng dữ liệu (`installedAt` trống gửi `''`; chuẩn hóa là việc của repository); lỗi từng trường kèm `aria-invalid`/`aria-describedby`; giữ giá trị khi có lỗi; `errors.id`/`errors.serverId` hiện `role="alert"`; "Hủy" gọi `onCancel`; submit bằng form (Enter) lưu được; trạng thái không còn ứng dụng chỉ có "Hủy".
- [ ] **T4 – Mục `ServerInstallations` (AC9, AC13, AC18)**
  - [ ] Tạo `src/components/ServerInstallations.tsx` (props `server: Server`, `installations: readonly Installation[]` (đã lọc theo máy chủ), `applications: readonly Application[]` (toàn bộ danh mục, để tra tên), `onAdd()`, `onRemove(id: string)`; vùng xác nhận xóa dùng state cục bộ như `ServerDetail`, chỉ một vùng mở) và `ServerInstallations.test.tsx`: nút "Ghi nhận cài đặt" kể cả khi rỗng, `Chưa ghi nhận ứng dụng nào`, dòng `Có N ứng dụng đã ghi nhận`, các cột và thứ tự, tên ứng dụng tra đúng, `<appId> (không tìm thấy)` khi mồ côi, `Không rõ` khi thiếu ngày, "Xóa bản ghi" hiện đúng nội dung xác nhận, "Hủy" không gọi `onRemove`, "Xác nhận xóa bản ghi" gọi đúng một lần với đúng id, mở xác nhận ở dòng khác thì đóng dòng trước, `onAdd` được gọi.
- [ ] **T5 – Cảnh báo xóa kèm trong `ServerDetail`/`ApplicationDetail` (AC14, AC15, AC18)**
  - [ ] Sửa `src/components/ServerDetail.tsx` và `ApplicationDetail.tsx`: thêm prop tùy chọn `installedCount?: number` và đoạn cảnh báo trong vùng xác nhận khi `> 0`; không đổi bất kỳ chữ nào khác.
  - [ ] Thêm test vào `ServerDetail.test.tsx` và `ApplicationDetail.test.tsx` (chỉ **thêm** ca mới): có cảnh báo khi `installedCount > 0` với đúng N; không có cảnh báo khi `0` hoặc không truyền; đoạn xác nhận cũ vẫn còn nguyên.
- [ ] **T6 – Ghép trong `App` (AC9–AC17, AC18)**
  - [ ] Sửa `src/App.tsx`: thêm prop `installationRepository?`; thêm state danh sách cài đặt (đọc lại sau mỗi thao tác ghi) và `installationErrors`; thêm màn hình `{ name: 'install'; id }` cho nhánh máy chủ (cách ít đổi hành vi Epic 1 nhất; nhánh ứng dụng giữ kiểu `Screen` cũ); `renderDetail` hiển thị `ServerDetail` rồi `ServerInstallations` khi máy chủ tồn tại và truyền `installedCount`; màn hình `install` tính danh sách ứng dụng còn chọn được (danh mục trừ những `appId` đã có trên máy chủ) và truyền cho `InstallationForm`; `goTo` đặt lại `installationErrors`.
  - [ ] `handleCreateInstallation` (gọi `installationRepository.create`, đặt lỗi hoặc làm mới + về chi tiết máy chủ + thông báo AC16); `handleRemoveInstallation` (gọi `remove`, ở lại chi tiết, thông báo AC16).
  - [ ] Sửa `handleDelete` (máy chủ) và `handleDeleteApplication`: sau khi xóa thành công gọi `removeByServerId`/`removeByAppId`, làm mới danh sách cài đặt và dùng thông báo theo AC14/AC15 (N lấy từ giá trị trả về).
  - [ ] Sửa tùy chọn `src/App.css`: tái sử dụng class có sẵn (`form-field`, `field-error`, `form-actions`, `detail-actions`, `confirm-delete`); chỉ thêm style nếu cần cho khoảng cách của vùng "Ứng dụng đã cài".
- [ ] **T7 – Test luồng `App` (AC9–AC17, AC19)**
  - [ ] Tạo `src/App.installations.test.tsx` (không mock module; mỗi test tạo repository máy chủ, ứng dụng, cài đặt mới trên **kho giả riêng** và truyền qua props `repository`, `applicationRepository`, `installationRepository`; repository cài đặt dùng `now` cố định): mở chi tiết `srv-001` thấy mục rỗng + nút; ghi nhận hợp lệ → quay về chi tiết + dòng mới + thông báo + `Có 1 ứng dụng đã ghi nhận`; lọc ứng dụng đã ghi nhận khỏi danh sách chọn; chưa chọn ứng dụng / thiếu phiên bản → lỗi từng trường, giữ giá trị, ở nguyên màn hình; ngày tương lai → lỗi; cùng ứng dụng cho máy chủ khác được; hủy; xóa bản ghi có xác nhận (hủy rồi xác nhận) và ứng dụng chọn lại được; hết ứng dụng để chọn; xóa máy chủ có bản ghi (cảnh báo đúng N, hủy không xóa, xác nhận xóa kèm, thông báo `… và N bản ghi cài đặt`); xóa ứng dụng đang được ghi nhận (cảnh báo, xóa kèm, chi tiết máy chủ không còn dòng); xóa máy chủ/ứng dụng không có bản ghi giữ nguyên thông báo cũ; "tải lại" (render `App` mới với repository mới trên cùng kho) thấy dữ liệu đã đổi, kể cả khi đã xóa hết; chuyển mục xóa thông báo; bản ghi mồ côi (nạp sẵn `appId` không có trong danh mục) hiện `<appId> (không tìm thấy)`.
  - [ ] Chạy lại và giữ cho đạt toàn bộ test cũ, đặc biệt `App.test.tsx` (mock module `serverRepository`), `App.integration.test.tsx`, `App.crud.test.tsx`, `App.applications.test.tsx`. Chỉ sửa tối thiểu nếu bắt buộc, ghi rõ lý do trong Dev Agent Record.
- [ ] **T8 – Hoàn tất (AC19)**
  - [ ] Chạy `npm run lint`, `npm run build`, `npm test` đều đạt bằng Node ≥ 20.19.
  - [ ] Ghi kết quả và bằng chứng theo từng AC vào mục Dev Agent Record, đổi trạng thái story sang `Review` và cập nhật `sprint-status.yaml`.

## Ghi chú cho Dev

### Căn cứ

- Tài liệu thật nằm ở `docs/bmad-office/` (không có `docs/epics.md`, `docs/architecture.md`, `docs/stories/`). `epics.md`/`architecture.md` vẫn là khung rỗng nên kiến trúc dưới đây **rút ra từ mã thật của Story 1.1–2.1**; mẫu để bám là `applicationRepository.ts`, `validateApplication.ts`, `applicationInput.ts`, `ServerForm.tsx`, `ServerDetail.tsx`, `ApplicationList.tsx`. Nếu PM/Architect cập nhật tài liệu mâu thuẫn với story này, báo lại Scrum Master, đừng tự đổi hướng.
- Dữ liệu đọc từ `localStorage` là **dữ liệu không tin cậy**: luôn đi qua `validateInstallation`; không dùng `dangerouslySetInnerHTML`.

### Tệp cần tạo / sửa

| Tệp | Hành động |
|---|---|
| `src/types/installation.ts` | Tạo |
| `src/domain/validateInstallation.ts` (+ `.test.ts`) | Tạo |
| `src/domain/installationInput.ts` (+ `.test.ts`) | Tạo |
| `src/data/installations.json` | Tạo (`[]`) |
| `src/repositories/installationRepository.ts` (+ `.test.ts`) | Tạo |
| `src/components/InstallationForm.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ServerInstallations.tsx` (+ `.test.tsx`) | Tạo |
| `src/components/ServerDetail.tsx` (+ `.test.tsx`) | Sửa: thêm prop `installedCount?` và cảnh báo; thêm test |
| `src/components/ApplicationDetail.tsx` (+ `.test.tsx`) | Sửa: thêm prop `installedCount?` và cảnh báo; thêm test |
| `src/App.tsx` | Sửa: màn hình `install`, mục cài đặt, xóa kèm, prop `installationRepository` |
| `src/App.installations.test.tsx` | Tạo (luồng đầy đủ, không mock module) |
| `src/App.css` | Sửa tùy chọn |

**Không sửa:** `types/server.ts`, `types/application.ts`, `validateServer.ts`, `validateApplication.ts`, `serverInput.ts`, `applicationInput.ts`, `serverLabels.ts`, `filterServers.ts`, `serverRepository.ts`, `applicationRepository.ts`, `servers.json`, `applications.json`, `ServerForm`, `ServerList`, `ApplicationForm`, `ApplicationList`, `test/memoryStorage.ts` (dùng nguyên). Nếu thấy buộc phải sửa, báo lại Scrum Master. Không sửa `docs/` ngoài mục Dev Agent Record của tệp này và `sprint-status.yaml` khi đổi trạng thái.

### Quy ước (từ kiến trúc Epic 1–2.1)

- TypeScript `strict`; cấm `any` (ESLint `no-explicit-any: error`); dùng `unknown` ở ranh giới dữ liệu (đọc `localStorage`, `validateInstallation`).
- Phân lớp `types` → `domain` (hàm thuần) → `repositories` (**nơi duy nhất chạm `localStorage`**) → UI. `domain/` thuần, không đụng `localStorage`/React; đồng hồ chỉ lấy ở repository (tiêm `now`), `formatLocalDate` nhận `Date` truyền vào.
- Component trình bày nhận dữ liệu và callback qua props; chỉ `App` gọi repository.
- Test đặt cạnh mã nguồn, tên `*.test.ts(x)`; Vitest + Testing Library + `@testing-library/jest-dom` (cấu hình ở `src/test/setup.ts`); ưu tiên truy vấn theo role/label; dùng `fireEvent` (không thêm `user-event`).
- Nhãn giao diện bằng tiếng Việt; tên mã (biến, hàm, kiểu) bằng tiếng Anh.
- ESLint `react-refresh`: mỗi tệp component chỉ xuất component; hằng/hàm dùng chung đặt ở `domain/`.
- Không thêm router, state manager, UI kit, thư viện form/ngày/uuid. Chỉ dùng React hooks.

### Gợi ý kỹ thuật

- Kiểm tra `installedAt` hợp lệ: khớp `/^\d{4}-\d{2}-\d{2}$/`, rồi tạo `new Date(Date.UTC(y, m - 1, d))` và so lại năm/tháng/ngày để loại `2026-02-30`. Không dùng `Date.parse` một mình (chấp nhận nhiều định dạng).
- Kiểm tra "tương lai" bằng so sánh chuỗi `installedAt > formatLocalDate(now())` (định dạng cố định nên đúng thứ tự từ điển). Trong `jsdom`, `<input type="date">` tự loại giá trị không hợp lệ về `''`; test đặt giá trị bằng `fireEvent.change(input, { target: { value: '2026-11-16' } })`.
- Đặt kiểm tra trùng cặp/ngày trong repository (nơi có danh sách đầy đủ), không đặt trong `validateInstallation`. Khi nạp dữ liệu, chỉ áp dụng kiểm tra trùng `id` và trùng cặp, **không** kiểm tra ngày tương lai.
- `remove*` hàng loạt: dựng danh sách mới bằng `filter` trên `Map` hoặc xóa từng khóa; giữ thứ tự các bản ghi còn lại; chỉ gọi `persist()` khi N > 0.
- Xóa máy chủ/ứng dụng trong `App`: đếm N bằng `removeBy…` **sau** khi `repository.remove(id)` trả `true`; lấy N cho vùng xác nhận bằng `installationRepository.getByServerId(id).length` / `getByAppId(id).length` trước khi render (truyền `installedCount`).
- `serverRepository`, `applicationRepository`, `installationRepository` đều là singleton tạo lúc import: các test ghi dữ liệu **không** được dùng `localStorage` thật của jsdom; truyền repository riêng qua prop với kho giả. Test cũ (`App.test.tsx`, `App.crud.test.tsx`…) không truyền `installationRepository` nên dùng singleton đọc `localStorage` jsdom với seed `[]`; không ghi gì trừ khi tạo bản ghi nên vẫn an toàn. Nhớ vì vậy `removeByServerId`/`removeByAppId` với N = 0 **không ghi** `localStorage`.
- Cẩn thận trùng tên truy vấn trong test: vùng xác nhận xóa máy chủ có nút "Xác nhận xóa"; vùng xác nhận bản ghi dùng tên khác ("Xác nhận xóa bản ghi") và `aria-label` khác để truy vấn theo tên không nhập nhằng. Nút "Hủy" xuất hiện nhiều nơi, hãy truy vấn trong `within(getByRole('alertdialog', { name: … }))`.
- `ServerInstallations` nhận **toàn bộ** danh mục ứng dụng để tra tên; `InstallationForm` nhận danh mục **đã lọc**. Việc lọc nằm ở `App` (hoặc một hàm thuần ở `domain/` nếu muốn test riêng; nếu tách thì viết test).
- Mỗi tệp test mới khởi tạo jsdom riêng làm test chậm (~6–10 giây/tệp, toàn bộ ~165 giây); gom test theo tệp hợp lý, không tách quá nhỏ.
- Chấp nhận lặp nhẹ giữa các repository (nạp/ghi `localStorage`); **đừng** tổng quát hóa ở story này. Nếu thấy cần, ghi đề xuất vào Dev Agent Record để Retrospective xem xét. Với `App.tsx` đã ~275 dòng và sắp thêm màn hình, có thể tách component trang **nếu** hành vi và test cũ không đổi; đây là tùy chọn, không bắt buộc.

### Lưu ý môi trường và repo

- Máy mặc định dùng Node 10 (quá cũ). Dùng Node **≥ 20.19** (ví dụ v22.13.0 trong nvm) cho từng lệnh.
- **Nợ V1 của sprint 1 vẫn còn:** `git status` (2026-11-15) vẫn liệt kê chưa commit: `.gitignore`, `eslint.config.js`, `index.html`, `package-lock.json`, `src/data/servers.json`, `src/main.tsx`, `src/test/setup.ts`, `src/types/server.ts`, `src/vite-env.d.ts`, `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`. Không xóa/ghi đè; người điều phối cần commit đủ để HEAD build được.

### Lệnh

```
npm install
npm run dev      # xem thử: mở chi tiết một máy chủ → "Ghi nhận cài đặt"; tải lại trang thấy dữ liệu còn
npm run lint
npm run build
npm test         # vitest run
```

Khi xem thử bằng `npm run dev`, muốn xóa dữ liệu cài đặt thì xóa khóa `iss.installs.v1` trong DevTools → Application → Local Storage.

### Definition of Done

Mọi ô nhiệm vụ đã đánh dấu; `lint`, `build`, `test` đều đạt; AC1–AC19 có bằng chứng trong Dev Agent Record; sau đó chuyển story sang `review` để QA (Linh Y Tiên Tử) kiểm thử.

## Dev Agent Record

_(để trống – Developer điền khi làm)_

## QA Results

_(để trống – QA điền khi kiểm thử)_
