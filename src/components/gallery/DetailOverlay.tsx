"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { renderMarkdown } from "@/components/markdown/MarkdownRenderer";
import MediaCover from "@/components/common/MediaCover";
import type { Project } from "@/lib/types";

interface DetailOverlayProps {
  project: Project;
  originRect: DOMRect;
  onClose: () => void;
}

type Phase = "entering" | "visible" | "exiting";

export default function DetailOverlay({
  project,
  originRect,
  onClose,
}: DetailOverlayProps) {
  const [phase, setPhase] = useState<Phase>("entering");
  const [html, setHtml] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Render markdown
  useEffect(() => {
    if (project.contentMd) {
      renderMarkdown(project.contentMd).then(setHtml);
    }
  }, [project.contentMd]);

  // Trigger enter animation on next frame
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPhase("visible");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "visible") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleClose = useCallback(() => {
    setPhase("exiting");
    setTimeout(() => onClose(), 260);
  }, [onClose]);

  // Compute transform to go from card position to full screen
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const scaleX = originRect.width / viewW;
  const scaleY = originRect.height / viewH;
  const translateX = originRect.left + originRect.width / 2 - viewW / 2;
  const translateY = originRect.top + originRect.height / 2 - viewH / 2;

  const isExpanded = phase === "visible" || phase === "exiting";
  const isShrinking = phase === "exiting";

  const style: React.CSSProperties = isExpanded
    ? isShrinking
      ? {
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: "12px",
          transition: "transform 260ms ease-in, border-radius 260ms ease-in",
        }
      : {
          transform: "translate(0, 0) scale(1, 1)",
          borderRadius: "0",
          transition: "transform 350ms ease-out, border-radius 350ms ease-out",
        }
    : {
        transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
        borderRadius: "12px",
      };

  const overlay = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — 详情`}
      className="fixed inset-0 z-[150]"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1a2e]"
        style={{
          opacity: isExpanded && !isShrinking ? 1 : 0,
          transition: isShrinking
            ? "opacity 260ms ease-in"
            : "opacity 350ms ease-out",
        }}
        onClick={handleClose}
      />

      {/* Animated container */}
      <div
        className="absolute overflow-hidden bg-[#1a1a2e]"
        style={{
          width: viewW,
          height: viewH,
          left: 0,
          top: 0,
          transformOrigin: "center center",
          ...style,
        }}
      >
        <div
          className="w-full h-full overflow-y-auto"
          style={{
            opacity: isExpanded && !isShrinking ? 1 : 0,
            transition: isShrinking
              ? "opacity 200ms ease-in"
              : "opacity 200ms ease-out 200ms",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="关闭详情"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {/* Cover */}
            {project.coverUrl && (
              <div className="aspect-video rounded-xl overflow-hidden mb-6">
                <MediaCover
                  coverUrl={project.coverUrl}
                  videoUrl={project.videoUrl}
                  alt={`${project.title} 封面`}
                  className="w-full h-full"
                  controls={true}
                />
              </div>
            )}

            {/* Title & meta */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {project.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-white/50 mb-2">
              <time dateTime={project.createdAt}>
                {new Date(project.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {project.isRepost && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                  转载
                </span>
              )}
              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  原文链接
                </a>
              )}
            </div>

            {/* Open in separate page link */}
            <a
              href={`/gallery/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-8 text-xs text-white/40 hover:text-white/60 transition-colors underline"
            >
              在新页面打开
            </a>

            {/* Markdown content */}
            {html ? (
              <article
                className="markdown-content text-white/85 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-white/40 text-sm">
                {project.contentMd ? "渲染中…" : "暂无描述内容"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KaTeX CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/katex.min.css"
      />
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}
