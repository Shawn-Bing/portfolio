"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { cropImage } from "@/lib/utils/image";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((_: unknown, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleSave = useCallback(() => {
    if (!croppedAreaPixels) return;
    const img = new Image();
    img.onload = () => {
      const result = cropImage(
        img,
        { x: croppedAreaPixels.x, y: croppedAreaPixels.y },
        zoom,
        640,
        360
      );
      onCropComplete(result);
    };
    img.src = imageUrl;
  }, [imageUrl, croppedAreaPixels, zoom, onCropComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onCancel}
          className="text-white/70 hover:text-white px-4 py-2 rounded-lg transition-colors focus-ring"
        >
          取消
        </button>
        <span className="text-white/60 text-sm">裁剪封面 (16:9)</span>
        <button
          onClick={handleSave}
          className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-400 transition-colors focus-ring"
        >
          确认裁剪
        </button>
      </div>

      <div className="flex-1 relative">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropChange}
        />
      </div>

      <div className="p-4 flex items-center gap-4">
        <label
          htmlFor="zoom-slider"
          className="text-white/70 text-sm shrink-0"
        >
          缩放
        </label>
        <input
          id="zoom-slider"
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="text-white/50 text-xs w-10 text-right">
          {zoom.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}
