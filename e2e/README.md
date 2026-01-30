# E2E: Tự động đăng nhập 45 tài khoản và quay

Script gọi API đăng nhập lần lượt từng email rồi gọi API quay, dùng để đánh giá độ chính xác thuật toán (phân bố 15×100k, 25×200k, 5×500k).

## Chuẩn bị

1. **Server đang chạy**
   ```bash
   npm run dev
   ```

2. **`.env` phải cho phép 45 email đăng nhập**
   - Thêm đủ 45 email vào `ALLOWED_EMAILS` (cách nhau bằng dấu phẩy hoặc xuống dòng).
   - Ví dụ: `ALLOWED_EMAILS="pool.hung.tran@dssolution.jp,kha.pham@dssolution.jp,..."`

3. **(Tùy chọn) Reset pool trước khi chạy**
   - Nếu đã có người quay trước đó, set biến môi trường để reset:
   - `E2E_RESET_ADMIN_EMAIL=tri.ung@dssolution.jp` (email này phải có trong `RESET_ADMIN_EMAILS` trong `.env`)

## Chạy

```bash
npm run e2e:spin
```

Hoặc:

```bash
npx tsx e2e/spin-all-accounts.ts
```

### Biến môi trường

| Biến | Mô tả |
|------|--------|
| `BASE_URL` | URL server (mặc định: `http://localhost:3000`) |
| `E2E_RESET_ADMIN_EMAIL` | Email admin để gọi reset pool trước khi quay (tùy chọn) |
| `E2E_EMAILS` | Danh sách email thay cho 45 email mặc định (cách nhau dấu phẩy) |

Ví dụ reset rồi quay:

```bash
# Windows PowerShell
$env:E2E_RESET_ADMIN_EMAIL="tri.ung@dssolution.jp"; npm run e2e:spin
```

```bash
# Linux / macOS
E2E_RESET_ADMIN_EMAIL=tri.ung@dssolution.jp npm run e2e:spin
```

## Kết quả

- Script in từng bước: `[1/45] email → 100k`, ...
- Cuối cùng in bảng kết quả và phân bố (100k / 200k / 500k).
- Nếu đúng 15/25/5 và đủ 45 lượt → `[PASS]`. Ngược lại → `[FAIL]` và exit code 1.

---

## Test quay đồng thời (concurrent)

File `e2e/spin-concurrent.ts` kiểm tra **45 user quay cùng lúc**: tất cả thành công, mỗi người một giải, phân bố đúng 15/25/5.

### Chạy

```bash
npm run e2e:spin:concurrent
```

Nên reset pool trước khi chạy:

```bash
# Windows PowerShell
$env:E2E_RESET_ADMIN_EMAIL="tri.ung@dssolution.jp"; npm run e2e:spin:concurrent
```

### Biến môi trường

| Biến | Mô tả |
|------|--------|
| `E2E_CONCURRENT_COUNT` | Số user quay đồng thời (mặc định: 45) |
| `E2E_RESET_ADMIN_EMAIL` | Email admin để reset pool trước khi test (nên set) |
| `E2E_EMAILS` | Danh sách email (cần ít nhất 45 email) |
