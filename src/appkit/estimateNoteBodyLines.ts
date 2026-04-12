/**
 * 按「时间线左右分栏时偏窄的正文列」估算每行字符数，与当前真实纸宽无关，
 * 故切换左右/上下布局时估算值不变，可避免布局↔测量振荡。
 */
const NOMINAL_CHARS_PER_LINE_IN_SPLIT = 36;

/**
 * 从笔记 HTML 估算正文行数：块级换行 + 按固定行长折行，不读取 DOM、不依赖 offsetHeight。
 */
export function estimateNoteBodyLines(html: string): number {
  if (typeof html !== "string" || !html.trim()) return 1;

  let t = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  t = t
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|blockquote|tr)>/gi, "\n")
    .replace(/<\/(div|li)>/gi, "\n");
  t = t.replace(/<[^>]+>/g, "").replace(/\u00a0/g, " ");

  const chunks = t
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (chunks.length === 0) return 1;

  let total = 0;
  for (const chunk of chunks) {
    total += Math.max(
      1,
      Math.ceil(chunk.length / NOMINAL_CHARS_PER_LINE_IN_SPLIT)
    );
  }
  return Math.max(1, total);
}
