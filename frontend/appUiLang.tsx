import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readStoredLoginUiLang,
  writeStoredLoginUiLang,
  type LoginUiLang,
} from "./auth/loginUiI18n";

type AppUiLangContextValue = {
  lang: LoginUiLang;
  setLang: (lang: LoginUiLang) => void;
};

const AppUiLangContext = createContext<AppUiLangContextValue | null>(null);

export function AppUiLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LoginUiLang>(readStoredLoginUiLang);

  const setLang = useCallback((next: LoginUiLang) => {
    setLangState(next);
    writeStoredLoginUiLang(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <AppUiLangContext.Provider value={value}>
      {children}
    </AppUiLangContext.Provider>
  );
}

export function useAppUiLang(): AppUiLangContextValue {
  const ctx = useContext(AppUiLangContext);
  if (!ctx) {
    throw new Error("useAppUiLang 须在 AppUiLangProvider 内使用");
  }
  return ctx;
}
