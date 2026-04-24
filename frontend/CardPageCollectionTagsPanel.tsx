import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Collection } from "./types";
import {
  collectionPathLabel,
  LOOSE_NOTES_COLLECTION_ID,
  walkCollectionsWithPath,
} from "./appkit/collectionModel";
import { tagChipInlineStyle } from "./tagChipPalette";

type ColRow = { col: Collection; path: string };

export function CardPageCollectionTagsPanel({
  instanceId,
  collections,
  selectedCollectionIds: idsProp,
  pickerExcludeIds,
  canEdit,
  onAdd,
  onRemove,
  addInputPlaceholder,
  dropdownEmptyText,
  dropdownAriaLabel,
  removePillAriaLabel,
  hideCollectionDots = false,
  unknownLabel,
  chipShape = "pill",
}: {
  instanceId: string;
  collections: Collection[];
  selectedCollectionIds: string[];
  /** 不可在下拉中再选的合集 id（如已归属、已关联、未归类） */
  pickerExcludeIds: Set<string>;
  canEdit: boolean;
  onAdd: (collectionId: string) => void | Promise<void>;
  onRemove: (collectionId: string) => void;
  addInputPlaceholder: string;
  dropdownEmptyText: string;
  dropdownAriaLabel: string;
  removePillAriaLabel: (pathLabel: string) => string;
  hideCollectionDots?: boolean;
  unknownLabel: string;
  chipShape?: "pill" | "rect";
}) {
  const idsKey = idsProp.join("\u0001");
  const [list, setList] = useState(idsProp);
  const [addDraft, setAddDraft] = useState("");
  const addDraftRef = useRef("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const itemElsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [menuFixedStyle, setMenuFixedStyle] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const listboxDomId = useMemo(
    () =>
      `card-page-col-tags-lb-${instanceId.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    [instanceId]
  );

  useEffect(() => {
    setList(idsProp);
  }, [instanceId, idsKey]);

  const pickableRows = useMemo((): ColRow[] => {
    return walkCollectionsWithPath(collections, []).filter(
      ({ col }) =>
        col.id !== LOOSE_NOTES_COLLECTION_ID &&
        !pickerExcludeIds.has(col.id)
    );
  }, [collections, pickerExcludeIds]);

  const dropdownEntries = useMemo((): ColRow[] => {
    const raw = addDraft.trim();
    const q = raw.toLowerCase();
    return pickableRows.filter(
      ({ path }) => !q || path.toLowerCase().includes(q)
    );
  }, [addDraft, pickableRows]);

  useEffect(() => {
    if (!dropdownOpen) return;
    setHighlightIndex((hi) => {
      const n = dropdownEntries.length;
      if (n === 0) return -1;
      return Math.min(Math.max(hi, 0), n - 1);
    });
  }, [dropdownOpen, dropdownEntries]);

  useEffect(() => {
    if (!dropdownOpen || highlightIndex < 0) return;
    itemElsRef.current[highlightIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, dropdownOpen, dropdownEntries.length]);

  const updateMenuPosition = useCallback(() => {
    const root = fieldRef.current;
    if (!root || !dropdownOpen) return;
    const r = root.getBoundingClientRect();
    setMenuFixedStyle({
      left: r.left,
      top: r.bottom + 5,
      width: r.width,
    });
  }, [dropdownOpen]);

  useLayoutEffect(() => {
    if (!dropdownOpen) {
      setMenuFixedStyle(null);
      return;
    }
    updateMenuPosition();
    const onWin = () => updateMenuPosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [dropdownOpen, updateMenuPosition, list, addDraft, dropdownEntries]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (fieldRef.current?.contains(t)) return;
      if (portalRef.current?.contains(t)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [dropdownOpen]);

  const setAddDraftSynced = useCallback((v: string) => {
    addDraftRef.current = v;
    setAddDraft(v);
  }, []);

  const pillLabel = useCallback(
    (colId: string) =>
      collectionPathLabel(collections, colId).trim() || unknownLabel,
    [collections, unknownLabel]
  );

  const pillStyle = useCallback(
    (colId: string): CSSProperties => tagChipInlineStyle(pillLabel(colId)),
    [pillLabel]
  );

  const pickRow = useCallback(
    (row: ColRow) => {
      if (list.includes(row.col.id)) return;
      void onAdd(row.col.id);
    },
    [list, onAdd]
  );

  const flushAddInput = useCallback(() => {
    const raw = addDraftRef.current.trim();
    setAddDraftSynced("");
    if (!raw) return;
    const exact = pickableRows.find(
      ({ path }) => path.toLowerCase() === raw.toLowerCase()
    );
    if (exact) {
      void pickRow(exact);
    }
  }, [pickRow, pickableRows, setAddDraftSynced]);

  const remove = useCallback(
    (colId: string) => {
      onRemove(colId);
    },
    [onRemove]
  );

  const pillExtra = chipShape === "rect" ? " card-page__tags-pill--rect" : "";
  const dropdownPillExtra =
    chipShape === "rect" ? " card-page__tags-dropdown-pill--rect" : "";

  if (!canEdit) {
    if (!idsProp.length) {
      return (
        <div className="card-page__tags-panel card-page__tags-panel--single-hit">
          <span className="card-page__prop-empty card-page__prop-empty--in-tags-panel">
            —
          </span>
        </div>
      );
    }
    return (
      <div className="card-page__tags-panel card-page__tags-panel--readonly">
        <div className="card-page__tags-pills">
          {idsProp.map((id) => {
            const label = pillLabel(id);
            return (
              <span
                key={id}
                className={"card-page__tags-pill" + pillExtra}
                style={pillStyle(id)}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  itemElsRef.current.length = 0;

  return (
    <div className="card-page__tags-panel">
      <div className="card-page__tags-field" ref={fieldRef}>
        <div className="card-page__tags-inline">
          {list.map((id) => {
            const label = pillLabel(id);
            return (
              <span
                key={id}
                className={
                  "card-page__tags-pill card-page__tags-pill--removable" +
                  pillExtra
                }
                style={pillStyle(id)}
              >
                <span className="card-page__tags-pill-text" title={label}>
                  {label}
                </span>
                <button
                  type="button"
                  className="card-page__tags-pill-remove"
                  aria-label={removePillAriaLabel(label)}
                  onClick={() => remove(id)}
                >
                  ×
                </button>
              </span>
            );
          })}
          <input
            type="text"
            className="card-page__tags-add-input"
            placeholder={addInputPlaceholder}
            value={addDraft}
            onChange={(e) => setAddDraftSynced(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            onBlur={flushAddInput}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setDropdownOpen(false);
                setHighlightIndex(-1);
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!dropdownOpen) setDropdownOpen(true);
                setHighlightIndex((i) => {
                  const n = dropdownEntries.length;
                  if (n === 0) return -1;
                  if (i < 0) return 0;
                  return Math.min(i + 1, n - 1);
                });
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (!dropdownOpen) setDropdownOpen(true);
                setHighlightIndex((i) => {
                  const n = dropdownEntries.length;
                  if (n === 0) return -1;
                  if (i <= 0) return 0;
                  return i - 1;
                });
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (
                  dropdownOpen &&
                  highlightIndex >= 0 &&
                  highlightIndex < dropdownEntries.length
                ) {
                  const row = dropdownEntries[highlightIndex]!;
                  void pickRow(row);
                  setAddDraftSynced("");
                  return;
                }
                flushAddInput();
              }
            }}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-controls={listboxDomId}
          />
        </div>
        {dropdownOpen && menuFixedStyle
          ? createPortal(
              <div
                id={listboxDomId}
                ref={portalRef}
                className="card-page__tags-dropdown card-page__tags-dropdown--fixed"
                style={{
                  position: "fixed",
                  left: menuFixedStyle.left,
                  top: menuFixedStyle.top,
                  width: menuFixedStyle.width,
                  zIndex: 60,
                }}
                role="listbox"
                aria-label={dropdownAriaLabel}
              >
                {dropdownEntries.length === 0 ? (
                  <div className="card-page__tags-dropdown-empty">
                    {dropdownEmptyText}
                  </div>
                ) : (
                  dropdownEntries.map((row, idx) => {
                    const active = idx === highlightIndex;
                    return (
                      <button
                        key={row.col.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        ref={(el) => {
                          itemElsRef.current[idx] = el;
                        }}
                        className={
                          "card-page__tags-dropdown-item" +
                          (active ? " is-active" : "")
                        }
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => {
                          void pickRow(row);
                          setAddDraftSynced("");
                        }}
                      >
                        {!hideCollectionDots ? (
                          <span
                            className="add-to-col-modal__dot"
                            style={{ backgroundColor: row.col.dotColor }}
                            aria-hidden
                          />
                        ) : null}
                        <span
                          className={
                            "card-page__tags-dropdown-pill" + dropdownPillExtra
                          }
                          style={tagChipInlineStyle(row.path)}
                        >
                          {row.path}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>,
              document.body
            )
          : null}
      </div>
    </div>
  );
}
