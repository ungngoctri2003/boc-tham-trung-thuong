"use client";

import { useCallback, useState } from "react";
import { WHEEL_SEGMENTS, getSegmentsForDisplay } from "@/lib/wheel";
import CongratulationsPopup from "./CongratulationsPopup";

const SEGMENTS = getSegmentsForDisplay();
const SEGMENT_ANGLE = 360 / SEGMENTS.length;

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

const COLORS = getSegmentColors(SEGMENTS.length);

type Props = {
  onSpinComplete?: (amount: number) => void;
  disabled?: boolean;
};

export default function LuckyWheel({ onSpinComplete, disabled }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const spin = useCallback(async () => {
    if (spinning || disabled) return;
    setSpinning(true);
    setResult(null);
    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Có lỗi xảy ra.");
        setSpinning(false);
        return;
      }
      const amount = data.amount as number;
      const segmentIdx = WHEEL_SEGMENTS.indexOf(amount);
      if (segmentIdx === -1) {
        onSpinComplete?.(amount);
        setSpinning(false);
        return;
      }
      const targetAngle = segmentIdx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const fullRotations = 5 + Math.random() * 2;
      const totalDeg = fullRotations * 360 + (360 - targetAngle);
      const currentNorm = ((rotation % 360) + 360) % 360;
      const finalRotation = rotation + (totalDeg - currentNorm);
      setRotation(finalRotation);
      await new Promise((r) => setTimeout(r, 10000));
      setResult(amount);
      onSpinComplete?.(amount);
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSpinning(false);
    }
  }, [spinning, disabled, rotation, onSpinComplete]);

  return (
    <div className="flex flex-col items-center gap-6 relative z-10">
      <div className="relative">
        {/* Pointer - Tet style */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-2 z-10 w-0 h-0 drop-shadow-lg"
          style={{
            borderLeft: "24px solid transparent",
            borderRight: "24px solid transparent",
            borderTop: "36px solid #c41e3a",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
          }}
        />
        {/* Wheel - Tet red & gold border */}
        <div
          className="relative w-[320px] h-[320px] rounded-full overflow-hidden shadow-2xl border-[10px] border-[#c41e3a]"
          style={{
            boxShadow: "0 0 0 4px #d4af37, 0 8px 30px rgba(0,0,0,0.2)",
            transition: spinning ? "transform 10s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {SEGMENTS.map((seg, i) => (
            <div
              key={`${i}-${seg.value}`}
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${i * SEGMENT_ANGLE}deg)`,
                clipPath: "polygon(50% 50%, 50% 0%, 100% 0%)",
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          ))}
          {SEGMENTS.map((seg, i) => {
            const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            return (
              <div
                key={`label-${i}-${seg.value}`}
                className="absolute left-1/2 top-1/2 flex items-center justify-center font-bold text-white drop-shadow pointer-events-none whitespace-nowrap"
                style={{
                  width: "35%",
                  marginLeft: "-17.5%",
                  marginTop: "-0.5em",
                  transform: `rotate(${angle}deg) translateY(-100px)`,
                  transformOrigin: "center center",
                  fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: `rotate(${-angle}deg)`,
                  }}
                >
                  {seg.label}
                </span>
              </div>
            );
          })}
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
        disabled={spinning || disabled}
        className="px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-b from-[#c41e3a] to-[#9b1528] hover:from-[#d42a45] hover:to-[#b01830] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-2 border-[#d4af37]/50 hover:border-[#d4af37] transition-all hover:scale-105 active:scale-100"
      >
        {spinning ? "Đang quay..." : "Quay ngay"}
      </button>
    </div>
  );
}
