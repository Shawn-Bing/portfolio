"use client";

import { useCallback } from "react";
import ProjectCard from "@/components/gallery/ProjectCard";
import DragDropProvider from "@/components/gallery/DragDropProvider";
import type { Project } from "@/lib/types";
import { reorderProjects } from "@/lib/storage/projectStore";

interface GalleryScreenProps {
  progress: number;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  onAddClick: () => void;
  editMode: boolean;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onCardClick: (project: Project, rect: DOMRect) => void;
}

export default function GalleryScreen({
  progress,
  projects,
  onProjectsChange,
  onAddClick,
  editMode,
  onEditProject,
  onDeleteProject,
  onCardClick,
}: GalleryScreenProps) {
  const opacity = progress;
  const translateY = (1 - progress) * 80;

  const onReorder = useCallback(
    (sourceIndex: number, destIndex: number) => {
      const updated = reorderProjects(projects, sourceIndex, destIndex);
      onProjectsChange(updated);
    },
    [projects, onProjectsChange]
  );

  return (
    <div
      className="absolute inset-0 z-20 overflow-y-auto no-scrollbar"
      style={{
        opacity: Math.max(0, opacity),
        transform: `translateY(${translateY}px)`,
        pointerEvents: progress > 0.1 ? "auto" : "none",
      }}
    >
      <div className="min-h-full flex flex-col">
        {editMode && (
          <div className="pt-20 md:pt-28 pb-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              作品集
            </h2>
            <p className="text-white/50 text-sm">
              {projects.length === 0
                ? "目前还没有作品，点击下方按钮开始添加"
                : `${projects.length} 个作品`}
            </p>
          </div>
        )}
        {!editMode && (
          <div className="pt-16 md:pt-24 pb-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              作品集
            </h2>
            <p className="text-white/50 text-sm">
              {projects.length === 0
                ? "目前还没有作品"
                : `${projects.length} 个作品`}
            </p>
          </div>
        )}

        <div className="flex-1 pb-24">
          {projects.length === 0 ? (
            editMode ? (
              <div className="flex items-center justify-center py-20">
                <button
                  onClick={onAddClick}
                  className="glass px-6 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-all focus-ring"
                  aria-label="添加第一个作品"
                >
                  + 添加作品
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-white/40">暂无作品</p>
              </div>
            )
          ) : (
            <DragDropProvider
              onReorder={onReorder}
              renderItem={(_, index) => (
                <ProjectCard
                  project={projects[index]}
                  editMode={editMode}
                  onEdit={onEditProject}
                  onDelete={onDeleteProject}
                  onClick={onCardClick}
                />
              )}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  editMode={editMode}
                  onEdit={onEditProject}
                  onDelete={onDeleteProject}
                  onClick={onCardClick}
                />
              ))}
            </DragDropProvider>
          )}
        </div>
      </div>
    </div>
  );
}
