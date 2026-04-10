/**
 * 合集数据变更 → SSE 推送给同一用户（或单库 __single__）下所有在线标签页。
 */

/** @type {Map<string, Set<import("http").ServerResponse>>} */
const subscribers = new Map();

/**
 * @param {string} ownerKey 与 preferencesOwnerKey 一致：多用户为 userId，单库为 __single__
 * @param {import("http").ServerResponse} res
 * @returns {() => void} 取消订阅（幂等）
 */
export function subscribeCollectionsSync(ownerKey, res) {
  let set = subscribers.get(ownerKey);
  if (!set) {
    set = new Set();
    subscribers.set(ownerKey, set);
  }
  set.add(res);
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    set.delete(res);
    if (set.size === 0) subscribers.delete(ownerKey);
  };
  res.on("close", cleanup);
  res.on("error", cleanup);
  return cleanup;
}

/**
 * @param {string} ownerKey
 * @param {Record<string, unknown>} [extra]
 */
export function broadcastCollectionsChanged(ownerKey, extra = {}) {
  const set = subscribers.get(ownerKey);
  if (!set || set.size === 0) return;
  const payload = JSON.stringify({
    type: "collections_changed",
    ...extra,
  });
  const chunk = `data: ${payload}\n\n`;
  for (const r of [...set]) {
    try {
      if (!r.writableEnded) r.write(chunk);
    } catch {
      set.delete(r);
    }
  }
}
