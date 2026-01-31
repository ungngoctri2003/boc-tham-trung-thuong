import { redirect } from "next/navigation";
import { getSession, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LoginForm from "@/components/LoginForm";
import LuckyWheel from "@/components/LuckyWheel";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

function TetBanner() {
  return (
    <div className="text-center mb-2 animate-tet-shine">
      <p className="text-sm font-semibold tracking-widest uppercase text-[#c41e3a]">
        Chúc mừng năm mới
      </p>
      <p className="text-xs text-amber-800/80 mt-0.5">Lì xì đầu xuân • May mắn cả năm</p>
    </div>
  );
}

function TetHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-6">
      <TetBanner />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tet-text-gold drop-shadow-sm break-words">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[#9b1528]/90 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-10 left-10 w-12 h-16 rounded-full bg-[#c41e3a]/20 blur-xl animate-tet-float" />
          <div className="absolute top-20 right-16 w-10 h-14 rounded-full bg-[#d4af37]/25 blur-xl animate-tet-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-24 left-1/4 w-8 h-12 rounded-full bg-[#d4af37]/20 blur-xl animate-tet-float" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10 w-full max-w-md px-1">
          <TetHeader
            title="Vòng quay may mắn"
            subtitle="Lì xì đầu năm • Chỉ dành cho DS Solution"
          />
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border-2 border-[#d4af37]/40 p-6 animate-tet-glow">
            <LoginForm />
          </div>
        </div>
      </main>
    );
  }

  const existing = await prisma.spinResult.findFirst({
    where: { email: session.email },
  });

  if (!existing && isAdminEmail(session.email)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="absolute top-3 right-3 left-3 sm:left-auto flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm text-[#9b1528] font-medium">
          <span className="truncate max-w-[140px] sm:max-w-none" title={session.email}>{session.email}</span>
          <Link
            href="/admin"
            className="rounded-lg border-2 border-[#c41e3a]/50 bg-[#fff9e6] px-2 py-1 sm:px-3 sm:py-1.5 text-[#9b1528] hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition whitespace-nowrap"
          >
            Kết quả
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg border-2 border-[#c41e3a]/50 bg-[#fff9e6] px-2 py-1 sm:px-3 sm:py-1.5 text-[#9b1528] hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition whitespace-nowrap"
          >
            Người dùng
          </Link>
          <LogoutButton />
        </div>
        <div className="text-center max-w-md mt-12 sm:mt-0">
          <TetHeader title="Tài khoản admin" subtitle={session.email} />
          <div className="bg-white/90 backdrop-blur rounded-2xl border-2 border-[#d4af37]/40 p-6 shadow-xl">
            <p className="text-[#1f0a0a] mt-2">
              Bạn là admin, không tham gia quay. Chỉ thành viên trong danh sách quay mới được quay.
            </p>
            <p className="text-amber-800/80 mt-3 text-sm">Vào Danh sách kết quả để xem và quản lý.</p>
          </div>
        </div>
      </main>
    );
  }

  if (existing) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="absolute top-3 right-3 left-3 sm:left-auto flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm text-[#9b1528] font-medium">
          <span className="truncate max-w-[140px] sm:max-w-none" title={session.email}>{session.email}</span>
          {isAdminEmail(session.email) && (
            <>
              <Link href="/admin" className="rounded-lg border-2 border-[#c41e3a]/50 bg-[#fff9e6] px-2 py-1 sm:px-3 sm:py-1.5 text-[#9b1528] hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition whitespace-nowrap">Kết quả</Link>
              <Link href="/admin/users" className="rounded-lg border-2 border-[#c41e3a]/50 bg-[#fff9e6] px-2 py-1 sm:px-3 sm:py-1.5 text-[#9b1528] hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition whitespace-nowrap">Người dùng</Link>
            </>
          )}
          <LogoutButton />
        </div>
        <div className="text-center max-w-md mt-12 sm:mt-0">
          <TetHeader title="Bạn đã quay rồi" />
          <div className="bg-white/90 backdrop-blur rounded-2xl border-2 border-[#d4af37]/40 p-6 shadow-xl">
            <p className="text-[#1f0a0a] mt-2">
              Bạn đã trúng{" "}
              <strong className="text-[#c41e3a] font-extrabold">
                {existing.amount >= 1000
                  ? `${(existing.amount / 1000).toFixed(0)}.000`
                  : existing.amount}{" "}
                VND
              </strong>{" "}
              lúc {new Date(existing.spinTime).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}.
            </p>
            <p className="text-amber-800/80 mt-3 text-sm">Mỗi người chỉ được quay một lần.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-12 right-20 w-14 h-18 rounded-full bg-[#c41e3a]/15 blur-2xl animate-tet-float" />
        <div className="absolute bottom-32 left-20 w-10 h-14 rounded-full bg-[#d4af37]/20 blur-xl animate-tet-float" style={{ animationDelay: "0.7s" }} />
      </div>
      <div className="absolute top-3 right-3 left-3 sm:left-auto flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm text-[#9b1528] font-medium z-10">
        <span className="truncate max-w-[140px] sm:max-w-none" title={session.email}>{session.email}</span>
        {isAdminEmail(session.email) && (
          <>
            <Link href="/admin" className="rounded-lg border-2 border-[#c41e3a]/50 bg-[#fff9e6] px-2 py-1 sm:px-3 sm:py-1.5 text-[#9b1528] hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition whitespace-nowrap">Kết quả</Link>
            <Link href="/admin/users" className="rounded-lg border-2 border-[#c41e3a]/50 bg-[#fff9e6] px-2 py-1 sm:px-3 sm:py-1.5 text-[#9b1528] hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition whitespace-nowrap">Người dùng</Link>
          </>
        )}
        <LogoutButton />
      </div>
      <div className="relative z-10 text-center mb-2 sm:mb-4 mt-14 sm:mt-0 w-full max-w-[min(100%,420px)]">
        <TetHeader title="Vòng quay may mắn" subtitle={session.email} />
      </div>
      <LuckyWheel />
    </main>
  );
}
