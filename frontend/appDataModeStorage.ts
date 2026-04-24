import { safeGetItem, safeSetItem } from "./lib/localPref";

const STORAGE_KEY = "cardnote.appDataMode";

export type AppDataMode = "local" | "remote";

export function getStoredAppDataMode(): AppDataMode | null {
  const v = safeGetItem(STORAGE_KEY);
  if (v === "local" || v === "remote") return v;
  return null;
}

/**
 * 当前模式：未写过存储时默认云端（与服务器同步）。
 * - 浏览器：不提供「本地」数据模式，若曾存过 local 则写回 remote。
 * - Tauri 桌面：与当前网页版产品一致，仅云端；曾选 local 的迁移为 remote，便于一进应用即登录墙。
 */
export function getAppDataMode(): AppDataMode {
  const stored = getStoredAppDataMode() ?? "remote";
  if (stored === "local") {
    safeSetItem(STORAGE_KEY, "remote");
    return "remote";
  }
  return stored;
}

export function setAppDataMode(mode: AppDataMode): void {
  safeSetItem(STORAGE_KEY, mode === "local" ? "remote" : mode);
}
