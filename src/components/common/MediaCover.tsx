"use client";

import { useState, useEffect, useRef } from "react";
import { loadVideo } from "@/lib/storage/videoStore";

interface MediaCoverProps {
  coverUrl: string;
  videoUrl?: string;
  alt: string;
  className?: string;
  controls?: boolean;
}

export default function MediaCover({
  coverUrl,
  videoUrl,
  alt,
  className = "",
  controls = false,
}: MediaCoverProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoUrl || !controls) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    loadVideo(videoUrl)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setError(true);
          return;
        }
        setVideoSrc(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoUrl, controls]);

  // Revoke blob URL on unmount
  useEffect(() => {
    const src = videoSrc;
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [videoSrc]);

  if (videoUrl && controls && videoSrc) {
    return (
      <div className={`relative overflow-hidden bg-black/30 ${className}`}>
        <video
          ref={videoRef}
          src={videoSrc}
          poster={coverUrl}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (videoUrl && controls && loading) {
    return (
      <div
        className={`relative overflow-hidden bg-black/30 flex items-center justify-center ${className}`}
      >
        <img
          src={coverUrl}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative text-white/60 text-sm">加载视频中…</div>
      </div>
    );
  }

  if (videoUrl && controls && error) {
    return (
      <div className={`relative overflow-hidden bg-black/30 ${className}`}>
        <img
          src={coverUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white/60 text-sm">
            视频加载失败
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black/30 ${className}`}>
      {coverUrl ? (
        <>
          <img
            src={coverUrl}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="opacity-80"
                >
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
          暂无封面
        </div>
      )}
    </div>
  );
}
