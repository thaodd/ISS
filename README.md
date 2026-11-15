# ISS – Quản lý máy chủ và ứng dụng cài đặt

Ứng dụng web nội bộ (React + TypeScript + Vite) để quản lý thông tin máy chủ và ghi nhận ứng dụng/phiên bản đã cài trên từng máy chủ. Không có backend; dữ liệu lưu trong `localStorage` của trình duyệt.

## Yêu cầu môi trường

- **Node.js >= 20.19** (khuyến nghị 22). Node thấp hơn (ví dụ v10) sẽ không chạy được.
- npm đi kèm Node. Trình duyệt hiện đại.

`.npmrc` bật `engine-strict`, nên `npm install` trên Node cũ sẽ dừng và báo `Unsupported engine` (cần Node >= 20.19).

### Chọn Node bằng nvm

Windows (nvm-windows):

```powershell
nvm list
nvm use 22.13.0
node -v    # phải >= v20.19
```

macOS/Linux: `nvm use` (đọc `.nvmrc`).

## Chạy ứng dụng

```bash
npm install     # cài phụ thuộc theo package-lock.json
npm run dev     # mở http://localhost:5173/
```

Mở `http://localhost:5173/` sẽ thấy tiêu đề "ISS – Quản lý máy chủ", danh sách 3 máy chủ mẫu và có thể chuyển sang mục Ứng dụng. Sửa mã thì trang tự tải lại.

## Các lệnh

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy chế độ phát triển (Vite) |
| `npm run build` | Kiểm tra kiểu và build sản xuất vào `dist/` |
| `npm run preview` | Phục vụ bản build trong `dist/` (chạy `build` trước), mặc định `http://localhost:4173/` |
| `npm run lint` | Chạy ESLint |
| `npm test` | Chạy toàn bộ test (Vitest); khá chậm, vài phút |

## Dữ liệu

- Máy chủ mẫu: `src/data/servers.json`, nạp lần đầu khi `localStorage` chưa có dữ liệu.
- Khóa `localStorage`: `iss.servers.v1`, `iss.apps.v1`, `iss.installs.v1`.
- Khôi phục dữ liệu về mẫu: mở DevTools > Application > Local Storage, xóa các khóa trên (hoặc chạy `localStorage.clear()` trong Console) rồi tải lại trang.

## Xử lý sự cố

- **`Unsupported engine` / lỗi cú pháp khi chạy lệnh**: Node quá cũ. Chạy `node -v`, chuyển sang Node >= 20.19 bằng nvm (xem trên).
- **Cổng 5173 đang bận**: Vite tự chọn cổng kế tiếp và in địa chỉ trong terminal; hoặc dùng `npm run dev -- --port 5180`.
- **Trang trắng sau khi sửa dữ liệu**: xóa `localStorage` như hướng dẫn ở mục Dữ liệu.
