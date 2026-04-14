const KEY = "mikujar.hide-sidebar-collection-dots.v1";

/** 为 true 时侧栏合集名称前不显示彩色圆点（收藏行与合集树一致） */
export function readHideSidebarCollectionDots(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(KEY)?.trim() === "1";
  } catch {
    return false;
  }
}

export function saveHideSidebarCollectionDots(hide: boolean): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, hide ? "1" : "0");
  } catch {
    /* quota */
  }
}
