"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useParallaxScroll } from "@/lib/hooks/useParallaxScroll";
import { useParticleSync } from "@/lib/hooks/useParticleSync";
import ParticleBackground from "@/components/common/ParticleBackground";
import LandingScreen from "@/components/landing/LandingScreen";
import GalleryScreen from "@/components/gallery/GalleryScreen";
import ProjectEditor from "@/components/editor/ProjectEditor";
import DetailOverlay from "@/components/gallery/DetailOverlay";
import type { Project } from "@/lib/types";
import {
  addProject,
  updateProject,
  deleteProject,
} from "@/lib/storage/projectStore";
import { deleteVideo } from "@/lib/storage/videoStore";

const LANDING_GRADIENT = ["#0f0c29", "#302b63", "#24243e"] as const;
const GALLERY_GRADIENT = ["#2d2d3a", "#4a4a5a", "#3a3a4a"] as const;

export default function HomeClient() {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "true";

  const [projects, setProjects] = useLocalStorage<Project[]>(
    "portfolio_projects",
    []
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [detailOriginRect, setDetailOriginRect] = useState<DOMRect | null>(
    null
  );

  const { progress, containerRef, goToGallery } = useParallaxScroll();
  const { params } = useParticleSync(progress);

  const gradient = progress < 0.5 ? LANDING_GRADIENT : GALLERY_GRADIENT;

  const handleAddClick = useCallback(() => {
    setEditingProject(null);
    setEditorOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    (project: Project) => {
      if (editingProject) {
        setProjects((prev) => updateProject(prev, project.id, project));
      } else {
        setProjects((prev) => addProject(prev, project));
      }
      setEditorOpen(false);
      setEditingProject(null);
    },
    [editingProject, setProjects]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (project?.videoUrl) {
        deleteVideo(project.videoUrl).catch(() => {});
      }
      setProjects((prev) => deleteProject(prev, id));
      setEditorOpen(false);
      setEditingProject(null);
    },
    [projects, setProjects]
  );

  const handleCardClick = useCallback(
    (project: Project, rect: DOMRect) => {
      setDetailOriginRect(rect);
      setDetailProject(project);
      goToGallery();
    },
    [goToGallery]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailProject(null);
    setDetailOriginRect(null);
    // Remove gallery path from URL when closing
    const base = "/portfolio";
    if (window.location.pathname.startsWith(`${base}/gallery/`)) {
      window.history.replaceState(null, "", base + "/");
    }
  }, []);

  // Detect direct URL access to gallery/[id] (SPA fallback for static export)
  useEffect(() => {
    const base = "/portfolio";
    const pathname = window.location.pathname;
    const galleryPrefix = `${base}/gallery/`;
    if (!pathname.startsWith(galleryPrefix)) return;

    const id = pathname.slice(galleryPrefix.length).replace(/\/$/, "");
    if (!id) return;

    try {
      const allProjects = JSON.parse(
        localStorage.getItem("portfolio_projects") ?? "[]"
      ) as Project[];
      const found = allProjects.find((p) => p.id === id);
      if (found) {
        // Use a center-screen rect as origin for the animation
        const w = window.innerWidth;
        const h = window.innerHeight;
        const fakeRect: DOMRect = {
          x: w / 2 - 200,
          y: h / 2 - 112.5,
          width: 400,
          height: 225,
          top: h / 2 - 112.5,
          bottom: h / 2 + 112.5,
          left: w / 2 - 200,
          right: w / 2 + 200,
        } as DOMRect;
        setDetailOriginRect(fakeRect);
        setDetailProject(found);
        goToGallery();
      }
    } catch {
      // ignore
    }
  }, [goToGallery]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#0f0c29]"
    >
      <ParticleBackground params={params} gradient={gradient} />

      <LandingScreen progress={progress} />
      <GalleryScreen
        progress={progress}
        projects={projects}
        onProjectsChange={setProjects}
        onAddClick={handleAddClick}
        editMode={editMode}
        onEditProject={handleEditProject}
        onDeleteProject={handleDelete}
        onCardClick={handleCardClick}
      />

      {/* Edit mode banner */}
      {editMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-indigo-500/20 border-b border-indigo-500/30 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-indigo-300">编辑模式中</span>
          <a
            href="/"
            className="text-sm text-indigo-300 hover:text-white underline transition-colors"
          >
            退出编辑
          </a>
        </div>
      )}

      {/* FAB: add project (edit mode only) */}
      {editMode && (
        <button
          onClick={handleAddClick}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full bg-indigo-500 text-white text-2xl shadow-lg hover:bg-indigo-400 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all focus-ring flex items-center justify-center"
          aria-label="添加新作品"
        >
          +
        </button>
      )}

      {editorOpen && (
        <ProjectEditor
          project={editingProject}
          onSave={handleSave}
          onDelete={editingProject ? handleDelete : undefined}
          onClose={() => {
            setEditorOpen(false);
            setEditingProject(null);
          }}
        />
      )}

      {detailProject && detailOriginRect && (
        <DetailOverlay
          project={detailProject}
          originRect={detailOriginRect}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
