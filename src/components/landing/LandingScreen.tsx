"use client";

import GlassCard from "@/components/common/GlassCard";

interface LandingScreenProps {
  progress: number;
}

export default function LandingScreen({ progress }: LandingScreenProps) {
  const opacity = 1 - progress;
  const translateY = -progress * 100;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none"
      style={{
        opacity: Math.max(0, opacity),
        transform: `translateY(${translateY}px)`,
      }}
    >
      <GlassCard className="px-10 py-12 text-center max-w-lg mx-4" hover={false}>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          作品页
        </h1>
        <p className="text-lg text-white/70 leading-relaxed">
          个人作品集展示
        </p>
        <p className="mt-4 text-sm text-white/50">
          向下滚动或滑动开始浏览
        </p>
      </GlassCard>
    </div>
  );
}
