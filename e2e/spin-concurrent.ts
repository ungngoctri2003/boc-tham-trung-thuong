/**
 * E2E: Test quay đồng thời (concurrent) – 45 user quay cùng lúc, kiểm tra mỗi người một giải và phân bố 15/25/5.
 *
 * Yêu cầu:
 * - Server chạy (npm run dev), BASE_URL đúng (mặc định http://localhost:3000)
 * - .env: ALLOWED_EMAILS chứa đủ 45 email
 * - Nên reset pool trước khi chạy: set E2E_RESET_ADMIN_EMAIL=admin@dssolution.jp
 *
 * Chạy: npx tsx e2e/spin-concurrent.ts
 * Hoặc: npm run e2e:spin:concurrent
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CONCURRENT_COUNT = Math.min(parseInt(process.env.E2E_CONCURRENT_COUNT || "45", 10) || 45, 45);

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
  console.log("  [OK] Đã reset pool.\n");
}

async function checkServer(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/session`, { redirect: "manual" });
  } catch {
    console.error(`\nKhông kết nối được server tại ${BASE_URL}`);
    console.error("Hãy chạy server trước: npm run dev\n");
    process.exit(1);
  }
}

async function main() {
  await checkServer();

  const emails = process.env.E2E_EMAILS
    ? process.env.E2E_EMAILS.split(/[,\s\n]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)
    : E2E_EMAILS_45;

  const resetAdmin = process.env.E2E_RESET_ADMIN_EMAIL?.trim();
  if (resetAdmin) {
    console.log("Reset pool trước khi test (admin:", resetAdmin, ")...");
    await resetPool(resetAdmin);
  }

  const n = Math.min(CONCURRENT_COUNT, emails.length);
  const concurrentEmails = emails.slice(0, n);
  if (concurrentEmails.length < n) {
    console.error("Cần ít nhất", n, "email trong danh sách. Hiện có", concurrentEmails.length);
    process.exit(1);
  }

  console.log("--- " + n + " user quay đồng thời ---");
  const loginAndSpin = async (email: string) => {
    const cookie = await login(email);
    const result = await spin(cookie);
    return { email, ...result };
  };

  const results = await Promise.all(concurrentEmails.map((email) => loginAndSpin(email)));
  const successCount = results.length;
  const distinctEmails = new Set(results.map((r) => r.email)).size;
  const allValidAmounts = results.every((r) => [100000, 200000, 500000].includes(r.amount));

  const count100k = results.filter((r) => r.amount === 100000).length;
  const count200k = results.filter((r) => r.amount === 200000).length;
  const count500k = results.filter((r) => r.amount === 500000).length;
  const distributionOk = n === 45 && count100k === 15 && count200k === 25 && count500k === 5;

  if (successCount === n && distinctEmails === n && allValidAmounts) {
    console.log("  [PASS] Tất cả", n, "request thành công, mỗi user một giải, không trùng.");
  } else {
    console.log("  [FAIL] successCount=" + successCount + ", distinctEmails=" + distinctEmails + ", allValidAmounts=" + allValidAmounts);
    process.exit(1);
  }

  if (n === 45) {
    console.log("  Phân bố: 100k =", count100k, ", 200k =", count200k, ", 500k =", count500k);
    if (distributionOk) {
      console.log("  [PASS] Phân bố đúng 15/25/5.");
    } else {
      console.log("  [FAIL] Phân bố sai: mong đợi 15/25/5.");
      process.exit(1);
    }
  }

  console.log("  Kết quả:", results.map((r) => r.email + "→" + (r.amount === 100000 ? "100k" : r.amount === 200000 ? "200k" : "500k")).join(", "));
  console.log("\n[PASS] Test concurrent thành công.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
