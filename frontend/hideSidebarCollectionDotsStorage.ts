import { createBooleanPref } from "./lib/localPref";

const pref = createBooleanPref("cardnote.hide-sidebar-collection-dots.v1");

/** 为 true 时侧栏合集名称前不显示彩色圆点（收藏行与合集树一致） */
export const readHideSidebarCollectionDots = pref.read;

export const saveHideSidebarCollectionDots = pref.save;
