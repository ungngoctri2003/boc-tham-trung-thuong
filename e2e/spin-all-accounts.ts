/**
 * E2E: Tự động đăng nhập lần lượt 45 tài khoản và quay (gọi API login + spin).
 * Dùng để đánh giá độ chính xác thuật toán: sau 45 lượt phải đúng 15x100k, 25x200k, 5x500k.
 *
 * Yêu cầu:
 * - Server chạy (npm run dev), BASE_URL trỏ đúng (mặc định http://localhost:3000)
 * - .env: ALLOWED_EMAILS phải chứa đủ 45 email và trùng với danh sách dùng khi chạy script.
 *   Nếu .env dùng danh sách khác (vd. hung.tran thay vì pool.hung.tran), set E2E_EMAILS=... cho đúng.
 * - (Tùy chọn) Reset pool trước khi chạy: set E2E_RESET_ADMIN_EMAIL=admin@dssolution.jp
 *
 * Chạy: npx tsx e2e/spin-all-accounts.ts
 * Hoặc: npm run e2e:spin
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/** Danh sách 45 email mặc định (phải trùng với ALLOWED_EMAILS trong .env khi chạy). */
const E2E_EMAILS_45 = [
  "hung.tran@dssolution.jp",
  "kha.pham@dssolution.jp",
  "duchieu.nguyen@dssolution.jp",
  "quyen.hoang@dssolution.jp",
  "kngan.tran@dssolution.jp",
  "trang.le@dssolution.jp",
  "huunghia.nguyen@dssolution.jp",
  "trang.trinh@dssolution.jp",
  "long.do@dssolution.jp",
  "nguyen.trinh@dssolution.jp",
  "thuylinh.dinh@dssolution.jp",
  "anh.phan@dssolution.jp",
  "anh.nguyen@dssolution.jp",
  "hieu.le@dssolution.jp",
  "ha.le@dssolution.jp",
  "giang.nguyen@dssolution.jp",
  "truonggiang.nguyen@dssolution.jp",
  "ha.vu@dssolution.jp",
  "chau.nguyen@dssolution.jp",
  "tai.nguyen@dssolution.jp",
  "trang.pham@dssolution.jp",
  "dat.duong@dssolution.jp",
  "tri.ung@dssolution.jp",
  "nguyen.le@dssolution.jp",
  "hoang.bui@dssolution.jp",
  "dang.hong@dssolution.jp",
  "tung.dao@dssolution.jp",
  "diep.nguyen@dssolution.jp",
  "nhatlinh.dinh@dssolution.jp",
  "trongdat.nguyen@dssolution.jp",
  "hao.tang@dssolution.jp",
  "huyentrang.nguyen@dssolution.jp",
  "son.pham@dssolution.jp",
  "duy.tran@dssolution.jp",
  "tung.dang@dssolution.jp",
  "hai.nguyen@dssolution.jp",
  "tung.ngo@dssolution.jp",
  "thanhdat.nguyen@dssolution.jp",
  "khiem.nguyen@dssolution.jp",
  "duylong.tran@dssolution.jp",
  "huy.truong@dssolution.jp",
  "truong.ngo@dssolution.jp",
  "tuananh.trinh@dssolution.jp",
  "hai.vu@dssolution.jp",
  "thanh.le@dssolution.jp",
];

function getCookieFromResponse(res: Response): string {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  if (cookies.length === 0) {
    const single = res.headers.get("set-cookie");
    if (single) return single.split(";")[0].trim();
    return "";
  }
  return cookies.map((c) => c.split(";")[0].trim()).join("; ");
}

