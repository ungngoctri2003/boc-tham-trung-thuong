import { redirect } from "next/navigation";
import { getSession, isAdminEmail, getAllowedEmails } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import UsersTable from "@/components/UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    redirect("/");
  }
  const allowedEmails = getAllowedEmails();
  const results = await prisma.spinResult.findMany({
    where: { email: { in: allowedEmails } },
    orderBy: { spinTime: "asc" },
  });
  const resultByEmail = new Map(
    results.map((r) => [r.email.toLowerCase(), r])
  );
  const rows = allowedEmails.map((email) => {
    const spin = resultByEmail.get(email.toLowerCase());
    return {
      email,
      hasSpun: !!spin,
      amount: spin?.amount ?? null,
      spinTime: spin?.spinTime ?? null,
    };
  });
  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tet-text-gold">
          Danh sách người dùng
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-[#9b1528] font-medium truncate max-w-[160px] sm:max-w-none" title={session.email}>{session.email}</span>
          <LogoutButton />
          <Link href="/admin" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] text-sm font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition whitespace-nowrap">
            Kết quả
          </Link>
          <Link href="/" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] text-sm font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition whitespace-nowrap">
            Trang chủ
          </Link>
        </div>
      </div>
      <p className="text-[#9b1528]/90 text-xs sm:text-sm mb-4 break-words">
        Danh sách người được phép quay (ALLOWED_EMAILS) và trạng thái đã quay hay chưa.
      </p>
      <UsersTable users={rows} />
    </main>
  );
}
