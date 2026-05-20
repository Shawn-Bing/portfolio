"use client";

import { useRef, useCallback } from "react";

export interface ParticleParams {
  color: string;
  speed: number;
  opacity: number;
  count: number;
}

export const LANDING_PARTICLES: ParticleParams = {
  color: "#6366f1",
  speed: 1.2,
  opacity: 0.7,
  count: 80,
};

export const GALLERY_PARTICLES: ParticleParams = {
  color: "#8b8c9e",
  speed: 0.4,
  opacity: 0.35,
  count: 50,
};

export function lerpParams(
  a: ParticleParams,
  b: ParticleParams,
  t: number
): ParticleParams {
  return {
    color: t < 0.5 ? a.color : b.color,
    speed: a.speed + (b.speed - a.speed) * t,
    opacity: a.opacity + (b.opacity - a.opacity) * t,
    count: Math.round(a.count + (b.count - a.count) * t),
  };
}

export function useParticleSync(progress: number) {
  const paramsRef = useRef<ParticleParams>(LANDING_PARTICLES);

  const currentParams = lerpParams(
    LANDING_PARTICLES,
    GALLERY_PARTICLES,
    progress
  );
  paramsRef.current = currentParams;

  const getParams = useCallback(() => paramsRef.current, []);

  return { params: currentParams, getParams };
}
