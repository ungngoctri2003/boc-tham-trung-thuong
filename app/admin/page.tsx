import { redirect } from "next/navigation";
import { getSession, isAdminEmail, canResetPool } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import ResultsTable from "@/components/ResultsTable";
import AdminResetButton from "@/components/AdminResetButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    redirect("/");
  }
  const results = await prisma.spinResult.findMany({
    orderBy: { spinTime: "asc" },
  });
  const rows = results.map((r) => ({
    id: r.id,
    email: r.email,
    amount: r.amount,
    spinTime: r.spinTime,
  }));
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold tet-text-gold">
          Danh sách kết quả vòng quay
        </h1>
        <div className="flex gap-3 items-center flex-wrap">
          {canResetPool(session.email) && <AdminResetButton />}
          <span className="text-sm text-[#9b1528] font-medium">{session.email}</span>
          <LogoutButton />
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
      <p className="text-[#9b1528]/90 text-sm mb-4">
        email | mệnh giá (VND) | thời gian — Dùng cho kế toán tổng hợp. Có thể thêm, sửa, xóa từng dòng. Lọc và xuất CSV/Excel theo bộ lọc.
      </p>
      <ResultsTable results={rows} />
    </main>
  );
}
