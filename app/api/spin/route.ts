import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildShuffledPool } from "@/lib/wheel";

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

  const poolCount = await prisma.prizePool.count();
  if (poolCount === 0) {
    const pool = buildShuffledPool();
    await prisma.prizePool.createMany({
      data: pool.map((p) => ({
        amount: p.amount,
        segmentIndex: p.segmentIndex,
      })),
    });
  }

  const nextPrize = await prisma.prizePool.findFirst({
    where: { assignedEmail: null },
    orderBy: { id: "asc" },
  });
  if (!nextPrize) {
    return NextResponse.json(
      { error: "Đã hết giải. Chúc bạn may mắn lần sau!" },
      { status: 403 }
    );
  }

  const spinTime = new Date();
  await prisma.$transaction([
    prisma.spinResult.create({
      data: {
        email: session.email,
        amount: nextPrize.amount,
        spinTime,
      },
    }),
    prisma.prizePool.update({
      where: { id: nextPrize.id },
      data: {
        assignedEmail: session.email,
        assignedAt: spinTime,
      },
    }),
  ]);

  return NextResponse.json({
    amount: nextPrize.amount,
    segmentIndex: nextPrize.segmentIndex,
    spinTime: spinTime.toISOString(),
  });
}
