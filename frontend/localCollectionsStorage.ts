import type { Collection } from "./types";
import { migrateCollectionTree } from "./migrateCollections";
import { safeGetItem, safeSetItem } from "./lib/localPref";

const KEY = "cardnote.local.v1.collections";

export function loadLocalCollections(
  fallback: () => Collection[]
): Collection[] {
  const raw = safeGetItem(KEY);
  if (!raw) return fallback();
  try {
    return migrateCollectionTree(JSON.parse(raw) as unknown);
  } catch {
    return fallback();
  }
}

export function saveLocalCollections(data: Collection[]): void {
  safeSetItem(KEY, JSON.stringify(data));
}
