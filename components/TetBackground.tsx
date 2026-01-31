"use client";

/** Hạt rơi thẳng - vàng/đỏ */
const FALLING_PARTICLES = [
  { left: "5%", size: 6, color: "bg-[#d4af37]/40", duration: 18, delay: 0 },
  { left: "12%", size: 4, color: "bg-[#c41e3a]/25", duration: 22, delay: 2 },
  { left: "22%", size: 5, color: "bg-[#d4af37]/35", duration: 20, delay: 5 },
  { left: "35%", size: 4, color: "bg-[#c41e3a]/20", duration: 24, delay: 1 },
  { left: "48%", size: 6, color: "bg-[#d4af37]/30", duration: 19, delay: 8 },
  { left: "58%", size: 4, color: "bg-[#c41e3a]/25", duration: 21, delay: 3 },
  { left: "68%", size: 5, color: "bg-[#d4af37]/40", duration: 23, delay: 6 },
  { left: "78%", size: 4, color: "bg-[#c41e3a]/20", duration: 20, delay: 4 },
  { left: "88%", size: 6, color: "bg-[#d4af37]/35", duration: 17, delay: 7 },
  { left: "95%", size: 4, color: "bg-[#c41e3a]/25", duration: 25, delay: 2 },
  { left: "18%", size: 4, color: "bg-[#d4af37]/25", duration: 26, delay: 10 },
  { left: "42%", size: 5, color: "bg-[#c41e3a]/15", duration: 21, delay: 12 },
  { left: "72%", size: 4, color: "bg-[#d4af37]/30", duration: 19, delay: 9 },
  { left: "28%", size: 5, color: "bg-[#c41e3a]/22", duration: 23, delay: 4 },
  { left: "52%", size: 4, color: "bg-[#d4af37]/38", duration: 20, delay: 11 },
  { left: "8%", size: 5, color: "bg-[#d4af37]/28", duration: 22, delay: 6 },
  { left: "92%", size: 4, color: "bg-[#c41e3a]/18", duration: 19, delay: 14 },
];

/** Hạt rơi chéo - trái sang phải */
const FALLING_DIAG = [
  { left: "0%", size: 5, color: "bg-[#d4af37]/35", duration: 25, delay: 0 },
  { left: "10%", size: 4, color: "bg-[#c41e3a]/20", duration: 28, delay: 5 },
  { left: "25%", size: 6, color: "bg-[#d4af37]/30", duration: 24, delay: 10 },
  { left: "50%", size: 4, color: "bg-[#c41e3a]/22", duration: 26, delay: 3 },
  { left: "65%", size: 5, color: "bg-[#d4af37]/40", duration: 27, delay: 8 },
  { left: "85%", size: 4, color: "bg-[#c41e3a]/18", duration: 23, delay: 12 },
];

/** Hạt rơi chéo - phải sang trái */
const FALLING_DIAG_2 = [
  { left: "15%", size: 4, color: "bg-[#c41e3a]/25", duration: 24, delay: 2 },
  { left: "40%", size: 5, color: "bg-[#d4af37]/32", duration: 26, delay: 7 },
  { left: "60%", size: 4, color: "bg-[#c41e3a]/20", duration: 22, delay: 11 },
  { left: "80%", size: 5, color: "bg-[#d4af37]/28", duration: 25, delay: 4 },
];

/** Confetti nhỏ (vuông xoay) */
const CONFETTI = [
  { left: "7%", size: 4, color: "bg-[#d4af37]/50", duration: 20, delay: 1 },
  { left: "33%", size: 3, color: "bg-[#c41e3a]/35", duration: 24, delay: 6 },
  { left: "56%", size: 4, color: "bg-[#d4af37]/45", duration: 22, delay: 3 },
  { left: "79%", size: 3, color: "bg-[#c41e3a]/30", duration: 21, delay: 9 },
  { left: "94%", size: 4, color: "bg-[#d4af37]/40", duration: 23, delay: 5 },
];

