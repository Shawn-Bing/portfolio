export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) return "标题不能为空";
  if (trimmed.length > 200) return "标题不能超过200个字符";
  return null;
}

export function validateProject(data: unknown): string | null {
  if (!data || typeof data !== "object") return "数据格式无效";
  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== "string" || obj.id.length === 0) return "缺少 id";
  if (typeof obj.title !== "string" || obj.title.trim().length === 0)
    return "缺少 title";
  if (typeof obj.coverUrl !== "string") return "缺少 coverUrl";
  if (typeof obj.createdAt !== "string") return "缺少 createdAt";
  if (typeof obj.isRepost !== "boolean") return "isRepost 必须是布尔值";
  if (typeof obj.contentMd !== "string") return "缺少 contentMd";

  if (
    obj.videoUrl !== undefined &&
    obj.videoUrl !== null &&
    typeof obj.videoUrl !== "string"
  )
    return "videoUrl 必须是字符串";

  if (
    obj.sourceUrl !== undefined &&
    obj.sourceUrl !== null &&
    typeof obj.sourceUrl !== "string"
  )
    return "sourceUrl 必须是字符串";

  if (
    obj.orderIndex !== undefined &&
    obj.orderIndex !== null &&
    typeof obj.orderIndex !== "number"
  )
    return "orderIndex 必须是数字";

  return null;
}
