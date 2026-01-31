"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 min-w-0">
      <div className="min-w-0">
        <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-[#9b1528] mb-1">
          Email công ty (@dssolution.jp)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@dssolution.jp"
          required
          className="w-full min-w-0 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-[#d4af37]/50 bg-[#fff9e6]/50 text-[#1f0a0a] placeholder-amber-600/50 focus:ring-2 focus:ring-[#d4af37] focus:border-[#c41e3a] transition"
        />
      </div>
      {error && <p className="text-red-600 text-xs sm:text-sm font-medium break-words">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-b from-[#c41e3a] to-[#9b1528] hover:from-[#d42a45] hover:to-[#b01830] disabled:opacity-50 border-2 border-[#d4af37]/40 shadow-lg transition hover:scale-[1.02] active:scale-100"
      >
        {loading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}