/** Điểm lấp lánh vàng */
const SPARKLES = [
  { left: "8%", top: "15%", size: 3, delay: 0 },
  { left: "25%", top: "25%", size: 4, delay: 0.5 },
  { left: "45%", top: "12%", size: 2, delay: 1 },
  { left: "62%", top: "30%", size: 3, delay: 1.5 },
  { left: "82%", top: "18%", size: 4, delay: 0.3 },
  { left: "15%", top: "55%", size: 3, delay: 2 },
  { left: "38%", top: "70%", size: 4, delay: 2.2 },
  { left: "55%", top: "60%", size: 2, delay: 1.2 },
  { left: "75%", top: "75%", size: 3, delay: 2.5 },
  { left: "90%", top: "50%", size: 4, delay: 1.8 },
  { left: "30%", top: "42%", size: 2, delay: 0.8 },
  { left: "70%", top: "45%", size: 3, delay: 2.8 },
  { left: "5%", top: "35%", size: 3, delay: 1.5 },
  { left: "48%", top: "5%", size: 4, delay: 0.2 },
  { left: "92%", top: "65%", size: 2, delay: 2.2 },
  { left: "20%", top: "82%", size: 4, delay: 1.8 },
  { left: "65%", top: "18%", size: 3, delay: 0.7 },
  { left: "85%", top: "38%", size: 2, delay: 2.6 },
];

/** Lấp lánh chậm (lớn hơn) */
const SPARKLES_SLOW = [
  { left: "12%", top: "20%", size: 5, delay: 0 },
  { left: "50%", top: "35%", size: 6, delay: 1.5 },
  { left: "78%", top: "55%", size: 5, delay: 0.8 },
  { left: "35%", top: "78%", size: 5, delay: 2 },
  { left: "88%", top: "12%", size: 6, delay: 1 },
  { left: "22%", top: "62%", size: 5, delay: 2.5 },
];

/** Quả cầu mờ trôi (lớn, blur) */
const ORBS = [
  { left: "5%", top: "20%", size: 80, color: "bg-[#d4af37]/20", delay: 0 },
  { left: "75%", top: "15%", size: 60, color: "bg-[#c41e3a]/15", delay: 2 },
  { left: "20%", top: "70%", size: 70, color: "bg-[#d4af37]/18", delay: 4 },
  { left: "85%", top: "60%", size: 65, color: "bg-[#c41e3a]/12", delay: 1 },
  { left: "50%", top: "85%", size: 90, color: "bg-[#d4af37]/15", delay: 3 },
  { left: "35%", top: "30%", size: 55, color: "bg-[#c41e3a]/10", delay: 5 },
  { left: "90%", top: "80%", size: 50, color: "bg-[#d4af37]/22", delay: 2.5 },
  { left: "10%", top: "50%", size: 60, color: "bg-[#c41e3a]/14", delay: 1.5 },
];

export default function TetBackground() {
  return (
    <div className="tet-bg-effects">
      {/* Lớp gradient vàng nhấp nháy */}
      <div className="tet-bg-gradient-pulse" aria-hidden />
      {/* Lớp gradient đỏ mềm (2 vị trí) */}
      <div className="tet-bg-red-soft" aria-hidden />
      <div className="tet-bg-red-soft-2" aria-hidden />

      {/* Quả cầu mờ trôi nhẹ */}
      {ORBS.map((o, i) => (
        <div
          key={`orb-${i}`}
          className={`tet-orb ${o.color} blur-3xl`}
          style={{
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            marginLeft: -o.size / 2,
            marginTop: -o.size / 2,
            animationDelay: `${o.delay}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Hạt rơi thẳng */}
      {FALLING_PARTICLES.map((p, i) => (
        <div
          key={`fall-${i}`}
          className={`tet-particle ${p.color}`}
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Hạt rơi chéo (trái → phải) */}
      {FALLING_DIAG.map((p, i) => (
        <div
          key={`diag-${i}`}
          className={`tet-particle-diag ${p.color}`}
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Hạt rơi chéo (phải → trái) */}
      {FALLING_DIAG_2.map((p, i) => (
        <div
          key={`diag2-${i}`}
          className={`tet-particle-diag-2 ${p.color}`}
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Confetti vuông xoay */}
      {CONFETTI.map((c, i) => (
        <div
          key={`confetti-${i}`}
          className={`tet-particle-confetti ${c.color}`}
          style={{
            left: c.left,
            top: "-10px",
            width: c.size,
            height: c.size,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Điểm lấp lánh vàng */}
      {SPARKLES.map((s, i) => (
        <div
          key={`spark-${i}`}
          className="tet-sparkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Lấp lánh chậm (lớn hơn) */}
      {SPARKLES_SLOW.map((s, i) => (
        <div
          key={`spark-slow-${i}`}
          className="tet-sparkle-slow"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}
