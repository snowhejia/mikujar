import type { NoteCard } from "./types";

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

export function cardHeadlinePlain(card: NoteCard): string {
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
