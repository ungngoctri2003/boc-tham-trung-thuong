import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json(
      { error: "Không có quyền truy cập." },
      { status: 403 }
    );
  }
  let body: { email?: string; amount?: number; spinTime?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const amount = typeof body.amount === "number" ? body.amount : 0;
  const spinTimeStr = typeof body.spinTime === "string" ? body.spinTime : null;

  if (!email) {
    return NextResponse.json(
      { error: "Email không được để trống." },
      { status: 400 }
    );
  }
  if (![500000, 200000, 100000].includes(amount)) {
    return NextResponse.json(
      { error: "Mệnh giá phải là 500000, 200000 hoặc 100000." },
      { status: 400 }
    );
  }
  const spinTime = spinTimeStr
    ? new Date(spinTimeStr)
    : new Date();
  if (Number.isNaN(spinTime.getTime())) {
    return NextResponse.json(
      { error: "Thời gian không hợp lệ." },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.spinResult.create({
      data: { email, amount, spinTime },
    });
    return NextResponse.json({
      id: created.id,
      email: created.email,
      amount: created.amount,
      spinTime: created.spinTime,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Lỗi khi thêm kết quả." },
      { status: 500 }
    );
  }
}

function formatDateVi(d: Date): string {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
}

function formatAmountDisplay(amount: number): string {
  // Luôn hiển thị dạng 500.000, 200.000, 100.000 (VND)
  const thousands = amount >= 1000 ? Math.round(amount / 1000) : amount;
  return `${thousands}.000`;
}

function buildWhereFromParams(searchParams: URLSearchParams) {
  const email = searchParams.get("email")?.trim();
  const amountParam = searchParams.get("amount");
  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  const conditions: object[] = [];
  if (email) {
    conditions.push({ email: { contains: email } });
  }
  const amount = amountParam ? parseInt(amountParam, 10) : NaN;
  if (!Number.isNaN(amount) && [500000, 200000, 100000].includes(amount)) {
    conditions.push({ amount });
  }
  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(dateTo) : null;
  if (from && !Number.isNaN(from.getTime()) && to && !Number.isNaN(to.getTime())) {
    conditions.push({ spinTime: { gte: from, lte: to } });
  } else if (from && !Number.isNaN(from.getTime())) {
    conditions.push({ spinTime: { gte: from } });
  } else if (to && !Number.isNaN(to.getTime())) {
    conditions.push({ spinTime: { lte: to } });
  }
  return conditions.length ? { AND: conditions } : undefined;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json(
      { error: "Không có quyền truy cập." },
      { status: 403 }
    );
  }
  const searchParams = request.nextUrl.searchParams;
  const exportCsv = searchParams.get("export") === "csv";
  const where = buildWhereFromParams(searchParams);

  const results = await prisma.spinResult.findMany({
    where,
    orderBy: { spinTime: "asc" },
  });

  if (exportCsv) {
    const escape = (v: string) =>
      /[,"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    // Luôn bọc mệnh giá trong ngoặc kép để Excel hiển thị đúng "200.000" (không parse thành số 200)
    const quote = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = "Email,Mệnh giá (VND),Thời gian\n";
    const rows = results
      .map((r) => {
        const dateStr = formatDateVi(new Date(r.spinTime));
        const amountStr = formatAmountDisplay(r.amount);
        return `${escape(r.email)},${quote(amountStr)},${escape(dateStr)}`;
      })
      .join("\n");
    const csv = "\uFEFF" + header + rows;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ket-qua-vong-quay.csv"',
      },
    });
  }

  return NextResponse.json({
    results: results.map((r) => ({
      email: r.email,
      amount: r.amount,
      spinTime: r.spinTime,
    })),
  });
}
