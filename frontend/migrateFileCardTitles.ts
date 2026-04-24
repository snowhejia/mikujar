import { isFileCard } from "./appkit/collectionModel";
import { deriveFileCardTitleFromMedia } from "./fileCardTitle";
import {
  plainTextFromNoteHtml,
  readFileTitleFromCustomProps,
} from "./notePlainText";
import type { CardProperty, Collection, NoteCard } from "./types";

const MAX_TITLE_LEN = 500;

/**
 * 若文件卡尚未填写属性「标题」，则从正文首行（如 former ## 标题）或附件文件名推断一条可写入的标题；否则返回 null。
 */
export function migrationTitleCandidateForFileCard(card: NoteCard): string | null {
  if (!isFileCard(card)) return null;
  if (readFileTitleFromCustomProps(card).trim()) return null;

  const plain = plainTextFromNoteHtml(card.text || "");
  const lines = plain
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let candidate = lines[0] ?? "";
  candidate = candidate.replace(/^#{1,6}\s+/, "").trim();
  if (candidate.length > MAX_TITLE_LEN) {
    candidate = candidate.slice(0, MAX_TITLE_LEN);
  }
  if (candidate) return candidate;

  const m0 = card.media?.find((x) => (x.url ?? "").trim());
  if (m0) {
    const t = deriveFileCardTitleFromMedia(m0).trim();
    if (t) return t.slice(0, MAX_TITLE_LEN);
  }
  return null;
}

/** 合并写入 sf-file-title，保留其余 customProps */
export function mergeFileTitleIntoCustomProps(
  card: NoteCard,
  title: string
): CardProperty[] {
  const raw = [...(card.customProps ?? [])];
  const idx = raw.findIndex((p) => p.id === "sf-file-title");
  const entry: CardProperty = {
    id: "sf-file-title",
    name: "标题",
    type: "text",
    value: title,
  };
  if (idx >= 0) {
    return raw.map((p, i) =>
      i === idx ? { ...p, ...entry, name: p.name?.trim() ? p.name : entry.name } : p
    );
  }
  return [...raw, entry];
}

/** 深度映射每张卡片（用于本地批量写入） */
export function mapEveryCardInCollections(
  cols: Collection[],
  mapFn: (card: NoteCard) => NoteCard
): Collection[] {
  return cols.map((col) => ({
    ...col,
    cards: col.cards.map(mapFn),
    children: col.children?.length
      ? mapEveryCardInCollections(col.children, mapFn)
      : col.children,
  }));
}
