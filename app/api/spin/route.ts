import { NextResponse } from "next/server";
import { getSession, canSpin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildShuffledPool } from "@/lib/wheel";

type PrizeRow = { id: number; amount: number; segment_index: number };

function runSpinTransaction(session: { email: string }) {
  const spinTime = new Date();
  return prisma.$transaction(async (tx) => {
    const existing = await tx.spinResult.findFirst({
      where: { email: session.email },
    });
    if (existing) {
      const err = new Error("ALREADY_SPUN") as Error & { code?: string };
      err.code = "ALREADY_SPUN";
      throw err;
    }

    const poolCount = await tx.prizePool.count();
    if (poolCount === 0) {
      // Chỉ một transaction được tạo pool: dùng advisory lock tránh race khi 45 user quay đồng thời.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(707070)`;
      const poolCountAgain = await tx.prizePool.count();
      if (poolCountAgain === 0) {
        const pool = buildShuffledPool();
        await tx.prizePool.createMany({
          data: pool.map((p) => ({
            amount: p.amount,
            segmentIndex: p.segmentIndex,
          })),
        });
      }
    }

    const rows = await tx.$queryRaw<PrizeRow[]>`
      SELECT id, amount, segment_index FROM prize_pool
      WHERE assigned_email IS NULL
      ORDER BY id ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;
    const nextPrize = rows[0];
    if (!nextPrize) {
      const err = new Error("NO_PRIZE") as Error & { code?: string };
      err.code = "NO_PRIZE";
      throw err;
    }

    await tx.spinResult.create({
      data: {
        email: session.email,
        amount: nextPrize.amount,
        spinTime,
      },
    });
    await tx.prizePool.update({
      where: { id: nextPrize.id },
      data: {
        assignedEmail: session.email,
        assignedAt: spinTime,
      },
    });

    return {
      amount: nextPrize.amount,
      segmentIndex: nextPrize.segment_index,
      spinTime,
    };
  }, { timeout: 20000 });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập bằng email công ty." },
      { status: 401 }
    );
  }
  if (!canSpin(session.email)) {
    return NextResponse.json(
      { error: "Tài khoản admin không tham gia quay. Chỉ thành viên trong danh sách quay mới được quay." },
      { status: 403 }
    );
  }

  try {
    const result = await runSpinTransaction(session);
    return NextResponse.json({
      amount: result.amount,
      segmentIndex: result.segmentIndex,
      spinTime: result.spinTime.toISOString(),
    });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "ALREADY_SPUN") {
      return NextResponse.json(
        { error: "Mỗi người chỉ được quay một lần." },
        { status: 403 }
      );
    }
    if (code === "NO_PRIZE") {
      return NextResponse.json(
        { error: "Đã hết giải. Chúc bạn may mắn lần sau!" },
        { status: 403 }
      );
    }
    console.error("[spin] Transaction error:", e);
    return NextResponse.json(
      { error: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
