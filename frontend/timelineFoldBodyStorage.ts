import { createBooleanPref } from "./lib/localPref";

const pref = createBooleanPref("cardnote.timeline-fold-body-3.v1");

/** 为 true 时时间线卡片正文折叠预览（完整两行，卡片高度不变） */
export const readTimelineFoldBodyThreeLines = pref.read;

export const saveTimelineFoldBodyThreeLines = pref.save;
