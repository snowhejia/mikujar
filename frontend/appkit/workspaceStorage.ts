import type { AppDataMode } from "../appDataModeStorage";
import { safeGetItem, safeSetItem } from "../lib/localPref";
import {
  ATTACHMENT_FILTER_KEYS,
  type AttachmentFilterKey,
} from "../noteMediaCategory";
import type { NoteCard, TrashedNoteEntry } from "../types";

export const ACTIVE_COLLECTION_STORAGE_PREFIX = "cardnote-active-collection:";

/** 存在 active 键上时表示主区为「全部笔记」，而非某个合集 id */
export const PERSISTED_WORKSPACE_ALL_NOTES = "__cardnote_workspace_all_notes__";

/** 主区为「概览」（默认落地页） */
export const PERSISTED_WORKSPACE_OVERVIEW = "__cardnote_workspace_overview__";

/** 主区为「我的待办」 */
export const PERSISTED_WORKSPACE_REMINDERS = "__cardnote_workspace_reminders__";

/** 主区为「笔记探索」 */
export const PERSISTED_WORKSPACE_CONNECTIONS = "__cardnote_workspace_connections__";

/** 主区为「文件」 */
export const PERSISTED_WORKSPACE_ALL_ATTACHMENTS =
  "__cardnote_workspace_all_attachments__";

export const ATTACHMENTS_FILTER_STORAGE_PREFIX = "cardnote-attachments-filter:";

/** 「文件」顶栏类型筛选（与 {@link activeCollectionStorageKey} 同样按模式 / 用户分键） */
export function attachmentsFilterStorageKey(
  mode: AppDataMode,
  userId: string | null
): string {
  if (mode === "local") {
    return `${ATTACHMENTS_FILTER_STORAGE_PREFIX}local`;
  }
  return `${ATTACHMENTS_FILTER_STORAGE_PREFIX}remote:${userId ?? "guest"}`;
}

export function readPersistedAttachmentsFilterKey(
  key: string
): AttachmentFilterKey | null {
  const raw = safeGetItem(key)?.trim();
  if (!raw) return null;
  if ((ATTACHMENT_FILTER_KEYS as readonly string[]).includes(raw)) {
    return raw as AttachmentFilterKey;
  }
  return null;
}

export function writePersistedAttachmentsFilterKey(
  key: string,
  filter: AttachmentFilterKey
): void {
  safeSetItem(key, filter);
}

export function activeCollectionStorageKey(
  mode: AppDataMode,
  userId: string | null
): string {
  if (mode === "local") {
    return `${ACTIVE_COLLECTION_STORAGE_PREFIX}local`;
  }
  return `${ACTIVE_COLLECTION_STORAGE_PREFIX}remote:${userId ?? "guest"}`;
}

export function readPersistedActiveCollectionId(key: string): string | null {
  const raw = safeGetItem(key);
  if (!raw) return null;
  const t = raw.trim();
  return t.length ? t : null;
}

export const COLLAPSED_FOLDERS_STORAGE_PREFIX = "cardnote-sidebar-collapsed:";

export function collapsedFoldersStorageKey(
  mode: AppDataMode,
  userId: string | null
): string {
  if (mode === "local") {
    return `${COLLAPSED_FOLDERS_STORAGE_PREFIX}local`;
  }
  return `${COLLAPSED_FOLDERS_STORAGE_PREFIX}remote:${userId ?? "guest"}`;
}

export function readCollapsedFolderIdsFromStorage(key: string): Set<string> {
  const raw = safeGetItem(key);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0
      )
    );
  } catch {
    return new Set();
  }
}
export const FAVORITE_COLLECTIONS_STORAGE_PREFIX = "cardnote-favorite-collections:";

export function favoriteCollectionsStorageKey(userId: string | null): string {
  return `${FAVORITE_COLLECTIONS_STORAGE_PREFIX}${userId ?? "guest"}`;
}

export function loadFavoriteCollectionIds(key: string): Set<string> {
  const raw = safeGetItem(key);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter(
        (x): x is string => typeof x === "string" && x.length > 0
      )
    );
  } catch {
    return new Set();
  }
}

export function saveFavoriteCollectionIds(key: string, ids: Set<string>): void {
  safeSetItem(key, JSON.stringify([...ids]));
}

export const RECENT_COLLECTIONS_STORAGE_PREFIX = "cardnote-recent-collections:";

/** 概览侧栏「最近合集」上限：MRU 队列最大长度 */
export const RECENT_COLLECTIONS_LIMIT = 8;

export function recentCollectionsStorageKey(userId: string | null): string {
  return `${RECENT_COLLECTIONS_STORAGE_PREFIX}${userId ?? "guest"}`;
}

export function loadRecentCollectionIds(key: string): string[] {
  const raw = safeGetItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .slice(0, RECENT_COLLECTIONS_LIMIT);
  } catch {
    return [];
  }
}

export function saveRecentCollectionIds(key: string, ids: string[]): void {
  safeSetItem(key, JSON.stringify(ids.slice(0, RECENT_COLLECTIONS_LIMIT)));
}

export const TRASH_CARDS_STORAGE_PREFIX = "cardnote-trash-cards:";

export function trashCardsStorageKey(
  dataMode: AppDataMode,
  userId: string | null
): string {
  return `${TRASH_CARDS_STORAGE_PREFIX}${dataMode}:${userId ?? "guest"}`;
}

export function isTrashedNoteEntry(x: unknown): x is TrashedNoteEntry {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.trashId === "string" &&
    o.trashId.length > 0 &&
    typeof o.colId === "string" &&
    typeof o.colPathLabel === "string" &&
    typeof o.deletedAt === "string" &&
    o.card !== null &&
    typeof o.card === "object" &&
    typeof (o.card as NoteCard).id === "string"
  );
}

export function loadTrashedNoteEntries(key: string): TrashedNoteEntry[] {
  const raw = safeGetItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTrashedNoteEntry);
  } catch {
    return [];
  }
}

export function saveTrashedNoteEntries(
  key: string,
  entries: TrashedNoteEntry[]
): void {
  safeSetItem(key, JSON.stringify(entries));
}
