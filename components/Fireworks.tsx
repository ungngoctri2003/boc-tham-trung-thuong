"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  decay: number;
  size: number;
};

type Burst = {
  x: number;
  y: number;
  particles: Particle[];
  done: boolean;
};

const COLORS = ["#c41e3a", "#d4af37", "#f5d76e", "#ff6b6b", "#ffd93d"];

function createBurst(cx: number, cy: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 3 + Math.random() * 6;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      life: 1,
      decay: 0.015 + Math.random() * 0.01,
      size: 2 + Math.random() * 2,
    });
  }
  return particles;
}

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const bursts: Burst[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const addBurst = (x: number, y: number) => {
      bursts.push({
        x,
        y,
        particles: createBurst(x, y, 40 + Math.floor(Math.random() * 20)),
        done: false,
      });
    };

    addBurst(centerX, centerY);
    const t1 = setTimeout(() => addBurst(centerX - 80, centerY - 60), 200);
    const t2 = setTimeout(() => addBurst(centerX + 100, centerY - 80), 400);
    const t3 = setTimeout(() => addBurst(centerX - 120, centerY + 40), 600);
    const t4 = setTimeout(() => addBurst(centerX + 60, centerY + 80), 800);
    const t5 = setTimeout(() => addBurst(centerX, centerY - 100), 1100);

    let rafId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const burst of bursts) {
        if (burst.done) continue;
        let allDead = true;
        for (const p of burst.particles) {
          if (p.life <= 0) continue;
          allDead = false;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life -= p.decay;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (allDead) burst.done = true;
      }

      const anyLeft = bursts.some((b) => !b.done);
      if (anyLeft) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
