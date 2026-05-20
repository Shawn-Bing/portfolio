export function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function cropImage(
  image: HTMLImageElement,
  crop: { x: number; y: number },
  zoom: number,
  outputWidth: number = 640,
  outputHeight: number = 360
): string {
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropWidth = outputWidth / zoom;
  const cropHeight = outputHeight / zoom;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    cropWidth * scaleX,
    cropHeight * scaleY,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas.toDataURL("image/webp", 0.85);
}

export function captureVideoFrame(
  file: File,
  seekTime: number = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.remove();
    };

    video.onloadeddata = () => {
      video.currentTime = Math.min(seekTime, video.duration || 0.5);

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        cleanup();
        resolve(canvas.toDataURL("image/webp", 0.85));
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("Video seek failed"));
      };
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Video load failed"));
    };

    video.src = url;
  });
}

export const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VALID_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

export function getMediaType(file: File): "image" | "video" | null {
  if (VALID_IMAGE_TYPES.includes(file.type)) return "image";
  if (VALID_VIDEO_TYPES.includes(file.type)) return "video";
  return null;
}
