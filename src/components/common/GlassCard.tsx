"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  as: Tag = "div",
  hover = true,
}: GlassCardProps) {
  const base =
    "rounded-xl transition-all duration-300 focus-ring bg-white/10 backdrop-blur-md border border-white/20 shadow-xl";
  const hoverStyles = hover
    ? "hover:-translate-y-[2px] hover:shadow-2xl hover:border-white/30 active:scale-[0.98]"
    : "";

  return (
    <Tag className={`${base} ${hoverStyles} ${className}`}>{children}</Tag>
  );
}
