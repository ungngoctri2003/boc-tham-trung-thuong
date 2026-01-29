import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pickRandomAmount } from "@/lib/wheel";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập bằng email công ty." },
      { status: 401 }
    );
  }
  const existing = await prisma.spinResult.findFirst({
    where: { email: session.email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Mỗi người chỉ được quay một lần." },
      { status: 403 }
    );
  }
  const amount = pickRandomAmount();
  const spinTime = new Date();
  await prisma.spinResult.create({
    data: {
      email: session.email,
      amount,
      spinTime,
    },
  });
  return NextResponse.json({ amount, spinTime: spinTime.toISOString() });
}
