export type NewNotePlacement = "top" | "bottom";

const KEY = "mikujar.new-note-placement.v1";

export function readNewNotePlacement(): NewNotePlacement {
  try {
    if (typeof localStorage === "undefined") return "top";
    const raw = localStorage.getItem(KEY)?.trim();
    if (raw === "bottom") return "bottom";
    return "top";
  } catch {
    return "top";
  }
}

export function saveNewNotePlacement(p: NewNotePlacement): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, p);
  } catch {
    /* quota */
  }
}
