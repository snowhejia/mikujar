import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useAppChrome } from "../i18n/useAppChrome";
import { useAppUiLang } from "../appUiLang";
import type { Collection } from "../types";
import {
  PRESET_OBJECT_TYPES_GROUPS,
  presetTypeParentCard,
  type PresetObjectTypeItem,
  type PresetTypeGroup,
} from "../notePresetTypesCatalog";
import { findCollectionById, walkCollections } from "./collectionModel";

const NONE_VAL = "none";

function presetSelectValue(presetTypeId: string): string {
  return `preset:${presetTypeId}`;
}

function isCatalogPresetId(id: string): boolean {
  for (const g of PRESET_OBJECT_TYPES_GROUPS) {
    if (g.baseId === id) return true;
    if (g.children.some((c) => c.id === id)) return true;
  }
  return false;
}

export type CollectionCategoryChoice =
  | { kind: "none" }
  | {
      kind: "preset";
      presetTypeId: string;
      group: PresetTypeGroup;
      child?: PresetObjectTypeItem;
    };

export type CollectionCategoryDialogState = {
  collectionId: string;
  displayName: string;
};

function choiceFromSelectValue(val: string): CollectionCategoryChoice | null {
  if (val === NONE_VAL) return { kind: "none" };
  if (!val.startsWith("preset:")) return null;
  const id = val.slice("preset:".length);
  for (const g of PRESET_OBJECT_TYPES_GROUPS) {
    if (g.baseId === id) {
      return { kind: "preset", presetTypeId: g.baseId, group: g };
    }
    for (const ch of g.children) {
      if (ch.id === id) {
        return {
          kind: "preset",
          presetTypeId: ch.id,
          group: g,
          child: ch,
        };
      }
    }
  }
  return null;
}

function findOtherCollectionWithPreset(
  collections: Collection[],
  presetTypeId: string,
  excludeId: string
): Collection | null {
  let hit: Collection | null = null;
  walkCollections(collections, (c) => {
    if (c.id === excludeId) return;
    if ((c.presetTypeId ?? "").trim() === presetTypeId) hit = c;
  });
  return hit;
}

type Props = {
  dialog: CollectionCategoryDialogState | null;
  collections: Collection[];
  onClose: () => void;
  onConfirm: (collectionId: string, choice: CollectionCategoryChoice) => void;
};

export function CollectionCategoryModal({
  dialog,
  collections,
  onClose,
  onConfirm,
}: Props) {
  const c = useAppChrome();
  const { lang } = useAppUiLang();
  const [selectValue, setSelectValue] = useState("");

  const col = dialog
    ? findCollectionById(collections, dialog.collectionId)
    : undefined;

  const presetLabel = (item: PresetObjectTypeItem) =>
    lang === "en" ? item.nameEn : item.nameZh;

  const optionsFlat = useMemo(() => {
    const label = (item: PresetObjectTypeItem) =>
      lang === "en" ? item.nameEn : item.nameZh;
    const rows: { value: string; label: string }[] = [];
    for (const g of PRESET_OBJECT_TYPES_GROUPS) {
      const parent = presetTypeParentCard(g);
      if (g.children.length === 0) {
        rows.push({
          value: presetSelectValue(g.baseId),
          label: `${parent.emoji} ${label(parent)}`,
        });
      } else {
        rows.push({
          value: presetSelectValue(g.baseId),
          label: `${parent.emoji} ${label(parent)} ${c.uiCollectionCategoryParentRowSuffix}`,
        });
        for (const ch of g.children) {
          rows.push({
            value: presetSelectValue(ch.id),
            label: `${ch.emoji} ${label(ch)}`,
          });
        }
      }
    }
    return rows;
  }, [c.uiCollectionCategoryParentRowSuffix, lang]);

  useEffect(() => {
    if (!dialog) {
      setSelectValue("");
      return;
    }
    const row = findCollectionById(collections, dialog.collectionId);
    if (!row) {
      setSelectValue("");
      return;
    }
    const pid = (row.presetTypeId ?? "").trim();
    if (!pid) {
      setSelectValue(NONE_VAL);
      return;
    }
    if (isCatalogPresetId(pid)) {
      setSelectValue(presetSelectValue(pid));
      return;
    }
    setSelectValue("");
  }, [dialog, collections]);

  if (!dialog) return null;

  const choice = choiceFromSelectValue(selectValue);
  const canSubmit = choice !== null && selectValue.length > 0;

  const presetConflictLabel = (ch: CollectionCategoryChoice): string => {
    if (ch.kind === "none") return "";
    if (ch.child) return `${ch.child.emoji} ${presetLabel(ch.child)}`;
    const parent = presetTypeParentCard(ch.group);
    return `${parent.emoji} ${presetLabel(parent)}`;
  };

  return createPortal(
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal collection-merge-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-category-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="collection-category-dialog-title" className="auth-modal__title">
          {c.uiCollectionCategoryDialogTitle}
        </h2>
        <p className="collection-merge-dialog__body">
          {c.uiCollectionCategoryDialogHint(dialog.displayName)}
        </p>
        {(col?.presetTypeId ?? "").trim() &&
        !isCatalogPresetId((col?.presetTypeId ?? "").trim()) ? (
          <p className="collection-merge-dialog__body collection-merge-dialog__body--muted">
            {c.uiCollectionCategoryCustomHint((col?.presetTypeId ?? "").trim())}
          </p>
        ) : null}
        <div className="collection-merge-dialog__field">
          <label
            className="collection-merge-dialog__label"
            htmlFor="collection-category-preset"
          >
            {c.uiCollectionCategoryPickLabel}
          </label>
          <select
            id="collection-category-preset"
            className="auth-modal__input collection-merge-dialog__select"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          >
            {selectValue === "" ? (
              <option value="" disabled>
                {c.uiCollectionCategoryPlaceholder}
              </option>
            ) : null}
            <option value={NONE_VAL}>{c.uiCollectionCategoryOptionNone}</option>
            {optionsFlat.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit || !choice) return;
              if (choice.kind === "preset") {
                const other = findOtherCollectionWithPreset(
                  collections,
                  choice.presetTypeId,
                  dialog.collectionId
                );
                if (other) {
                  window.alert(
                    c.uiCollectionCategoryConflict(
                      presetConflictLabel(choice),
                      other.name
                    )
                  );
                  return;
                }
              }
              const cid = dialog.collectionId;
              onClose();
              onConfirm(cid, choice);
            }}
          >
            {c.uiCollectionCategoryConfirm}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
