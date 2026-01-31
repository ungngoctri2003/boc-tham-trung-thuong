"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { formatAmount } from "@/lib/wheel";

const PAGE_SIZE = 10;

const AMOUNT_OPTIONS = [
  { value: "", label: "Tất cả mệnh giá" },
  { value: 500000, label: "500.000" },
  { value: 200000, label: "200.000" },
  { value: 100000, label: "100.000" },
];

export type ResultRow = {
  id: number;
  email: string;
  amount: number;
  spinTime: Date;
};

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

export default function ResultsTable({ results }: { results: ResultRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ResultRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterAmount, setFilterAmount] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (filterEmail) {
        const email = r.email.toLowerCase();
        if (!email.includes(filterEmail.toLowerCase())) return false;
      }
      if (filterAmount) {
        const amount = parseInt(filterAmount, 10);
        if (r.amount !== amount) return false;
      }
      if (filterDateFrom) {
        const from = new Date(filterDateFrom);
        if (new Date(r.spinTime) < from) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo);
        if (new Date(r.spinTime) > to) return false;
      }
      return true;
    });
  }, [results, filterEmail, filterAmount, filterDateFrom, filterDateTo]);

  const totalFiltered = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedResults = useMemo(
    () =>
      filteredResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredResults, safePage]
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalFiltered, totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEmail, filterAmount, filterDateFrom, filterDateTo]);

  function buildExportParams(): string {
    const params = new URLSearchParams();
    if (filterEmail) params.set("email", filterEmail);
    if (filterAmount) params.set("amount", filterAmount);
    if (filterDateFrom) params.set("dateFrom", filterDateFrom);
    if (filterDateTo) params.set("dateTo", filterDateTo);
    return params.toString();
  }

  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Xóa kết quả của ${email} để cho phép người này quay lại?`)) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/results/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Lỗi khi xóa.");
        return;
      }
      router.refresh();
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const spinTime = (form.elements.namedItem("spinTime") as HTMLInputElement).value;

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/results/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          spinTime: spinTime ? new Date(spinTime).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lỗi khi cập nhật.");
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border-2 border-red-200 px-4 py-2 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="mb-4 rounded-xl border-2 border-[#d4af37]/40 bg-[#fff9e6]/60 p-3 sm:p-4">
        <p className="mb-3 text-xs sm:text-sm font-semibold text-[#9b1528]">Lọc</p>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-end gap-3">
          <div className="min-w-0">
            <label htmlFor="filter-email" className="mb-1 block text-xs font-medium text-[#9b1528]">Email</label>
            <input
              id="filter-email"
              type="text"
              placeholder="Chứa..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="rounded-lg border-2 border-[#d4af37]/40 bg-white/80 px-2 py-1.5 text-sm w-full sm:w-48 focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="filter-amount" className="mb-1 block text-xs font-medium text-[#9b1528]">Mệnh giá</label>
            <select
              id="filter-amount"
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="rounded-lg border-2 border-[#d4af37]/40 bg-white/80 px-2 py-1.5 text-sm w-full sm:w-auto focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            >
              {AMOUNT_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="filter-dateFrom" className="mb-1 block text-xs font-medium text-[#9b1528]">Từ ngày</label>
            <input
              id="filter-dateFrom"
              type="datetime-local"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="rounded-lg border-2 border-[#d4af37]/40 bg-white/80 px-2 py-1.5 text-sm w-full sm:w-auto focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="filter-dateTo" className="mb-1 block text-xs font-medium text-[#9b1528]">Đến ngày</label>
            <input
              id="filter-dateTo"
              type="datetime-local"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="rounded-lg border-2 border-[#d4af37]/40 bg-white/80 px-2 py-1.5 text-sm w-full sm:w-auto focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[#9b1528]/90">
          {results.length === 0
            ? "Chưa có kết quả."
            : `Tổng ${results.length} kết quả${filterEmail || filterAmount || filterDateFrom || filterDateTo ? `, lọc còn ${totalFiltered}` : ""}`}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <a
          href={`/api/results?export=csv${buildExportParams() ? `&${buildExportParams()}` : ""}`}
          download="ket-qua-vong-quay.csv"
          className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-b from-[#c41e3a] to-[#9b1528] px-4 py-2 text-sm font-bold text-white hover:from-[#d42a45] hover:to-[#b01830] border-2 border-[#d4af37]/40 shadow-lg transition"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0 rounded-xl border-2 border-[#d4af37]/40 bg-white shadow-xl">
        <table className="w-full text-left min-w-[580px]">
          <thead className="bg-[#fff9e6] text-[#9b1528]">
            <tr>
              <th className="px-2 py-2 sm:px-4 sm:py-3 font-bold w-10 sm:w-12 text-xs sm:text-base">#</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 font-bold text-xs sm:text-base">Email</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 font-bold text-xs sm:text-base">Mệnh giá (VND)</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 font-bold text-xs sm:text-base">Thời gian</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3 font-bold w-24 sm:w-28 text-xs sm:text-base">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-6 sm:px-4 text-center text-xs sm:text-sm text-[#9b1528] font-medium">
                  {results.length === 0 ? "Chưa có kết quả nào." : "Không có kết quả nào trùng bộ lọc."}
                </td>
              </tr>
            ) : (
              paginatedResults.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-t border-[#d4af37]/30 hover:bg-[#fff9e6]/50"
                >
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-base text-[#9b1528]/80">
                    {(safePage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-base break-all">{r.email}</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-base font-medium">
                    {formatAmount(r.amount)}
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-base text-[#9b1528]/90 whitespace-nowrap">
                    {new Date(r.spinTime).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        disabled={loading}
                        className="rounded-lg border-2 border-[#c41e3a]/60 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm font-medium text-[#9b1528] hover:bg-[#fff9e6] disabled:opacity-50"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id, r.email)}
                        disabled={loading || deletingId === r.id}
                        className="rounded-lg bg-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === r.id ? "…" : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalFiltered > 0 && totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border-2 border-[#d4af37]/50 px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-[#9b1528] hover:bg-[#fff9e6] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="px-1 sm:px-2 text-xs sm:text-sm text-[#9b1528] font-medium">
            Trang {safePage} / {totalPages}
            {" — "}
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalFiltered)} / {totalFiltered}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg border-2 border-[#d4af37]/50 px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-[#9b1528] hover:bg-[#fff9e6] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
          onClick={() => !loading && setEditing(null)}
          aria-label="Đóng"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-title"
        >
          <div
            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md rounded-2xl bg-white border-2 border-[#d4af37]/40 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-title" className="mb-4 text-lg font-bold tet-text-gold">
              Sửa kết quả
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-email" className="mb-1 block text-sm font-semibold text-[#9b1528]">
                  Email
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editing.email}
                  required
                  className="w-full rounded-xl border-2 border-[#d4af37]/40 px-3 py-2 focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
              <div>
                <label htmlFor="edit-amount" className="mb-1 block text-sm font-semibold text-[#9b1528]">
                  Mệnh giá (VND)
                </label>
                <input
                  id="edit-amount"
                  type="text"
                  value={formatAmount(editing.amount)}
                  readOnly
                  className="w-full rounded-xl border-2 border-[#d4af37]/40 px-3 py-2 bg-gray-100 text-[#9b1528] cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="edit-spinTime" className="mb-1 block text-sm font-semibold text-[#9b1528]">
                  Thời gian
                </label>
                <input
                  id="edit-spinTime"
                  name="spinTime"
                  type="datetime-local"
                  defaultValue={toDatetimeLocal(new Date(editing.spinTime))}
                  className="w-full rounded-xl border-2 border-[#d4af37]/40 px-3 py-2 focus:border-[#c41e3a] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => !loading && setEditing(null)}
                  className="rounded-lg border-2 border-[#c41e3a]/50 px-4 py-2 text-[#9b1528] font-medium hover:bg-[#fff9e6]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-b from-[#c41e3a] to-[#9b1528] px-4 py-2 font-bold text-white hover:from-[#d42a45] hover:to-[#b01830] disabled:opacity-50 border-2 border-[#d4af37]/40"
                >
                  {loading ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
