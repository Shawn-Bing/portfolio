import { Project, StorageError } from "@/lib/types";
import { validateProject } from "@/lib/utils/validation";

const STORAGE_KEY = "portfolio_projects";

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new StorageError(
        "ERR_INVALID_JSON",
        "数据 JSON 解析失败，请检查数据结构"
      );
    }

    if (!Array.isArray(data)) {
      throw new StorageError(
        "ERR_SCHEMA_MISMATCH",
        "存储数据格式不正确：不是数组"
      );
    }

    for (let i = 0; i < data.length; i++) {
      const err = validateProject(data[i]);
      if (err) {
        throw new StorageError(
          "ERR_SCHEMA_MISMATCH",
          `第 ${i + 1} 项数据格式不匹配：${err}`
        );
      }
    }

    return data as Project[];
  } catch (e) {
    if (e instanceof StorageError) throw e;
    throw new StorageError("ERR_INVALID_JSON", "读取存储数据时发生未知错误");
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    const json = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.code === 22)
    ) {
      throw new StorageError(
        "ERR_STORAGE_QUOTA_EXCEEDED",
        "存储空间不足，请清理旧数据或压缩图片"
      );
    }
    throw new StorageError(
      "ERR_STORAGE_QUOTA_EXCEEDED",
      "保存数据时发生未知错误"
    );
  }
}

export function addProject(projects: Project[], project: Project): Project[] {
  const updated = [...projects, project];
  saveProjects(updated);
  return updated;
}

export function updateProject(
  projects: Project[],
  id: string,
  updates: Partial<Project>
): Project[] {
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new StorageError("ERR_ITEM_NOT_FOUND", "作品未找到");

  const updated = [...projects];
  updated[index] = { ...updated[index], ...updates };
  saveProjects(updated);
  return updated;
}

export function deleteProject(projects: Project[], id: string): Project[] {
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new StorageError("ERR_ITEM_NOT_FOUND", "作品未找到");

  const updated = projects.filter((p) => p.id !== id);
  saveProjects(updated);
  return updated;
}

export function reorderProjects(
  projects: Project[],
  sourceIndex: number,
  destIndex: number
): Project[] {
  const updated = [...projects];
  const [removed] = updated.splice(sourceIndex, 1);
  updated.splice(destIndex, 0, removed);

  const reordered = updated.map((p, i) => ({ ...p, orderIndex: i }));
  saveProjects(reordered);
  return reordered;
}
