"use client";

import { useRef, useCallback } from "react";
import GlassCard from "@/components/common/GlassCard";
import MediaCover from "@/components/common/MediaCover";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  editMode: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onClick: (project: Project, rect: DOMRect) => void;
}

export default function ProjectCard({
  project,
  editMode,
  onEdit,
  onDelete,
  onClick,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (editMode) {
      onEdit(project);
    } else {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) onClick(project, rect);
    }
  }, [editMode, project, onEdit, onClick]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("确定要删除这个作品吗？此操作不可撤销。")) {
        onDelete(project.id);
      }
    },
    [project.id, onDelete]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(project);
    },
    [project, onEdit]
  );

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
      className="block focus-ring rounded-xl cursor-pointer outline-none"
      aria-label={editMode ? `编辑: ${project.title}` : `查看: ${project.title}`}
    >
      <GlassCard className="overflow-hidden h-full flex flex-col relative group/card">
        {editMode && (
          <div className="absolute top-2 left-2 z-10 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs hover:bg-indigo-500 transition-colors"
              aria-label={`编辑 ${project.title}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button
              onClick={handleDelete}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs hover:bg-red-500 transition-colors"
              aria-label={`删除 ${project.title}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        )}

        <div className="relative w-full aspect-video">
          <MediaCover
            coverUrl={project.coverUrl}
            videoUrl={project.videoUrl}
            alt={`${project.title} 封面`}
            className="w-full h-full"
          />
          {project.isRepost && (
            <span className="absolute top-2 right-2 px-2 py-0.5 text-xs bg-indigo-500/80 text-white rounded-full backdrop-blur-sm z-10">
              转载
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col gap-1 flex-1">
          <h3 className="font-semibold text-white truncate">{project.title}</h3>
          <p className="text-xs text-white/50">
            {new Date(project.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
