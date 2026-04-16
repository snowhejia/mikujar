import type { NoteMediaItem } from "./types";

/** 主栏标题旁「类型」分段：全部｜图片｜视频｜音乐｜文档｜其他 */
export type AttachmentKindSegment =
  | "all"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "other";

export const ATTACHMENT_KIND_SEGMENTS: readonly AttachmentKindSegment[] = [
  "all",
  "image",
  "video",
  "audio",
  "document",
  "other",
];

/** 视为「文档」的常见扩展名（其余 file 归入「其他」） */
const DOCUMENT_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "dot",
  "dotx",
  "rtf",
  "odt",
  "xls",
  "xlsx",
  "xlsm",
  "ods",
  "csv",
  "ppt",
  "pptx",
  "pps",
  "odp",
  "key",
  "txt",
  "md",
  "markdown",
  "tex",
  "epub",
  "mobi",
  "azw",
  "azw3",
  "pages",
  "numbers",
  "html",
  "htm",
]);

export function extensionFromAttachmentItem(item: NoteMediaItem): string {
  const name = item.name?.trim();
  if (name?.includes(".")) {
    const p = name.split(".").pop()?.toLowerCase().trim();
    if (p && /^[a-z0-9]{1,12}$/i.test(p)) return p;
  }
  try {
    const u = new URL(item.url, "https://local.invalid");
    const leaf = u.pathname.split(/[/\\]/).pop() ?? "";
    if (leaf.includes(".")) {
      const p = leaf.split(".").pop()?.toLowerCase().trim();
      if (p) return p;
    }
  } catch {
    /* ignore */
  }
  return "";
}

export function isDocumentLikeAttachment(item: NoteMediaItem): boolean {
  if (item.kind !== "file") return false;
  const ext = extensionFromAttachmentItem(item);
  if (!ext) return false;
  return DOCUMENT_EXTENSIONS.has(ext);
}

export function matchesAttachmentKindSegment(
  item: NoteMediaItem,
  segment: AttachmentKindSegment
): boolean {
  switch (segment) {
    case "all":
      return true;
    case "image":
      return item.kind === "image";
    case "video":
      return item.kind === "video";
    case "audio":
      return item.kind === "audio";
    case "document":
      return item.kind === "file" && isDocumentLikeAttachment(item);
    case "other":
      return item.kind === "file" && !isDocumentLikeAttachment(item);
    default:
      return true;
  }
}
