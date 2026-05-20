"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadProjects } from "@/lib/storage/projectStore";
import { renderMarkdown } from "@/components/markdown/MarkdownRenderer";
import MediaCover from "@/components/common/MediaCover";
import type { Project } from "@/lib/types";

export default function ProjectDetailClient({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [html, setHtml] = useState("");

  useEffect(() => {
    try {
      const projects = loadProjects();
      const found = projects.find((p) => p.id === id);
      setProject(found ?? null);

      if (found && found.contentMd) {
        renderMarkdown(found.contentMd).then(setHtml);
      }
    } catch {
      setProject(null);
    }
  }, [id]);

  if (project === undefined) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white flex items-center justify-center">
        <p className="text-white/50">加载中…</p>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4">作品未找到</h1>
        <p className="text-white/60 mb-6">
          该作品不存在或已被删除。作品数据存储在本地浏览器中，请返回首页查看。
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* KaTeX CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/katex.min.css"
      />

      <div className="min-h-screen bg-[#1a1a2e] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            ← 返回作品集
          </Link>

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

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-white/50 mb-8">
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

          <article
            className="markdown-content text-white/85 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </>
  );
}
