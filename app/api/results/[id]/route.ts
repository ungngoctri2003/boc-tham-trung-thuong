import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: { id?: string } };

function getId(context: RouteContext): number {
  const raw = context.params?.id ?? "";
  const id = parseInt(raw, 10);
  if (Number.isNaN(id)) throw new Error("ID không hợp lệ");
  return id;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json(
      { error: "Không có quyền truy cập." },
      { status: 403 }
    );
  }

  const id = getId(context);
  let body: { email?: string; amount?: number; spinTime?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }

  const data: { email?: string; amount?: number; spinTime?: Date } = {};
  if (typeof body.email === "string" && body.email.trim()) {
    data.email = body.email.trim();
  }
  if (typeof body.amount === "number" && body.amount > 0) {
    data.amount = body.amount;
  }
  if (typeof body.spinTime === "string" && body.spinTime) {
    const t = new Date(body.spinTime);
    if (!Number.isNaN(t.getTime())) data.spinTime = t;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Cần ít nhất một trường để cập nhật." },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.spinResult.update({
      where: { id },
      data,
    });
    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      amount: updated.amount,
      spinTime: updated.spinTime,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Không tìm thấy kết quả hoặc lỗi cập nhật." },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json(
      { error: "Không có quyền truy cập." },
      { status: 403 }
    );
  }

  const id = getId(context);

  try {
    await prisma.spinResult.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy kết quả để xóa." },
      { status: 404 }
    );
  }
}
