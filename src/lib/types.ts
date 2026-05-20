export interface LandingCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  coverUrl: string;
  coverAspectRatio: "16:9";
  videoUrl?: string;
  createdAt: string;
  isRepost: boolean;
  sourceUrl?: string;
  contentMd: string;
  orderIndex?: number;
}

export type StorageErrorCode =
  | "ERR_STORAGE_QUOTA_EXCEEDED"
  | "ERR_INVALID_JSON"
  | "ERR_SCHEMA_MISMATCH"
  | "ERR_ITEM_NOT_FOUND";

export class StorageError extends Error {
  code: StorageErrorCode;
  constructor(code: StorageErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "StorageError";
  }
}
