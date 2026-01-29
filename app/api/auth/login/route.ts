import { NextResponse } from "next/server";
import { isAllowedEmail, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập email." },
        { status: 400 }
      );
    }
    if (!isAllowedEmail(email)) {
      return NextResponse.json(
        { error: "Vui lòng nhập email công ty (@dssolution.jp)." },
        { status: 403 }
      );
    }
    const token = await createSession(email);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Lỗi đăng nhập." },
      { status: 500 }
    );
  }
}
