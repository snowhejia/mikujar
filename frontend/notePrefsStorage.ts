import { safeGetItem, safeSetItem } from "./lib/localPref";
import type { UserNotePrefs } from "./types";

const NOTE_PREFS_STORAGE_KEY = "cardnote-note-prefs-v1";

function emptyPrefs(): UserNotePrefs {
  return { disabledAutoLinkRuleIds: [] };
}

export function loadLocalNotePrefs(): UserNotePrefs {
  const raw = safeGetItem(NOTE_PREFS_STORAGE_KEY);
  if (!raw) return emptyPrefs();
  try {
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return emptyPrefs();
    const o = p as Record<string, unknown>;
    const dis = Array.isArray(o.disabledAutoLinkRuleIds)
      ? o.disabledAutoLinkRuleIds.filter((x): x is string => typeof x === "string")
      : [];
    const extra = Array.isArray(o.extraAutoLinkRules) ? o.extraAutoLinkRules : undefined;
    const clipCreatorTargetCollectionByPreset =
      o.clipCreatorTargetCollectionByPreset &&
      typeof o.clipCreatorTargetCollectionByPreset === "object"
        ? {
            ...(typeof (o.clipCreatorTargetCollectionByPreset as Record<string, unknown>).post_xhs ===
            "string"
              ? {
                  post_xhs: String(
                    (o.clipCreatorTargetCollectionByPreset as Record<string, unknown>)
                      .post_xhs
                  ).trim(),
                }
              : {}),
            ...(typeof (o.clipCreatorTargetCollectionByPreset as Record<string, unknown>)
              .post_bilibili === "string"
              ? {
                  post_bilibili: String(
                    (o.clipCreatorTargetCollectionByPreset as Record<string, unknown>)
                      .post_bilibili
                  ).trim(),
                }
              : {}),
          }
        : undefined;
    const tgr = o.timelineGalleryOnRight;
    const bgGrad = o.bgGradient;
    return {
      disabledAutoLinkRuleIds: dis,
      ...(Array.isArray(extra) ? { extraAutoLinkRules: extra as UserNotePrefs["extraAutoLinkRules"] } : {}),
      ...(clipCreatorTargetCollectionByPreset &&
      (clipCreatorTargetCollectionByPreset.post_xhs ||
        clipCreatorTargetCollectionByPreset.post_bilibili)
        ? { clipCreatorTargetCollectionByPreset }
        : {}),
      ...(typeof tgr === "boolean" ? { timelineGalleryOnRight: tgr } : {}),
      ...(typeof bgGrad === "boolean" ? { bgGradient: bgGrad } : {}),
    };
  } catch {
    return emptyPrefs();
  }
}

export function saveLocalNotePrefs(prefs: UserNotePrefs): void {
  safeSetItem(NOTE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}
