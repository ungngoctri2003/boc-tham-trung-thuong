# Vòng quay may mắn (Lucky Wheel) – Nội bộ DSSolution

Web vòng quay lì xì đầu năm: đăng nhập bằng email @dssolution.jp, mỗi người quay một lần, lưu kết quả và export CSV cho kế toán.

## Chức năng

- **Mệnh giá cố định:** 500.000 / 200.000 / 100.000 VND (có thể lặp segment trong code để chỉnh xác suất).
- **Chia sẻ link:** Gửi link trang chủ cho mọi người khi đã đông đủ.
- **Đăng nhập:** Chỉ email @dssolution.jp; mỗi user chỉ quay 1 lần.
- **Lưu kết quả:** email + mệnh giá + thời gian quay.
- **Xuất danh sách:** Xem bảng và export CSV (email | mệnh giá | thời gian).

## Công nghệ

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Auth:** Session JWT (cookie httpOnly), kiểm tra domain email
- **Database:** SQLite (Prisma)

## Cài đặt và chạy

```bash
cd lucky-wheel
npm install
```

Tạo file `.env` (hoặc copy từ `.env.example`):

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="mot-chuoi-bi-mat-bat-ky"
```

Tạo database và bảng:

```bash
npx prisma migrate dev --name init
```

Chạy dev:

```bash
npm run dev
```

Mở http://localhost:3000 — nhập email @dssolution.jp để đăng nhập và quay. Trang **Admin** (xem/export kết quả): http://localhost:3000/admin (cùng đăng nhập @dssolution.jp).

## Chỉnh xác suất mệnh giá

Sửa mảng `WHEEL_SEGMENTS` trong `lib/wheel.ts`. Mỗi phần tử là một ô trên vòng quay; lặp lại mệnh giá để tăng xác suất.

Ví dụ hiện tại: 2×500k, 3×200k, 4×100k (500k ít nhất, 100k nhiều nhất).

```ts
export const WHEEL_SEGMENTS: number[] = [
  500000, 500000,
  200000, 200000, 200000,
  100000, 100000, 100000, 100000,
];
```

## Triển khai (production)

1. Đặt `JWT_SECRET` mạnh và bí mật.
2. Build: `npm run build`
3. Chạy: `npm start` hoặc deploy lên Vercel/Railway (dùng SQLite file hoặc chuyển sang PostgreSQL bằng đổi `provider` trong Prisma).

## Cấu trúc thư mục chính

- `app/page.tsx` — Trang chủ (login / vòng quay / đã quay)
- `app/admin/page.tsx` — Danh sách kết quả + nút export CSV
- `app/api/auth/login` — Đăng nhập (kiểm tra domain, set cookie)
- `app/api/auth/session` — Lấy session hiện tại
- `app/api/spin` — Quay (random mệnh giá, lưu DB)
- `app/api/results` — GET danh sách; `?export=csv` trả về file CSV
- `components/LuckyWheel.tsx` — UI vòng quay
- `lib/auth.ts` — Kiểm tra email, JWT session
- `lib/wheel.ts` — Cấu hình segment và random mệnh giá
- `prisma/schema.prisma` — Model `SpinResult`
