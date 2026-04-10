import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useAppChrome } from "./i18n/useAppChrome";

type LegalPageId = "terms" | "privacy";

type LegalPagesContextValue = {
  openTerms: () => void;
  openPrivacy: () => void;
  close: () => void;
};

const LegalPagesContext = createContext<LegalPagesContextValue | null>(null);

function legalDocumentUrl(page: LegalPageId): string {
  const path =
    page === "terms"
      ? `${import.meta.env.BASE_URL}legal/terms.html`
      : `${import.meta.env.BASE_URL}legal/privacy.html`;
  return new URL(path, window.location.href).href;
}

function LegalDocumentOverlay({
  page,
  onClose,
}: {
  page: LegalPageId;
  onClose: () => void;
}) {
  const c = useAppChrome();
  const src = useMemo(() => legalDocumentUrl(page), [page]);
  const title =
    page === "terms" ? c.profileTermsOfService : c.profilePrivacyPolicy;

  return createPortal(
    <div className="legal-doc-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <header className="legal-doc-overlay__bar">
        <button
          type="button"
          className="legal-doc-overlay__back"
          onClick={onClose}
        >
          {c.uiBack}
        </button>
        <h1 className="legal-doc-overlay__title">{title}</h1>
      </header>
      <iframe
        className="legal-doc-overlay__frame"
        title={title}
        src={src}
      />
    </div>,
    document.body
  );
}

export function LegalPagesProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<LegalPageId | null>(null);

  const close = useCallback(() => setPage(null), []);
  const openTerms = useCallback(() => setPage("terms"), []);
  const openPrivacy = useCallback(() => setPage("privacy"), []);

  const value = useMemo(
    () => ({ openTerms, openPrivacy, close }),
    [openTerms, openPrivacy, close]
  );

  return (
    <LegalPagesContext.Provider value={value}>
      {children}
      {page ? <LegalDocumentOverlay page={page} onClose={close} /> : null}
    </LegalPagesContext.Provider>
  );
}

export function useLegalPages(): LegalPagesContextValue {
  const ctx = useContext(LegalPagesContext);
  if (!ctx) {
    throw new Error("useLegalPages 须在 LegalPagesProvider 内使用");
  }
  return ctx;
}
