import type { NoteAssistImagePart } from "./noteAssist";
import { apiBase } from "./apiBase";
import type { NoteMediaItem } from "../types";

const MAX_IMAGES = 14;
/** 单张 base64 前原始体积上限（略小于服务端校验） */
const MAX_RAW_BYTES = 4 * 1024 * 1024;

function resolveAbsoluteUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const base = apiBase().replace(/\/$/, "");
  if (base && u.startsWith("/")) return `${base}${u}`;
  if (typeof window !== "undefined" && u.startsWith("/")) {
    return `${window.location.origin}${u}`;
  }
  return u;
}

function guessMimeFromUrl(url: string): string {
  const lower = url.split("?")[0]?.toLowerCase() ?? "";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

async function blobToDataBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function fetchImagePart(
  url: string,
  label: string
): Promise<NoteAssistImagePart | null> {
  const abs = resolveAbsoluteUrl(url);
  if (!abs) return null;
  try {
    const base = apiBase().replace(/\/$/, "");
    const sameAsApi =
      typeof window !== "undefined" &&
      Boolean(base) &&
      (abs.startsWith(base) || abs.startsWith(`${window.location.origin}/`));
    const init: RequestInit = {
      mode: "cors",
      credentials: sameAsApi ? "include" : "omit",
    };
    const res = await fetch(abs, init);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size > MAX_RAW_BYTES) return null;
    let mime = blob.type && blob.type.startsWith("image/") ? blob.type : "";
    if (!mime) mime = guessMimeFromUrl(abs);
    if (!mime.startsWith("image/")) return null;
    const dataBase64 = await blobToDataBase64(blob);
    return { label, mimeType: mime, dataBase64 };
  } catch {
    return null;
  }
}

function imageMediaItems(media: NoteMediaItem[] | undefined): NoteMediaItem[] {
  return (media ?? []).filter(
    (m) =>
      m.kind === "image" && Boolean((m.url || m.thumbnailUrl || "").trim())
  );
}

/**
 * 从当前卡片与相关条目的配图拉取可送 Gemini 的图片（主卡片优先，再相关卡片；张数与体积有上限）。
 */
export async function gatherNoteAssistImageParts(arg: {
  mainMedia: NoteMediaItem[] | undefined;
  related: Array<{ collectionName: string; media?: NoteMediaItem[] }>;
}): Promise<NoteAssistImagePart[]> {
  const out: NoteAssistImagePart[] = [];

  const main = imageMediaItems(arg.mainMedia);
  let idx = 0;
  for (const m of main) {
    if (out.length >= MAX_IMAGES) break;
    idx += 1;
    const src = (m.url || m.thumbnailUrl || "").trim();
    const part = await fetchImagePart(
      src,
      `当前笔记·配图 ${idx}${m.name ? `（${m.name}）` : ""}`
    );
    if (part) out.push(part);
  }

  for (let r = 0; r < arg.related.length; r++) {
    const rel = arg.related[r];
    const imgs = imageMediaItems(rel.media);
    let j = 0;
    for (const m of imgs) {
      if (out.length >= MAX_IMAGES) return out;
      j += 1;
      const src = (m.url || m.thumbnailUrl || "").trim();
      const cn = (rel.collectionName || "相关笔记").slice(0, 40);
      const part = await fetchImagePart(
        src,
        `相关「${cn}」·图 ${j}${m.name ? `（${m.name}）` : ""}`
      );
      if (part) out.push(part);
    }
  }

  return out;
}
