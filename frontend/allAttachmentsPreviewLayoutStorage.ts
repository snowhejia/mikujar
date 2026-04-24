import { createEnumPref } from "./lib/localPref";

export type AttachmentsPreviewLayout = "contain" | "square";

const pref = createEnumPref<AttachmentsPreviewLayout>(
  "cardnote.attachmentsPreviewLayout",
  ["contain", "square"],
  "contain"
);

export const readAttachmentsPreviewLayout = pref.read;
export const writeAttachmentsPreviewLayout = pref.save;
