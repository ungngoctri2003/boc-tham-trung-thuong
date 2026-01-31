import { redirect } from "next/navigation";
import { getSession, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LoginForm from "@/components/LoginForm";
import LuckyWheel from "@/components/LuckyWheel";
import TetBackground from "@/components/TetBackground";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

function TetBanner() {
  return (
    <div className="text-center mb-3 animate-tet-shine">
      <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#c41e3a] drop-shadow-sm">
        Chúc mừng năm mới
      </p>
      <div className="tet-divider my-2" />
      <p className="text-xs sm:text-sm text-amber-800/90 font-medium">Lì xì đầu xuân • May mắn cả năm</p>
    </div>
  );
}

function TetHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-5 sm:mb-6">
      <TetBanner />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tet-text-gold drop-shadow-sm break-words">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[#9b1528]/90 mt-1.5 text-sm font-medium">{subtitle}</p>
      )}
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden tet-bg">
        <TetBackground />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-14 h-20 rounded-full bg-[#c41e3a]/20 blur-2xl animate-tet-float" />
          <div className="absolute top-20 right-16 w-12 h-16 rounded-full bg-[#d4af37]/25 blur-2xl animate-tet-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-24 left-1/4 w-10 h-14 rounded-full bg-[#d4af37]/20 blur-xl animate-tet-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 right-8 w-6 h-6 rounded-full bg-[#d4af37]/30 blur-md animate-tet-float" style={{ animationDelay: "0.3s" }} />
          <div className="absolute bottom-1/3 left-12 w-5 h-5 rounded-full bg-[#c41e3a]/15 blur-md animate-tet-float" style={{ animationDelay: "0.8s" }} />
        </div>
        <div className="relative z-10 w-full max-w-md px-1">
          <TetHeader
            title="Vòng quay may mắn"
            subtitle="Lì xì đầu năm • Chỉ dành cho DS Solution"
          />
          <div className="tet-card rounded-2xl p-1.5 sm:p-2 animate-tet-glow">
            <div className="tet-card-inner rounded-xl p-5 sm:p-6">
              <LoginForm />
            </div>
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
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden tet-bg">
        <TetBackground />
        <div className="absolute top-3 right-3 left-3 sm:left-auto flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm text-[#9b1528] font-medium z-10">
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
        <div className="relative z-10 text-center max-w-md mt-12 sm:mt-0">
          <TetHeader title="Tài khoản admin" subtitle={session.email} />
          <div className="tet-card rounded-2xl p-1.5 sm:p-2">
            <div className="tet-card-inner rounded-xl p-5 sm:p-6 text-left">
              <p className="text-[#1f0a0a] mt-0 leading-relaxed">
                Bạn là admin, không tham gia quay. Chỉ thành viên trong danh sách quay mới được quay.
              </p>
              <p className="text-amber-800/90 mt-3 text-sm font-medium">Vào Danh sách kết quả để xem và quản lý.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (existing) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden tet-bg">
        <TetBackground />
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
        <div className="relative z-10 text-center max-w-md mt-12 sm:mt-0">
          <TetHeader title="Bạn đã quay rồi" />
          <div className="tet-card rounded-2xl p-1.5 sm:p-2">
            <div className="tet-card-inner rounded-xl p-5 sm:p-6">
              <p className="text-[#1f0a0a] mt-0">
                Bạn đã trúng{" "}
                <span className="tet-amount-box">
                  {existing.amount >= 1000
                    ? `${(existing.amount / 1000).toFixed(0)}.000`
                    : existing.amount}{" "}
                  VND
                </span>
                <span className="block mt-2 text-sm text-[#9b1528]/80">lúc {new Date(existing.spinTime).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
              </p>
              <p className="text-amber-800/90 mt-4 text-sm font-medium">Mỗi người chỉ được quay một lần.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden tet-bg">
      <TetBackground />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 right-20 w-16 h-20 rounded-full bg-[#c41e3a]/15 blur-2xl animate-tet-float" />
        <div className="absolute bottom-32 left-20 w-12 h-16 rounded-full bg-[#d4af37]/20 blur-2xl animate-tet-float" style={{ animationDelay: "0.7s" }} />
        <div className="absolute top-1/4 left-10 w-6 h-6 rounded-full bg-[#d4af37]/25 blur-md animate-tet-float" style={{ animationDelay: "0.2s" }} />
        <div className="absolute bottom-1/4 right-12 w-5 h-5 rounded-full bg-[#c41e3a]/12 blur-md animate-tet-float" style={{ animationDelay: "0.5s" }} />
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
