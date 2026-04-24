import { createEnumPref } from "./lib/localPref";

export type NewNotePlacement = "top" | "bottom";

const pref = createEnumPref<NewNotePlacement>(
  "cardnote.new-note-placement.v1",
  ["top", "bottom"],
  "top"
);

export const readNewNotePlacement = pref.read;
export const saveNewNotePlacement = pref.save;
