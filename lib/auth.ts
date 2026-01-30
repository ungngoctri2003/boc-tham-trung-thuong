import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "lucky_wheel_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me"
);

// User thường: chỉ đăng nhập + quay. Cấu hình: ALLOWED_EMAILS="a@dssolution.jp,b@dssolution.jp"
const ALLOWED_EMAILS: string[] = (process.env.ALLOWED_EMAILS || "")
  .split(/[,\s\n]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Admin: đăng nhập + quay + vào trang admin (danh sách kết quả). Cấu hình: ADMIN_EMAILS="admin@dssolution.jp"
const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || "")
  .split(/[,\s\n]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Chỉ những email này mới thấy và gọi được nút "Xóa hết & reset pool" (thường là subset của ADMIN_EMAILS).
const RESET_ADMIN_EMAILS: string[] = (process.env.RESET_ADMIN_EMAILS || "")
  .split(/[,\s\n]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Danh sách email được phép quay (chỉ dùng server-side, ví dụ trang admin danh sách người dùng). */
export function getAllowedEmails(): string[] {
  return [...ALLOWED_EMAILS];
}

/** Được đăng nhập: có trong ALLOWED_EMAILS (user thường) hoặc ADMIN_EMAILS (admin). */
export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    ALLOWED_EMAILS.includes(normalized) ||
    ADMIN_EMAILS.includes(normalized)
  );
}

/** Chỉ admin mới vào được trang admin (xem/sửa danh sách kết quả). */
export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(normalized);
}

/** Được quay: có trong danh sách quay (ALLOWED_EMAILS) và không phải admin. Admin chỉ quản trị, không tham gia quay. */
export function canSpin(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (isAdminEmail(normalized)) return false;
  return ALLOWED_EMAILS.includes(normalized);
}

/** Chỉ những email trong RESET_ADMIN_EMAILS mới thấy và gọi được API reset pool. */
export function canResetPool(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (RESET_ADMIN_EMAILS.length === 0) return false;
  return RESET_ADMIN_EMAILS.includes(normalized);
}

export async function createSession(email: string): Promise<string> {
  const token = await new SignJWT({ email: email.trim().toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const email = payload.email as string;
    return email ? { email } : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
