"use client";

import { useState, useCallback, useRef } from "react";
import ImageCropper from "@/components/editor/ImageCropper";
import FormFields from "@/components/editor/FormFields";
import { validateTitle, validateUrl } from "@/lib/utils/validation";
import { getMediaType, captureVideoFrame } from "@/lib/utils/image";
import { saveVideo, deleteVideo } from "@/lib/storage/videoStore";
import type { Project } from "@/lib/types";

interface ProjectEditorProps {
  project: Project | null;
  onSave: (project: Project) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export default function ProjectEditor({
  project,
  onSave,
  onDelete,
  onClose,
}: ProjectEditorProps) {
  const isEdit = !!project;

  const [title, setTitle] = useState(project?.title ?? "");
  const [createdAt, setCreatedAt] = useState(
    project?.createdAt ?? new Date().toISOString().slice(0, 10)
  );
  const [isRepost, setIsRepost] = useState(project?.isRepost ?? false);
  const [sourceUrl, setSourceUrl] = useState(project?.sourceUrl ?? "");
  const [contentMd, setContentMd] = useState(project?.contentMd ?? "");
  const [coverUrl, setCoverUrl] = useState(project?.coverUrl ?? "");
  const [videoUrl, setVideoUrl] = useState<string | undefined>(
    project?.videoUrl
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const mediaType = getMediaType(file);
      if (mediaType === "video") {
        const videoId = crypto.randomUUID();
        captureVideoFrame(file)
          .then((poster) => {
            setCoverUrl(poster);
            setVideoUrl(videoId);
            return saveVideo(videoId, file);
          })
          .catch((err) => {
            setErrors((prev) => ({
              ...prev,
              cover: `视频处理失败: ${err instanceof Error ? err.message : "未知错误"}`,
            }));
          });
        return;
      }
      if (mediaType === "image") {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedImage(reader.result as string);
          setShowCropper(true);
        };
        reader.readAsDataURL(file);
        return;
      }
      setErrors((prev) => ({
        ...prev,
        cover: "仅支持 JPG、PNG、WebP、MP4、MOV 格式",
      }));
    },
    []
  );

  const handleCropComplete = useCallback((croppedDataUrl: string) => {
    setCoverUrl(croppedDataUrl);
    setShowCropper(false);
    setUploadedImage(null);
  }, []);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    const titleErr = validateTitle(title);
    if (titleErr) e.title = titleErr;
    if (isRepost && sourceUrl && !validateUrl(sourceUrl)) {
      e.sourceUrl = "请输入有效的 URL";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, isRepost, sourceUrl]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        // If video was changed and old project had a video, clean up old video
        if (project?.videoUrl && project.videoUrl !== videoUrl) {
          deleteVideo(project.videoUrl).catch(() => {});
        }

        const saved: Project = {
          id: project?.id ?? generateId(),
          title: title.trim(),
          coverUrl,
          coverAspectRatio: "16:9",
          videoUrl,
          createdAt: new Date(createdAt).toISOString(),
          isRepost,
          sourceUrl: isRepost ? sourceUrl : undefined,
          contentMd,
          orderIndex: project?.orderIndex,
        };
        onSave(saved);
      } catch (err) {
        setStorageError(
          err instanceof Error ? err.message : "保存失败，请重试"
        );
      }
    },
    [
      validate,
      project,
      title,
      coverUrl,
      videoUrl,
      createdAt,
      isRepost,
      sourceUrl,
      contentMd,
      onSave,
    ]
  );

  const handleDelete = useCallback(() => {
    if (!project || !onDelete) return;
    if (window.confirm("确定要删除这个作品吗？此操作不可撤销。")) {
      onDelete(project.id);
    }
  }, [project, onDelete]);

  return (
    <>
      {showCropper && uploadedImage ? (
        <ImageCropper
          imageUrl={uploadedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setUploadedImage(null);
          }}
        />
      ) : null}

      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-10 pb-10 overflow-y-auto">
        <div className="glass rounded-2xl w-full max-w-lg mx-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {isEdit ? "编辑作品" : "添加作品"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white text-2xl leading-none px-2 focus-ring rounded"
              aria-label="关闭编辑器"
            >
              ×
            </button>
          </div>

          {storageError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {storageError}
              <button
                onClick={() => setStorageError(null)}
                className="ml-2 underline"
              >
                关闭
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Cover upload */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                封面 (16:9)
              </label>
              {coverUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black/30">
                  <img
                    src={coverUrl}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                  />
                  {videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (videoUrl) {
                        deleteVideo(videoUrl).catch(() => {});
                        setVideoUrl(undefined);
                      }
                      setCoverUrl("");
                    }}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors focus-ring"
                  >
                    移除
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/50 hover:border-white/40 hover:text-white/70 transition-colors focus-ring"
                  aria-label="上传封面图片"
                >
                  <span className="text-sm">点击上传封面 (JPG/PNG/WebP/MP4)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
                aria-hidden="true"
              />
              {errors.cover && (
                <p className="mt-1 text-sm text-red-400">{errors.cover}</p>
              )}
            </div>

            <FormFields
              title={title}
              onTitleChange={setTitle}
              createdAt={createdAt}
              onDateChange={setCreatedAt}
              isRepost={isRepost}
              onRepostChange={setIsRepost}
              sourceUrl={sourceUrl}
              onSourceUrlChange={setSourceUrl}
              contentMd={contentMd}
              onContentMdChange={setContentMd}
              errors={errors}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-500 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-400 active:scale-[0.98] transition-all focus-ring"
              >
                {isEdit ? "保存修改" : "添加作品"}
              </button>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 active:scale-[0.98] transition-all focus-ring"
                >
                  删除
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
