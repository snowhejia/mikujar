/**
 * 品牌重命名 mikujar → cardnote 的一次性存储迁移。
 *
 * 背景：localStorage / sessionStorage 里所有 `mikujar*` 前缀的 key 在这次品牌改名里
 * 改成了 `cardnote*`。直接换 key 会让已有用户丢设置、丢登录态、丢展开状态等。
 *
 * 策略：在应用入口（main.tsx）导入即运行一次，遍历 localStorage + sessionStorage，
 * 把所有 `mikujar` 开头的 key 复制到对应 `cardnote` key（如果目标不存在），然后删掉老 key。
 *
 * 只处理 Web Storage；IndexedDB（mikujar-media-blobs）和 Tauri 本地文件目录（mikujar/media）
 * 不动，避免用户缓存/本地媒体资源被错误重置。
 */
function renameKey(oldKey: string): string | null {
  if (oldKey.startsWith("mikujar")) {
    return "cardnote" + oldKey.slice("mikujar".length);
  }
  // 个别 key 形如 `__mikujar_workspace_*__`（前缀是 `__`，中间才是 mikujar）
  if (oldKey.startsWith("__mikujar_")) {
    return "__cardnote_" + oldKey.slice("__mikujar_".length);
  }
  return null;
}

function migrateStorage(store: Storage): void {
  if (typeof store === "undefined") return;
  const renames: Array<{ oldKey: string; newKey: string }> = [];
  for (let i = 0; i < store.length; i += 1) {
    const k = store.key(i);
    if (!k) continue;
    const nk = renameKey(k);
    if (nk) renames.push({ oldKey: k, newKey: nk });
  }
  for (const { oldKey, newKey } of renames) {
    try {
      const val = store.getItem(oldKey);
      if (val !== null && store.getItem(newKey) === null) {
        store.setItem(newKey, val);
      }
      store.removeItem(oldKey);
    } catch {
      // 配额 / 安全策略异常：忽略单条，不影响启动
    }
  }
}

let migrated = false;

export function runBrandStorageMigration(): void {
  if (migrated) return;
  migrated = true;
  try {
    if (typeof window !== "undefined") {
      migrateStorage(window.localStorage);
      migrateStorage(window.sessionStorage);
    }
  } catch {
    // localStorage 在某些隐私浏览 / iframe 沙盒里会抛 SecurityError，吞掉
  }
}
