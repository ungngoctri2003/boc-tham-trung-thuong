"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminResetButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (
      !confirm(
        "Bạn có chắc muốn XÓA HẾT kết quả và reset pool 45 giải?\nMọi người sẽ được quay lại từ đầu. Hành động này không hoàn tác."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Lỗi khi reset.");
        return;
      }
      alert(data.message ?? "Đã reset xong.");
      router.refresh();
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={loading}
      className="rounded-xl bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50 border-2 border-amber-500/50 shadow-lg transition whitespace-nowrap"
    >
      {loading ? "Đang xử lý…" : "Xóa hết & reset pool"}
    </button>
  );
}
