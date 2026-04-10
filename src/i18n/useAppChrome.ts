import { useMemo } from "react";
import { useAppUiLang } from "../appUiLang";
import type { AppChrome } from "./appChrome";
import { getAppChrome } from "./appChrome";
import type { ExtraModalChrome } from "./extraModalChrome";
import { getExtraModalChrome } from "./extraModalChrome";
import type { ScatteredUiChrome } from "./scatteredUiChrome";
import { getScatteredUiChrome } from "./scatteredUiChrome";

export type FullAppChrome = AppChrome &
  ExtraModalChrome &
  ScatteredUiChrome;

export function useAppChrome(): FullAppChrome {
  const { lang } = useAppUiLang();
  return useMemo(
    () => ({
      ...getAppChrome(lang),
      ...getExtraModalChrome(lang),
      ...getScatteredUiChrome(lang),
    }),
    [lang]
  );
}
