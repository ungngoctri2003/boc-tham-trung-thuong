"use client";

import { useState, useMemo } from "react";
import { formatAmount } from "@/lib/wheel";

const PAGE_SIZE = 15;

export type UserRow = {
  email: string;
  hasSpun: boolean;
  amount: number | null;
  /** ISO string when passed from server to client */
  spinTime: Date | string | null;
};

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [filterEmail, setFilterEmail] = useState("");
  const [filterSpun, setFilterSpun] = useState<"" | "yes" | "no">("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterEmail) {
        if (!u.email.toLowerCase().includes(filterEmail.toLowerCase()))
          return false;
      }
      if (filterSpun === "yes" && !u.hasSpun) return false;
      if (filterSpun === "no" && u.hasSpun) return false;
      return true;
    });
  }, [users, filterEmail, filterSpun]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
      ),
    [filteredUsers, safePage]
  );

  const spunCount = users.filter((u) => u.hasSpun).length;
  const notSpunCount = users.length - spunCount;

  return (
    <>
      <div className="mb-4 rounded-xl border-2 border-[#d4af37]/40 bg-[#fff9e6]/60 p-4">
        <p className="mb-3 text-sm font-semibold text-[#9b1528]">Lọc</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="filter-email"
              className="mb-1 block text-xs font-medium text-[#9b1528]"
            >
              Email
            </label>
            <input
              id="filter-email"
              type="text"
              placeholder="Chứa..."
              value={filterEmail}
              onChange={(e) => {
                setFilterEmail(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border-2 border-[#d4af37]/40 bg-white/80 px-2 py-1.5 text-sm w-56 focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
          <div>
            <label
              htmlFor="filter-spun"
              className="mb-1 block text-xs font-medium text-[#9b1528]"
            >
              Đã quay
            </label>
            <select
              id="filter-spun"
              value={filterSpun}
              onChange={(e) => {
                setFilterSpun(
                  e.target.value === "yes"
                    ? "yes"
                    : e.target.value === "no"
                      ? "no"
                      : ""
                );
                setCurrentPage(1);
              }}
              className="rounded-lg border-2 border-[#d4af37]/40 bg-white/80 px-2 py-1.5 text-sm focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            >
              <option value="">Tất cả</option>
              <option value="yes">Đã quay</option>
              <option value="no">Chưa quay</option>
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#9b1528]/90">
          Tổng {users.length} người — Đã quay: {spunCount} — Chưa quay:{" "}
          {notSpunCount}
          {filterEmail || filterSpun
            ? ` — Lọc còn ${filteredUsers.length}`
            : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-[#d4af37]/40 bg-white shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#fff9e6] text-[#9b1528]">
            <tr>
              <th className="px-4 py-3 font-bold w-12">#</th>
              <th className="px-4 py-3 font-bold">Email</th>
              <th className="px-4 py-3 font-bold w-28">Đã quay</th>
              <th className="px-4 py-3 font-bold">Mệnh giá (VND)</th>
              <th className="px-4 py-3 font-bold">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[#9b1528] font-medium"
                >
                  {users.length === 0
                    ? "Chưa có người dùng nào trong danh sách (ALLOWED_EMAILS)."
                    : "Không có kết quả trùng bộ lọc."}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u, i) => (
                <tr
                  key={u.email}
                  className="border-t border-[#d4af37]/30 hover:bg-[#fff9e6]/50"
                >
                  <td className="px-4 py-3 text-[#9b1528]/80">
                    {(safePage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.hasSpun ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        Đã quay
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        Chưa quay
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.amount != null ? formatAmount(u.amount) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#9b1528]/90">
                    {u.spinTime != null && u.spinTime !== ""
                      ? new Date(u.spinTime).toLocaleString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border-2 border-[#d4af37]/50 px-3 py-1.5 text-sm font-medium text-[#9b1528] hover:bg-[#fff9e6] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <span className="px-2 text-sm text-[#9b1528] font-medium">
            Trang {safePage} / {totalPages}
            {" — "}
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredUsers.length)} /{" "}
            {filteredUsers.length}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={safePage >= totalPages}
            className="rounded-lg border-2 border-[#d4af37]/50 px-3 py-1.5 text-sm font-medium text-[#9b1528] hover:bg-[#fff9e6] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang sau
          </button>
        </div>
      )}
    </>
  );
}
