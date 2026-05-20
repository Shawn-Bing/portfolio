"use client";

import type { LandingCard } from "@/lib/types";

interface HeroCardProps {
  card: LandingCard;
  index: number;
  editMode: boolean;
  onEdit: (card: LandingCard) => void;
  onDelete: (id: string) => void;
}

export default function HeroCard({
  card,
  index,
  editMode,
  onEdit,
  onDelete,
}: HeroCardProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden group/card select-none anim-hero-card"
      style={{
        background: "rgba(232,235,240,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 4px 24px rgba(32,40,50,0.04), 0 1px 3px rgba(32,40,50,0.03)",
        padding: "24px 22px",
        animationDelay: `${index * 60 + 200}ms`,
        opacity: 0,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15), rgba(255,255,255,0.55))" }}
      />
      <div
        className="absolute top-0 bottom-0 left-0 w-px pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08))" }}
      />

      {editMode && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            type="button"
            className="px-2 py-1 rounded text-[10px] text-[#4A5F70] bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(card); }}
          >
            编辑
          </button>
          <button
            type="button"
            className="w-5 h-5 rounded-full bg-red-400/80 text-white text-[10px] flex items-center justify-center hover:bg-red-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(card.id); }}
            aria-label="删除卡片"
          >
            ×
          </button>
        </div>
      )}

      <div className="relative z-[1] flex flex-col gap-3">
        <div className="text-2xl leading-none">{card.icon}</div>
        <h3 className="text-[14px] font-semibold text-[#4A5F70] tracking-[-0.01em] leading-tight">
          {card.title}
        </h3>
        <p className="text-[12px] text-[#63798B] leading-relaxed">
          {card.description}
        </p>
      </div>
    </div>
  );
}
