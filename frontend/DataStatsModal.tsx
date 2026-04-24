import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { Collection } from "./types";
import type { MediaQuotaInfo } from "./api/auth";
import { useAppChrome } from "./i18n/useAppChrome";
import {
  formatByteSize,
  summarizeNoteLibraryStats,
} from "./noteStats";

type AccountRole = "admin" | "user" | "subscriber";

type DataStatsModalProps = {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
  mediaQuota?: MediaQuotaInfo | null;
  role?: AccountRole | null;
  /** 打开时刷新 /me，保证配额为最新 */
  onOpen?: () => void | Promise<void>;
};

export function DataStatsModal({
  open,
  onClose,
  collections,
  mediaQuota,
  role,
  onOpen,
}: DataStatsModalProps) {
  const c = useAppChrome();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !onOpen) return;
    void onOpen();
  }, [open, onOpen]);

  const stats = useMemo(
    () => summarizeNoteLibraryStats(collections),
    [collections]
  );

  const quotaPct = useMemo(() => {
    if (!mediaQuota || mediaQuota.quotaUnlimited) return 0;
    if (mediaQuota.monthlyLimitBytes <= 0) return 0;
    return Math.min(
      100,
      (mediaQuota.uploadedBytesMonth / mediaQuota.monthlyLimitBytes) * 100
    );
  }, [mediaQuota]);

  if (!open) return null;

  const roleLabel =
    role === "admin"
      ? c.dataStatsRoleAdmin
      : role === "subscriber"
        ? c.dataStatsRoleSubscriber
        : role === "user"
          ? c.dataStatsRoleUser
          : null;

  const panel = (
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal data-stats-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-stats-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="data-stats-title" className="auth-modal__title">
          {c.dataStatsTitle}
        </h2>
        <p className="auth-modal__hint data-stats-modal__hint">
          {c.dataStatsHint}
        </p>

        <dl className="data-stats-modal__list">
          <div className="data-stats-modal__row">
            <dt>{c.dataStatsCollections}</dt>
            <dd>{stats.collectionCount}</dd>
          </div>
          <div className="data-stats-modal__row">
            <dt>{c.dataStatsCards}</dt>
            <dd>{stats.cardCount}</dd>
          </div>
          <div className="data-stats-modal__row">
            <dt>{c.dataStatsAttachments}</dt>
            <dd>
              {c.dataStatsAttachmentLine(
                stats.attachmentCount,
                formatByteSize(stats.attachmentBytes)
              )}
            </dd>
          </div>
        </dl>

        {mediaQuota && roleLabel ? (
          <div className="data-stats-modal__quota">
            <div className="data-stats-modal__quota-head">
              <span className="data-stats-modal__quota-label">
                {c.dataStatsQuotaHead}
              </span>
              <span className="data-stats-modal__quota-plan">{roleLabel}</span>
            </div>
            {mediaQuota.quotaUnlimited ? (
              <p className="data-stats-modal__quota-meta data-stats-modal__quota-meta--admin">
                {c.dataStatsAdminUnlimited}
              </p>
            ) : (
              <>
                <div
                  className="data-stats-modal__quota-bar-wrap"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(quotaPct)}
                  aria-label={c.dataStatsQuotaAria}
                >
                  <div
                    className="data-stats-modal__quota-bar"
                    style={{ width: `${quotaPct}%` }}
                  />
                </div>
                <p className="data-stats-modal__quota-meta">
                  {c.dataStatsQuotaLine(
                    formatByteSize(mediaQuota.uploadedBytesMonth),
                    formatByteSize(mediaQuota.monthlyLimitBytes),
                    mediaQuota.usageMonth
                  )}
                </p>
                <p className="data-stats-modal__quota-meta data-stats-modal__quota-meta--inline">
                  <span>
                    {c.dataStatsSingleFile(
                      formatByteSize(mediaQuota.singleFileMaxBytes)
                    )}
                  </span>
                  <span className="data-stats-modal__quota-meta-sep" aria-hidden>
                    ·
                  </span>
                  <span className="data-stats-modal__quota-meta-sub">
                    {c.dataStatsDeleteNoRefund}
                  </span>
                </p>
              </>
            )}
          </div>
        ) : null}

        <div className="auth-modal__actions">
          <button
            type="button"
            className="auth-modal__btn auth-modal__btn--primary auth-modal__btn--primary--full"
            onClick={onClose}
          >
            {c.done}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
