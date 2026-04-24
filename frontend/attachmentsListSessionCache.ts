import type { AttachmentFilterKey } from "./noteMediaCategory";
import type { MeAttachmentListItem } from "./api/mePreferences";
import {
  safeSessionGetItem,
  safeSessionRemoveItemsByPrefix,
  safeSessionSetItem,
} from "./lib/localPref";

const PREFIX = "cardnote-remote-attachments:v1:";

type CachedPayload = {
  items: MeAttachmentListItem[];
  total: number;
};

function pageKey(
  userKey: string,
  filterKey: AttachmentFilterKey,
  offset: number
): string {
  return `${PREFIX}${userKey}:${filterKey}:${offset}`;
}

/** 读取上一屏缓存（同标签页刷新后立即可用；附件变更后应先 {@link clearRemoteAttachmentsListCacheForUser}） */
export function readRemoteAttachmentsPageCache(
  userKey: string,
  filterKey: AttachmentFilterKey,
  offset: number
): { items: MeAttachmentListItem[]; total: number } | null {
  const raw = safeSessionGetItem(pageKey(userKey, filterKey, offset));
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as CachedPayload;
    if (!j || !Array.isArray(j.items) || typeof j.total !== "number") {
      return null;
    }
    return { items: j.items, total: j.total };
  } catch {
    return null;
  }
}

export function writeRemoteAttachmentsPageCache(
  userKey: string,
  filterKey: AttachmentFilterKey,
  offset: number,
  data: { items: MeAttachmentListItem[]; total: number }
): void {
  const payload: CachedPayload = {
    items: data.items,
    total: data.total,
  };
  safeSessionSetItem(pageKey(userKey, filterKey, offset), JSON.stringify(payload));
}

/** 附件增删等导致列表失效时清空该用户的列表缓存（避免同会话内读到旧网格） */
export function clearRemoteAttachmentsListCacheForUser(userKey: string): void {
  safeSessionRemoveItemsByPrefix(`${PREFIX}${userKey}:`);
}

const PAGE_INDEX_PREFIX = "cardnote-all-attachments-page-index:v1:";

function allAttachmentsPageIndexKey(
  userKey: string,
  dataMode: "local" | "remote",
  filterKey: AttachmentFilterKey
): string {
  return `${PAGE_INDEX_PREFIX}${userKey}:${dataMode}:${filterKey}`;
}

/** 刷新后恢复「文件」分页（按用户 / 模式 / 筛选） */
export function readAllAttachmentsStoredPageIndex(
  userKey: string,
  dataMode: "local" | "remote",
  filterKey: AttachmentFilterKey
): number | null {
  const raw = safeSessionGetItem(
    allAttachmentsPageIndexKey(userKey, dataMode, filterKey)
  );
  if (raw == null) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function writeAllAttachmentsStoredPageIndex(
  userKey: string,
  dataMode: "local" | "remote",
  filterKey: AttachmentFilterKey,
  pageIndex: number
): void {
  if (!Number.isFinite(pageIndex) || pageIndex < 0) return;
  safeSessionSetItem(
    allAttachmentsPageIndexKey(userKey, dataMode, filterKey),
    String(Math.trunc(pageIndex))
  );
}
