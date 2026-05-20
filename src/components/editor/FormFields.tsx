"use client";

interface FormFieldsProps {
  title: string;
  onTitleChange: (v: string) => void;
  createdAt: string;
  onDateChange: (v: string) => void;
  isRepost: boolean;
  onRepostChange: (v: boolean) => void;
  sourceUrl: string;
  onSourceUrlChange: (v: string) => void;
  contentMd: string;
  onContentMdChange: (v: string) => void;
  errors: Record<string, string>;
}

export default function FormFields({
  title,
  onTitleChange,
  createdAt,
  onDateChange,
  isRepost,
  onRepostChange,
  sourceUrl,
  onSourceUrlChange,
  contentMd,
  onContentMdChange,
  errors,
}: FormFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <label
          htmlFor="project-title"
          className="block text-sm font-medium text-white/80 mb-1"
        >
          标题 <span className="text-red-400">*</span>
        </label>
        <input
          id="project-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
          placeholder="作品标题"
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-400">
            {errors.title}
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="project-date"
          className="block text-sm font-medium text-white/80 mb-1"
        >
          创作时间
        </label>
        <input
          id="project-date"
          type="date"
          value={createdAt}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors [color-scheme:dark]"
        />
      </div>

      {/* Is Repost */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="project-repost"
          className="text-sm font-medium text-white/80"
        >
          转载
        </label>
        <button
          id="project-repost"
          role="switch"
          aria-checked={isRepost}
          aria-label="是否转载"
          onClick={() => onRepostChange(!isRepost)}
          className={`relative w-11 h-6 rounded-full transition-colors focus-ring ${
            isRepost ? "bg-indigo-500" : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isRepost ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Source URL (conditional) */}
      {isRepost && (
        <div>
          <label
            htmlFor="project-source"
            className="block text-sm font-medium text-white/80 mb-1"
          >
            原文链接
          </label>
          <input
            id="project-source"
            type="url"
            value={sourceUrl}
            onChange={(e) => onSourceUrlChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
            placeholder="https://..."
            aria-describedby={errors.sourceUrl ? "source-error" : undefined}
            aria-invalid={!!errors.sourceUrl}
          />
          {errors.sourceUrl && (
            <p id="source-error" className="mt-1 text-sm text-red-400">
              {errors.sourceUrl}
            </p>
          )}
        </div>
      )}

      {/* Markdown Content */}
      <div>
        <label
          htmlFor="project-content"
          className="block text-sm font-medium text-white/80 mb-1"
        >
          正文 (Markdown)
        </label>
        <textarea
          id="project-content"
          value={contentMd}
          onChange={(e) => onContentMdChange(e.target.value)}
          rows={8}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors resize-y font-mono text-sm"
          placeholder="支持 Markdown 语法、GFM 表格、KaTeX 数学公式"
        />
      </div>
    </div>
  );
}
