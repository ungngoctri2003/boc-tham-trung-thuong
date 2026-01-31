"use client";

import Fireworks from "./Fireworks";
import { formatAmount } from "@/lib/wheel";

type Props = {
  amount: number;
  onClose: () => void;
};

export default function CongratulationsPopup({ amount, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <Fireworks />
      <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm animate-popup-in rounded-2xl border-2 border-[#d4af37]/60 bg-white p-5 sm:p-8 shadow-2xl">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#c41e3a]">
            Chúc mừng
          </p>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-[#9b1528] break-words">
            Bạn trúng {formatAmount(amount)} VND
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-amber-800/80">
            Lì xì đầu xuân • May mắn cả năm
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 sm:mt-6 w-full rounded-xl bg-gradient-to-b from-[#c41e3a] to-[#9b1528] px-4 py-3 sm:px-6 font-bold text-sm sm:text-base text-white shadow-lg hover:from-[#d42a45] hover:to-[#b01830] transition"
          >
            Xem kết quả
          </button>
        </div>
      </div>
    </div>
  );
}
