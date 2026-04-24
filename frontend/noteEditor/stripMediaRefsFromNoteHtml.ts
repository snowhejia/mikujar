import { resolveMediaUrl } from "../api/auth";
import type { NoteMediaItem } from "../types";
import { noteBodyToHtml } from "./plainHtml";

/** 收集用于与正文 src/href 比对的 URL（去重） */
export function collectMediaUrlsFromItems(items: NoteMediaItem[]): string[] {
  const s = new Set<string>();
  for (const m of items) {
    for (const k of [m.url, m.thumbnailUrl, m.coverUrl]) {
      if (typeof k === "string" && k.trim()) s.add(k.trim());
    }
  }
  return [...s];
}

function urlCanon(u: string): string {
  return resolveMediaUrl(u.trim());
}

function attrMatchesTargets(
  attrVal: string | null | undefined,
  targets: string[]
): boolean {
  if (!attrVal?.trim()) return false;
  const a = attrVal.trim();
  const ac = urlCanon(a);
  return targets.some((t) => {
    const tc = urlCanon(t);
    return ac === tc || a === t.trim();
  });
}

function pruneEmptyParagraph(p: Element | null) {
  if (!p || p.tagName !== "P") return;
  const text = (p.textContent ?? "").replace(/\u00a0/g, " ").trim();
  if (text === "" && p.children.length === 0) p.remove();
}

/**
 * 从笔记正文 HTML 中移除指向给定媒体 URL 的内嵌（img / video / audio / 独占段落的文件链接等）。
 */
export function stripMediaRefsFromNoteHtml(
  stored: string | undefined,
  targetUrls: string[]
): string {
  const targets = targetUrls.map((u) => u.trim()).filter(Boolean);
  if (targets.length === 0) return stored ?? "";

  const raw = noteBodyToHtml(stored);
  if (typeof document === "undefined") return raw;

  try {
    const doc = new DOMParser().parseFromString(
      `<div id="strip-root">${raw}</div>`,
      "text/html"
    );
    const root = doc.getElementById("strip-root");
    if (!root) return raw;

    root.querySelectorAll("img").forEach((img) => {
      if (!attrMatchesTargets(img.getAttribute("src"), targets)) return;
      const parent = img.parentElement;
      img.remove();
      pruneEmptyParagraph(parent);
    });

    root.querySelectorAll("video").forEach((el) => {
      const src =
        el.getAttribute("src")?.trim() ||
        el.querySelector("source")?.getAttribute("src")?.trim();
      if (!attrMatchesTargets(src, targets)) return;
      el.remove();
    });

    root.querySelectorAll("audio").forEach((el) => {
      const src =
        el.getAttribute("src")?.trim() ||
        el.querySelector("source")?.getAttribute("src")?.trim();
      if (!attrMatchesTargets(src, targets)) return;
      el.remove();
    });

    root.querySelectorAll("a[href]").forEach((a) => {
      if (!attrMatchesTargets(a.getAttribute("href"), targets)) return;
      const p = a.parentElement;
      if (
        p?.tagName === "P" &&
        p.childNodes.length === 1 &&
        p.firstChild === a
      ) {
        p.remove();
      } else {
        const text = a.textContent ?? "";
        a.replaceWith(doc.createTextNode(text));
        pruneEmptyParagraph(p);
      }
    });

    let inner = root.innerHTML.trim();
    if (!inner) inner = "<p></p>";
    return inner;
  } catch {
    return raw;
  }
}
