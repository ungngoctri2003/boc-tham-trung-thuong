import { NextResponse } from "next/server";
import { getSession, isAdminEmail, canResetPool } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json(
      { error: "Không có quyền truy cập." },
      { status: 403 }
    );
  }
  if (!canResetPool(session.email)) {
    return NextResponse.json(
      { error: "Chỉ email trong RESET_ADMIN_EMAILS mới được reset pool." },
      { status: 403 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.spinResult.deleteMany(),
      prisma.prizePool.deleteMany(),
    ]);
    return NextResponse.json({
      success: true,
      message: "Đã xóa hết kết quả và reset pool. Lần quay tiếp theo sẽ tạo lại 45 giải.",
    });
  } catch (e) {
    console.error("[admin/reset]", e);
    return NextResponse.json(
      { error: "Lỗi khi reset." },
      { status: 500 }
    );
  }
}
