import { useEffect } from "react";
import { createPortal } from "react-dom";
import { isTauri } from "@tauri-apps/api/core";
import type { AppDataMode } from "./appDataModeStorage";
import type { NewNotePlacement } from "./newNotePlacementStorage";

type NoteSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  newNotePlacement: NewNotePlacement;
  setNewNotePlacement: (p: NewNotePlacement) => void;
  dataMode: AppDataMode;
  setDataMode: (mode: AppDataMode) => void;
};

export function NoteSettingsModal({
  open,
  onClose,
  newNotePlacement,
  setNewNotePlacement,
  dataMode,
  setDataMode,
}: NoteSettingsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tauri = isTauri();

  const panel = (
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal note-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="note-settings-title" className="auth-modal__title">
          笔记设置
        </h2>
        <p className="auth-modal__hint note-settings-modal__hint">
          调整新建笔记出现的位置，以及笔记数据保存在本机还是云端。
        </p>

        <p className="note-settings-modal__label">新建笔记位置</p>
        <div
          className="note-settings-modal__choice-row"
          role="group"
          aria-label="新建笔记位置"
        >
          <button
            type="button"
            className={
              "note-settings-modal__choice" +
              (newNotePlacement === "top"
                ? " note-settings-modal__choice--active"
                : "")
            }
            aria-pressed={newNotePlacement === "top"}
            onClick={() => setNewNotePlacement("top")}
          >
            时间线顶部
          </button>
          <button
            type="button"
            className={
              "note-settings-modal__choice" +
              (newNotePlacement === "bottom"
                ? " note-settings-modal__choice--active"
                : "")
            }
            aria-pressed={newNotePlacement === "bottom"}
            onClick={() => setNewNotePlacement("bottom")}
          >
            时间线底部
          </button>
        </div>

        <p className="note-settings-modal__label">数据存储位置</p>
        <div
          className="note-settings-modal__choice-row note-settings-modal__choice-row--stack"
          role="group"
          aria-label="数据存储位置"
        >
          {tauri ? (
            <button
              type="button"
              className={
                "note-settings-modal__choice note-settings-modal__choice--block" +
                (dataMode === "local"
                  ? " note-settings-modal__choice--active"
                  : "")
              }
              aria-pressed={dataMode === "local"}
              onClick={() => setDataMode("local")}
            >
              本地（此设备）
            </button>
          ) : null}
          <button
            type="button"
            className={
              "note-settings-modal__choice note-settings-modal__choice--block" +
              (dataMode === "remote"
                ? " note-settings-modal__choice--active"
                : "")
            }
            aria-pressed={dataMode === "remote"}
            onClick={() => setDataMode("remote")}
          >
            云端
          </button>
        </div>

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
