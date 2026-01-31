"use client";

import Fireworks from "./Fireworks";
import { formatAmount } from "@/lib/wheel";

type Props = {
  amount: number;
  onClose: () => void;
};

export default function CongratulationsPopup({ amount, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4">
      <Fireworks />
      <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm animate-popup-in rounded-2xl tet-card p-1.5 sm:p-2 shadow-2xl">
        <div className="tet-card-inner rounded-xl p-5 sm:p-8 text-center">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#c41e3a]">
            Chúc mừng năm mới
          </p>
          <p className="mt-3 text-sm text-amber-800/90 font-medium">Bạn trúng</p>
          <div className="tet-amount-box mt-1 text-lg sm:text-xl">
            {formatAmount(amount)} VND
          </div>
          <p className="mt-3 text-xs sm:text-sm text-amber-800/80">
            Lì xì đầu xuân • May mắn cả năm
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-gradient-to-b from-[#c41e3a] to-[#9b1528] px-4 py-3 sm:px-6 font-bold text-sm sm:text-base text-white shadow-lg border-2 border-[#d4af37]/40 hover:from-[#d42a45] hover:to-[#b01830] hover:shadow-xl hover:shadow-[#c41e3a]/25 transition"
          >
            Xem kết quả
          </button>
        </div>
      </div>
    </div>
  );
}
