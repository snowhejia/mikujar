const KEY = "mikujar.timeline-fold-body-3.v1";

/** 为 true 时时间线卡片正文以约三行高度折叠显示 */
export function readTimelineFoldBodyThreeLines(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(KEY)?.trim() === "1";
  } catch {
    return false;
  }
}

export function saveTimelineFoldBodyThreeLines(on: boolean): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* quota */
  }
}
