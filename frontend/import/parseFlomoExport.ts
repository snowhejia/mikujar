import type { ParsedExportNote } from "./parseAppleNotesExport";
import { normalizeExportFolderSegments } from "./parseAppleNotesExport";
import { htmlToPlainTextForImportCard } from "../noteEditor/plainHtml";

function relPathOf(f: File): string {
  return (
    (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
  ).replace(/\\/g, "/");
}

function dirnameOf(rel: string): string {
  const n = rel.replace(/\\/g, "/");
  const i = n.lastIndexOf("/");
  return i <= 0 ? "" : n.slice(0, i);
}

function clampMinutesOfDay(h: number, m: number): number {
  const hh = Math.max(0, Math.min(23, Math.floor(h)));
  const mm = Math.max(0, Math.min(59, Math.floor(m)));
  return hh * 60 + mm;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** 解析 Flomo 导出 HTML 内 `.time` 文本，如 `2026-03-30 20:53:20` */
function parseFlomoMemoTime(
  raw: string
): { addedOn: string; minutesOfDay: number } | undefined {
  const t = raw.trim();
  const m = t.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})$/
  );
  if (!m) return undefined;
  const y = +m[1]!;
  const mo = +m[2]!;
  const d = +m[3]!;
  const h = +m[4]!;
  const min = +m[5]!;
  if (y < 1990 || y > 2100) return undefined;
  const dt = new Date(y, mo - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return undefined;
  }
  return {
    addedOn: `${y}-${pad2(mo)}-${pad2(d)}`,
    minutesOfDay: clampMinutesOfDay(h, min),
  };
}

function buildPathIndex(files: File[]): Map<string, File> {
  const m = new Map<string, File>();
  for (const f of files) {
    const r = relPathOf(f).replace(/^\//, "");
    m.set(r, f);
  }
  return m;
}

/** 将 HTML 内相对 `file/` 的引用解析为 zip/文件夹内的完整相对路径 */
function resolveFlomoAssetKey(htmlDir: string, src: string): string {
  const s = src.trim().replace(/^\.\//, "");
  if (!s.startsWith("file/")) return "";
  const base = htmlDir.replace(/\/+$/, "");
  const joined = base ? `${base}/${s}` : s;
  return joined.replace(/\/+/g, "/");
}

const MEDIA_ATTR_SELECTORS = [
  "img[src]",
  "audio[src]",
  "video[src]",
  "source[src]",
] as const;

/**
 * 检测是否为 flomo 导出的主 HTML（标题含 flomo 标识与 memo 卡片结构）。
 */
export function sniffFlomoExportHtml(htmlSnippet: string): boolean {
  return (
    /flomo\s*·\s*浮墨/i.test(htmlSnippet) &&
    /class="memo"/.test(htmlSnippet)
  );
}

async function findFlomoMainHtml(files: File[]): Promise<File | null> {
  const htmlCandidates = files.filter((f) => /\.html?$/i.test(relPathOf(f)));
  const headLen = 65536;

  for (const f of htmlCandidates) {
    const head = await f.slice(0, headLen).text();
    if (!/flomo\s*·\s*浮墨/i.test(head)) continue;

    if (head.includes('class="memo"')) {
      return f;
    }

    if (f.size > headLen) {
      const midStart = Math.min(200000, Math.max(0, f.size - 500000));
      const mid = await f.slice(midStart, midStart + 300000).text();
      if (mid.includes('class="memo"')) {
        return f;
      }
    }
  }

  return null;
}

/**
 * 从「选择文件夹 / ZIP 解压」得到的文件列表中解析 flomo 导出。
 * 若不是 flomo 格式则返回空数组。
 */
export async function parseFlomoExportDirectory(
  files: File[]
): Promise<ParsedExportNote[]> {
  const list = Array.from(files);
  const mainHtml = await findFlomoMainHtml(list);
  if (!mainHtml) return [];

  const raw = await mainHtml.text();
  if (!sniffFlomoExportHtml(raw.slice(0, Math.min(raw.length, 120000)))) {
    return [];
  }

  const pathIndex = buildPathIndex(list);
  const htmlRel = relPathOf(mainHtml).replace(/^\//, "");
  const htmlDir = dirnameOf(htmlRel);

  const doc = new DOMParser().parseFromString(raw, "text/html");
  const memos = doc.querySelectorAll(".memo");
  const out: ParsedExportNote[] = [];

  for (const memo of memos) {
    const timeText = memo.querySelector(".time")?.textContent?.trim() ?? "";
    const tf = parseFlomoMemoTime(timeText);

    const contentEl = memo.querySelector(".content");
    const filesEl = memo.querySelector(".files");
    if (!contentEl && !filesEl) continue;

    const wrap = document.createElement("div");
    if (contentEl) wrap.appendChild(contentEl.cloneNode(true));
    if (filesEl) wrap.appendChild(filesEl.cloneNode(true));
    const clone = wrap;
    const attachments: File[] = [];
    const seen = new Set<string>();

    for (const sel of MEDIA_ATTR_SELECTORS) {
      for (const el of clone.querySelectorAll(sel)) {
        const src =
          el.getAttribute("src") ||
          (el.tagName === "SOURCE" ? el.getAttribute("src") : null);
        if (!src || src.startsWith("data:") || src.startsWith("http")) {
          continue;
        }
        const key = resolveFlomoAssetKey(htmlDir, src);
        if (!key) continue;
        const file = pathIndex.get(key);
        if (file) {
          if (!seen.has(key)) {
            seen.add(key);
            attachments.push(file);
          }
        }
        el.remove();
      }
    }

    for (const ap of clone.querySelectorAll(".audio-player")) {
      if (!(ap as HTMLElement).textContent?.trim()) {
        ap.remove();
      }
    }

    let bodyHtml = clone.innerHTML.trim();
    if (!bodyHtml || bodyHtml === "<br>") {
      bodyHtml = "<p></p>";
    }

    const plain = htmlToPlainTextForImportCard(bodyHtml);
    const title =
      plain.replace(/\s+/g, " ").trim().slice(0, 80) || "flomo";

    const folderSegments = normalizeExportFolderSegments(
      htmlDir.split("/").filter(Boolean)
    );

    out.push({
      title,
      bodyHtml,
      attachmentFiles: attachments,
      folderSegments,
      timeFromFilename: tf,
    });
  }

  out.sort((a, b) => {
    const ta = a.timeFromFilename;
    const tb = b.timeFromFilename;
    if (ta && tb) {
      const c =
        ta.addedOn.localeCompare(tb.addedOn) || ta.minutesOfDay - tb.minutesOfDay;
      if (c !== 0) return c;
    } else if (ta && !tb) return -1;
    else if (!ta && tb) return 1;
    return a.title.localeCompare(b.title, "zh-Hans-CN");
  });

  return out;
}
