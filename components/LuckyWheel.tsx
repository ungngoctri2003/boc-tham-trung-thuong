"use client";

import { useCallback, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { WHEEL_SEGMENTS, getSegmentsForDisplay } from "@/lib/wheel";
import CongratulationsPopup from "./CongratulationsPopup";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

const RED = "#c41e3a";
const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d76e";

/** Màu cho từng segment: không bao giờ để 2 màu đỏ cạnh nhau (kể cả segment cuối cạnh segment đầu). */
function getSegmentColors(count: number): string[] {
  const colors: string[] = [];
  const golds = [GOLD, GOLD_LIGHT];
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const firstIsRed = colors[0] === RED;
    if (isLast && firstIsRed) {
      colors.push(golds[(count - 1) % 2]);
    } else if (i % 2 === 0) {
      colors.push(RED);
    } else {
      colors.push(golds[(i >> 1) % 2]);
    }
  }
  return colors;
}

type Props = {
  onSpinComplete?: (amount: number) => void;
  disabled?: boolean;
};

export default function LuckyWheel({ onSpinComplete, disabled }: Props) {
  const segments = useMemo(() => getSegmentsForDisplay(), []);
  const colors = useMemo(() => getSegmentColors(segments.length), [segments.length]);

  const wheelData = useMemo(
    () =>
      segments.map((seg, i) => ({
        option: seg.label,
        style: { backgroundColor: colors[i], textColor: "#ffffff" },
      })),
    [segments, colors]
  );

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  const spin = useCallback(async () => {
    if (mustSpin || disabled || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Có lỗi xảy ra.");
        setLoading(false);
        return;
      }
      const amount = Number(data.amount);
      const rawIdx = data.segmentIndex;
      const segmentIdx =
        typeof rawIdx === "number" &&
        Number.isInteger(rawIdx) &&
        rawIdx >= 0 &&
        rawIdx < WHEEL_SEGMENTS.length
          ? rawIdx
          : typeof rawIdx === "string"
            ? (() => {
                const n = parseInt(rawIdx, 10);
                return Number.isInteger(n) && n >= 0 && n < WHEEL_SEGMENTS.length
                  ? n
                  : WHEEL_SEGMENTS.indexOf(amount);
              })()
            : WHEEL_SEGMENTS.indexOf(amount);

      if (segmentIdx < 0) {
        onSpinComplete?.(amount);
        setResult(amount);
        setLoading(false);
        return;
      }
      setPrizeNumber(segmentIdx);
      setMustSpin(true);
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [mustSpin, disabled, loading, onSpinComplete]);

  const handleStopSpinning = useCallback(() => {
    setMustSpin(false);
    const amount = WHEEL_SEGMENTS[prizeNumber];
    setResult(amount);
    onSpinComplete?.(amount);
  }, [prizeNumber, onSpinComplete]);

  const isBusy = mustSpin || loading;

  return (
    <div className="flex flex-col items-center gap-6 relative z-10">
      <div className="relative">
        <div
          className="rounded-full overflow-hidden shadow-2xl border-[10px] border-[#c41e3a]"
          style={{
            boxShadow: "0 0 0 4px #d4af37, 0 8px 30px rgba(0,0,0,0.2)",
          }}
        >
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData}
            onStopSpinning={handleStopSpinning}
            backgroundColors={colors}
            textColors={Array(segments.length).fill("#ffffff")}
            outerBorderColor="#c41e3a"
            outerBorderWidth={0}
            innerRadius={0}
            radiusLineColor="#d4af37"
            radiusLineWidth={2}
            fontFamily="Inter"
            fontSize={16}
            fontWeight="bold"
            spinDuration={1.32}
            pointerProps={{
              style: {
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
              },
            }}
          />
        </div>
      </div>
      {result != null && (
        <CongratulationsPopup
          amount={result}
          onClose={() => window.location.reload()}
        />
      )}
      <button
        type="button"
        onClick={spin}
        disabled={isBusy || disabled}
        className="px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-b from-[#c41e3a] to-[#9b1528] hover:from-[#d42a45] hover:to-[#b01830] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-2 border-[#d4af37]/50 hover:border-[#d4af37] transition-all hover:scale-105 active:scale-100"
      >
        {loading ? "Đang xử lý..." : mustSpin ? "Đang quay..." : "Quay ngay"}
      </button>
    </div>
  );
}
