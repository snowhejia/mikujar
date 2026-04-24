import type { NoteMediaItem } from "./types";

/** 附件是否为 PDF（仅依据文件名 / URL 路径，无独立 MIME 字段） */
export function isPdfAttachment(item: NoteMediaItem): boolean {
  if (item.kind !== "file") return false;
  const name = (item.name ?? "").trim().toLowerCase();
  if (name.endsWith(".pdf")) return true;
  try {
    const path = item.url.split("?")[0].split("#")[0].toLowerCase();
    return path.endsWith(".pdf");
  } catch {
    return false;
  }
}
