"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg border-2 border-[#c41e3a]/50 text-[#9b1528] text-sm font-medium hover:bg-[#fff9e6] hover:border-[#d4af37] disabled:opacity-60 transition"
    >
      {loading ? "Đang thoát..." : "Đăng xuất"}
    </button>
  );
}
