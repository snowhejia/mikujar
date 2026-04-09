/**
 * 判断 JWT 会话是否有权通过 /api/upload/cos-read 换取某 COS 对象的 GET 预签名 URL。
 * @param {string} key 对象键（无前导 /）
 * @param {{ sub: string | null; role?: string; apiToken?: boolean }} session
 */
export function canSessionReadCosObjectKey(key, session) {
  const k = String(key || "").replace(/^\//, "");
  const mediaP = (process.env.COS_MEDIA_PREFIX?.trim() || "mikujar/media").replace(
    /\/$/,
    ""
  );

  if (session.apiToken || session.role === "admin") return true;

  const uid = session.sub;
  if (!uid) return false;

  const avatarRe = /^mikujar\/avatars\/([a-zA-Z0-9._-]+)\.[a-zA-Z0-9]+$/;
  const ma = avatarRe.exec(k);
  if (ma) return ma[1] === uid;

  const esc = mediaP.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const scoped = new RegExp(`^${esc}/([a-zA-Z0-9._-]+)/`);
  const mm = scoped.exec(k);
  if (mm) return mm[1] === uid;

  const legacy = new RegExp(`^${esc}/[^/]+$`);
  if (legacy.test(k)) return true;

  return false;
}
