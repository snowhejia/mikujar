import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { Collection } from "./types";
import {
  formatByteSize,
  summarizeNoteLibraryStats,
} from "./noteStats";

type DataStatsModalProps = {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
};

export function DataStatsModal({
  open,
  onClose,
  collections,
}: DataStatsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const stats = useMemo(
    () => summarizeNoteLibraryStats(collections),
    [collections]
  );

  if (!open) return null;

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
          数据统计
        </h2>
        <p className="auth-modal__hint data-stats-modal__hint">
          当前工作区内的合集、卡片与附件占用（按本机已记录或可推算的数据汇总）。
        </p>

        <dl className="data-stats-modal__list">
          <div className="data-stats-modal__row">
            <dt>合集</dt>
            <dd>{stats.collectionCount}</dd>
          </div>
          <div className="data-stats-modal__row">
            <dt>卡片</dt>
            <dd>{stats.cardCount}</dd>
          </div>
          <div className="data-stats-modal__row">
            <dt>附件</dt>
            <dd>
              {stats.attachmentCount} 个 ·{" "}
              {formatByteSize(stats.attachmentBytes)}
            </dd>
          </div>
        </dl>

        {stats.hasUnknownSizedAttachments ? (
          <p className="data-stats-modal__footnote">
            部分远程链接、本地路径或未记录大小的附件未计入体积；新上传的附件会自动带上大小。
          </p>
        ) : null}

        <div className="auth-modal__actions">
          <button
            type="button"
            className="auth-modal__btn auth-modal__btn--primary auth-modal__btn--primary--full"
            onClick={onClose}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
