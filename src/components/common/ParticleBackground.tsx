"use client";

import { useRef, useEffect, useCallback } from "react";
import type { ParticleParams } from "@/lib/hooks/useParticleSync";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function ParticleBackground({
  params,
  gradient,
}: {
  params: ParticleParams;
  gradient: readonly [string, string, string];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const initParticles = useCallback(
    (width: number, height: number) => {
      const count = paramsRef.current.count;
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 2.5 + 1,
          opacity: Math.random() * paramsRef.current.opacity + 0.1,
        });
      }
      particlesRef.current = arr;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const p = paramsRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const pt of particlesRef.current) {
        pt.x += pt.vx * p.speed;
        pt.y += pt.vy * p.speed;

        if (pt.x < 0) pt.x = canvas.width;
        if (pt.x > canvas.width) pt.x = 0;
        if (pt.y < 0) pt.y = canvas.height;
        if (pt.y > canvas.height) pt.y = 0;
      }

      // Draw connections
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * p.opacity * 0.3;
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const pt of pts) {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pt.opacity * (p.opacity / 0.7);
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: `linear-gradient(180deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`,
      }}
    />
  );
}
