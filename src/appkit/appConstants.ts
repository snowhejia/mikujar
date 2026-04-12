/**
 * 与 App.css 中抽屉/手机顶栏一致：
 * - 视口 ≤900px，或
 * - 大屏触控设备（粗指针 + 无悬停，典型为平板），侧拉与手机同一套。
 */
/** 大屏触控平板（不含窄屏手机），与 MOBILE_CHROME 第二子句一致 */
export const TABLET_WIDE_TOUCH_MEDIA =
  "(min-width: 901px) and (hover: none) and (pointer: coarse)";

export const MOBILE_CHROME_MEDIA = `(max-width: 900px), (${TABLET_WIDE_TOUCH_MEDIA})`;

export function matchesMobileChromeMedia(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_CHROME_MEDIA).matches;
}

/**
 * 时间线有附件、单列表头：由 {@link estimateNoteBodyLines} 估算的正文行数 ≥ 此值则上下叠放。
 * 与像素高度脱钩，避免左右↔上下切换改变纸宽后高度反馈振荡。
 */
export const TIMELINE_GALLERY_STACK_MIN_BODY_LINES = 14;

/**
 * 滞回：已为上下叠放时，估算行数低于此值才恢复左右分栏。须小于 {@link TIMELINE_GALLERY_STACK_MIN_BODY_LINES}。
 */
export const TIMELINE_GALLERY_STACK_EXIT_BODY_LINES = 10;

/** @deprecated 已改用 {@link TIMELINE_GALLERY_STACK_MIN_BODY_LINES}（正文行数估计），勿用于布局判定 */
export const DESKTOP_TIMELINE_GALLERY_STACK_PAPER_MIN_HEIGHT_PX = 360;

/** @deprecated 已改用 {@link TIMELINE_GALLERY_STACK_EXIT_BODY_LINES} */
export const DESKTOP_TIMELINE_GALLERY_STACK_PAPER_EXIT_HEIGHT_PX = 280;

/** @deprecated 宽度判断已改为 {@link matchesMobileChromeMedia}；保留供旧逻辑对照 */
export const MOBILE_NAV_SWIPE_LAYOUT_MAX_PX = 900;
export const MOBILE_NAV_SWIPE_OPEN_MIN_DX = 56;
export const MOBILE_NAV_SWIPE_CLOSE_MIN_DX = 56;
export const MOBILE_NAV_SWIPE_AXIS_RATIO = 1.25;
/** 仅从屏幕左缘划入时打开，减少与正文/编辑器手势冲突 */
export const MOBILE_NAV_SWIPE_FROM_LEFT_PX = 40;
