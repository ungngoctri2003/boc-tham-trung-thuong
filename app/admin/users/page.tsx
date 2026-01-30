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
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold tet-text-gold">
          Danh sách người dùng
        </h1>
        <div className="flex gap-3 items-center flex-wrap">
          <span className="text-sm text-[#9b1528] font-medium">{session.email}</span>
          <LogoutButton />
          <Link
            href="/admin"
            className="px-4 py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition"
          >
            Danh sách kết quả
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
      <p className="text-[#9b1528]/90 text-sm mb-4">
        Danh sách người được phép quay (ALLOWED_EMAILS) và trạng thái đã quay hay chưa.
      </p>
      <UsersTable users={rows} />
    </main>
  );
}
