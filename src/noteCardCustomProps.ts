import { LOOSE_NOTES_COLLECTION_ID } from "./appkit/collectionModel";
import type { CardProperty } from "./types";

/** 将旧版 `select` / `multiSelect` 并入 `choice`（值均为 string[] | null） */
export function migrateCustomPropToChoice(p: CardProperty): CardProperty {
  const t = p.type as string;
  if (t === "select") {
    const v = p.value;
    const arr =
      typeof v === "string" && v.trim() ? [v.trim()] : [];
    return {
      ...p,
      type: "choice",
      value: arr.length ? arr : null,
    };
  }
  if (t === "multiSelect") {
    return { ...p, type: "choice" };
  }
  return p;
}

export function migrateCustomPropsList(props: CardProperty[]): CardProperty[] {
  return props.map((p) => {
    let x = migrateCustomPropToChoice(p);
    if (x.type === "collectionLink" && Array.isArray(x.value)) {
      const arr = x.value as string[];
      const v = arr.filter(
        (id) =>
          typeof id === "string" &&
          id.trim() &&
          id !== LOOSE_NOTES_COLLECTION_ID
      );
      if (v.length !== arr.length) {
        x = { ...x, value: v.length ? v : null };
      }
    }
    if (x.type === "cardLink" && x.value != null && typeof x.value === "object") {
      const o = x.value as Record<string, unknown>;
      const colId = typeof o.colId === "string" ? o.colId.trim() : "";
      const cardId = typeof o.cardId === "string" ? o.cardId.trim() : "";
      if (!colId || !cardId) {
        x = { ...x, value: null };
      }
    }
    return x;
  });
}
