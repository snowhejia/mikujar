import { createPortal } from "react-dom";
import { useAppChrome } from "../i18n/useAppChrome";

export type CollectionDeleteDialogState = {
  id: string;
  displayName: string;
  hasSubtree: boolean;
};

type Props = {
  dialog: CollectionDeleteDialogState | null;
  onClose: () => void;
  onConfirmRemove: (id: string) => void;
};

export function CollectionDeleteDialog({
  dialog,
  onClose,
  onConfirmRemove,
}: Props) {
  const c = useAppChrome();
  if (!dialog) return null;
  return createPortal(
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="collection-delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="collection-delete-dialog-title" className="auth-modal__title">
          {c.uiDeleteCollectionDialogTitle}
        </h2>
        <p className="auth-modal__hint">
          {dialog.hasSubtree
            ? c.uiDeleteCollectionWithSubtree(dialog.displayName)
            : c.uiDeleteCollectionLeaf(dialog.displayName)}
        </p>
        <div className="auth-modal__actions">
          <button
            type="button"
            className="auth-modal__btn auth-modal__btn--ghost"
            onClick={onClose}
          >
            {c.profileCancel}
          </button>
          <button
            type="button"
            className="auth-modal__btn auth-modal__btn--primary"
            onClick={() => {
              const id = dialog.id;
              onClose();
              onConfirmRemove(id);
            }}
          >
            {c.uiConfirmDelete}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
