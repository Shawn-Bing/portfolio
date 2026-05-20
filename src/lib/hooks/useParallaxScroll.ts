"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type Screen = "landing" | "gallery";

const TRANSITION_MS = 600;

export function useParallaxScroll() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [progress, setProgress] = useState(0); // 0=landing, 1=gallery
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animStartRef = useRef(0);

  const animateToProgress = useCallback(
    (target: number, duration: number = TRANSITION_MS) => {
      if (animating) return;
      startProgressRef.current = progress;
      targetProgressRef.current = target;
      animStartRef.current = performance.now();
      setAnimating(true);

      const step = (now: number) => {
        const elapsed = now - animStartRef.current;
        const t = Math.min(elapsed / duration, 1);
        // ease-in-out
        const eased =
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const current =
          startProgressRef.current +
          (targetProgressRef.current - startProgressRef.current) * eased;

        setProgress(current);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          setProgress(target);
          setAnimating(false);
          if (target >= 0.95) setScreen("gallery");
          else if (target <= 0.05) setScreen("landing");
        }
      };
      requestAnimationFrame(step);
    },
    [progress, animating]
  );

  const goToGallery = useCallback(() => {
    if (screen === "gallery") return;
    animateToProgress(1);
  }, [screen, animateToProgress]);

  const goToLanding = useCallback(() => {
    if (screen === "landing") return;
    animateToProgress(0);
  }, [screen, animateToProgress]);

  // Mouse wheel handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) goToGallery();
      else if (e.deltaY < 0) goToLanding();
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [goToGallery, goToLanding]);

  // Touch swipe handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? 0;
      const diff = startY - endY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToGallery();
        else goToLanding();
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [goToGallery, goToLanding]);

  return {
    screen,
    progress,
    animating,
    containerRef,
    goToGallery,
    goToLanding,
  };
}
