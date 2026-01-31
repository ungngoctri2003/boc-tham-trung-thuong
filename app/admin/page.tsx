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
    <main className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tet-text-gold">
          Kết quả vòng quay
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {canResetPool(session.email) && <AdminResetButton />}
          <span className="text-xs sm:text-sm text-[#9b1528] font-medium truncate max-w-[160px] sm:max-w-none" title={session.email}>{session.email}</span>
          <LogoutButton />
          <Link href="/admin/users" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] text-sm font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition whitespace-nowrap">
            Người dùng
          </Link>
          <Link href="/" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] text-sm font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition whitespace-nowrap">
            Trang chủ
          </Link>
        </div>
      </div>
      <p className="text-[#9b1528]/90 text-xs sm:text-sm mb-4 break-words">
        email | mệnh giá (VND) | thời gian — Dùng cho kế toán tổng hợp. Có thể thêm, sửa, xóa từng dòng. Lọc và xuất CSV/Excel theo bộ lọc.
      </p>
      <ResultsTable results={rows} />
    </main>
  );
}
