import type { NoteCard } from "./types";
import { isClipPresetObjectKind } from "./notePresetTypesCatalog";
import { isFileCard } from "./appkit/collectionModel";

/** 从笔记 HTML 正文得到纯文本（供 AI、摘要等） */
export function plainTextFromNoteHtml(html: string): string {
  if (!html?.trim()) return "";
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}

/** 人物卡「名称」属性（sf-person-name），无则空串 */
export function readPersonNameFromCustomProps(card: NoteCard): string {
  for (const p of card.customProps ?? []) {
    if (p.id === "sf-person-name" && p.type === "text") {
      const v = p.value;
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

/** 剪藏父级「标题」字段（sf-clip-title），无则空串 */
export function readClipTitleFromCustomProps(card: NoteCard): string {
  for (const p of card.customProps ?? []) {
    if (p.id === "sf-clip-title" && p.type === "text") {
      const v = p.value;
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

/** 文件卡「标题」属性（sf-file-title） */
export function readFileTitleFromCustomProps(card: NoteCard): string {
  for (const p of card.customProps ?? []) {
    if (p.id === "sf-file-title" && p.type === "text") {
      const v = p.value;
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

export function cardHeadlinePlain(card: NoteCard): string {
  if ((card.objectKind ?? "note") === "person") {
    const n = readPersonNameFromCustomProps(card);
    if (n) return n.slice(0, 160);
  }
  if (isClipPresetObjectKind(card.objectKind)) {
    const t = readClipTitleFromCustomProps(card);
    if (t) return t.slice(0, 160);
  }
  if (isFileCard(card)) {
    const t = readFileTitleFromCustomProps(card);
    if (t) return t.slice(0, 160);
  }
  const plain = plainTextFromNoteHtml(card.text || "");
  const line = plain.split(/\n/)[0]?.trim() || "";
  return line.slice(0, 160);
}

export function buildTagsLineForAi(card: NoteCard): string | undefined {
  const tags = card.tags
    ?.map((t) => String(t).trim())
    .filter(Boolean);
  return tags?.length ? tags.join("、") : undefined;
}

export function buildAttachmentsLineForAi(card: NoteCard): string | undefined {
  const media = (card.media ?? []).filter((m) => m.url?.trim());
  if (!media.length) return undefined;
  return media
    .map((m) => {
      const n = m.name?.trim();
      return `${m.kind}${n ? `「${n}」` : ""}`;
    })
    .join("；");
}

/** 日历、提醒、置顶等（非正文） */
export function buildCardExtrasMetaForAi(card: NoteCard): string | undefined {
  const lines: string[] = [];
  if (card.addedOn) lines.push(`日历日：${card.addedOn}`);
  if (card.reminderOn) {
    let r = `提醒日：${card.reminderOn}`;
    if (card.reminderTime) r += ` ${card.reminderTime}`;
    lines.push(r);
  }
  if (card.reminderNote) lines.push(`提醒备注：${card.reminderNote}`);
  if (card.pinned) lines.push("在合集中置顶");
  return lines.length ? lines.join("\n") : undefined;
}