async function login(email: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    redirect: "manual",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${(data as { error?: string }).error || res.statusText}`);
  }
  const cookie = getCookieFromResponse(res);
  if (!cookie) throw new Error(`No session cookie for ${email}`);
  return cookie;
}

async function spin(cookie: string): Promise<{ amount: number; segmentIndex: number }> {
  const res = await fetch(`${BASE_URL}/api/spin`, {
    method: "POST",
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Spin failed: ${(data as { error?: string }).error || res.statusText}`);
  }
  const amount = Number((data as { amount?: number }).amount);
  const segmentIndex = Number((data as { segmentIndex?: number }).segmentIndex);
  if (!Number.isInteger(amount) || ![100000, 200000, 500000].includes(amount)) {
    throw new Error(`Invalid spin result: ${JSON.stringify(data)}`);
  }
  return { amount, segmentIndex };
}

async function resetPool(adminEmail: string): Promise<void> {
  const cookie = await login(adminEmail);
  const res = await fetch(`${BASE_URL}/api/admin/reset`, {
    method: "POST",
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Reset failed: ${(data as { error?: string }).error || res.statusText}`);
  }
  console.log("  [OK] Đã reset pool và xóa kết quả cũ.\n");
}

type ResultRow = { email: string; amount: number; label: string };

async function checkServer(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/session`, { redirect: "manual" });
  } catch {
    console.error(`\nKhông kết nối được server tại ${BASE_URL}`);
    console.error("Hãy chạy server trước: npm run dev");
    console.error("Nếu chạy port khác, set BASE_URL, ví dụ: $env:BASE_URL=\"http://localhost:3001\"; npm run e2e:spin\n");
    process.exit(1);
  }
}

async function main() {
  await checkServer();

  const emails = process.env.E2E_EMAILS
    ? process.env.E2E_EMAILS.split(/[,\s\n]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)
    : E2E_EMAILS_45;

  if (emails.length !== 45) {
    console.warn(`Cảnh báo: đang dùng ${emails.length} email (khuyến nghị 45).\n`);
  }

  const resetAdmin = process.env.E2E_RESET_ADMIN_EMAIL?.trim();
  if (resetAdmin) {
    console.log("Reset pool trước khi quay (admin:", resetAdmin, ")...");
    await resetPool(resetAdmin);
  }

  console.log("Bắt đầu quay lần lượt", emails.length, "tài khoản...\n");
  const results: ResultRow[] = [];
  let failed = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const n = i + 1;
    try {
      const cookie = await login(email);
      const { amount } = await spin(cookie);
      const label = amount === 100000 ? "100k" : amount === 200000 ? "200k" : "500k";
      results.push({ email, amount, label });
      process.stdout.write(`  [${n}/${emails.length}] ${email} → ${label}\n`);
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      process.stdout.write(`  [${n}/${emails.length}] ${email} → LỖI: ${msg}\n`);
    }
  }

  console.log("\n--- Kết quả ---");
  const count100k = results.filter((r) => r.amount === 100000).length;
  const count200k = results.filter((r) => r.amount === 200000).length;
  const count500k = results.filter((r) => r.amount === 500000).length;

  console.table(results);
  console.log("Phân bố: 100k =", count100k, ", 200k =", count200k, ", 500k =", count500k);
  console.log("Thành công:", results.length, ", Lỗi:", failed);

  const expect100 = 15;
  const expect200 = 25;
  const expect500 = 5;
  const fullRun = emails.length === 45 && results.length === 45 && failed === 0;
  const ok =
    fullRun &&
    count100k === expect100 &&
    count200k === expect200 &&
    count500k === expect500;

  if (ok) {
    console.log("\n[PASS] Thuật toán chính xác: đúng 15x100k, 25x200k, 5x500k.");
  } else if (results.length < emails.length || failed > 0) {
    console.log("\n[FAIL] Một số tài khoản lỗi hoặc chưa đủ", emails.length, "lượt.");
    process.exit(1);
  } else if (!fullRun) {
    console.log("\n[FAIL] Cần đủ 45 tài khoản quay thành công (hiện tại:", results.length, ").");
    process.exit(1);
  } else {
    console.log(
      "\n[FAIL] Phân bố sai: mong đợi 15/25/5, thực tế",
      count100k + "/" + count200k + "/" + count500k
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
