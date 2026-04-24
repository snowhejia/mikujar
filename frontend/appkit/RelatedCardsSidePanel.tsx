import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { htmlToPlainText } from "../noteEditor/plainHtml";
import type { Collection } from "../types";
import {
  collectionPathLabel,
  findCardInTree,
  flattenAllCardsWithPath,
  previewCardTextOneLine,
} from "./collectionModel";
import {
  RELATED_PICK_POOL_MAX,
  RELATED_PICK_ROW_EST_PX,
  relatedPickSimilarity,
} from "./relatedPick";
import { useAppChrome } from "../i18n/useAppChrome";
import { useRelatedPanelSwipe } from "./useRelatedPanelSwipe";

export function RelatedCardsSidePanel({
  sourceColId,
  sourceCardId,
  collections,
  canEdit,
  onClose,
  onRemoveRelation,
  onAddRelation,
  onNavigateToCard,
}: {
  sourceColId: string;
  sourceCardId: string;
  collections: Collection[];
  canEdit: boolean;
  onClose: () => void;
  onRemoveRelation: (targetColId: string, targetCardId: string) => void;
  onAddRelation: (targetColId: string, targetCardId: string) => void;
  onNavigateToCard: (targetColId: string, targetCardId: string) => void;
}) {
  const c = useAppChrome();
  const [pickQuery, setPickQuery] = useState("");
  const [pickSlots, setPickSlots] = useState(14);
  const pickGrowRef = useRef<HTMLDivElement>(null);
  const source = findCardInTree(collections, sourceColId, sourceCardId);

  useEffect(() => {
    setPickQuery("");
  }, [sourceColId, sourceCardId]);

  useLayoutEffect(() => {
    if (!canEdit || !source) return;
    const el = pickGrowRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      const slots = Math.max(
        4,
        Math.min(120, Math.floor(h / RELATED_PICK_ROW_EST_PX))
      );
      setPickSlots(slots);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [canEdit, source, sourceColId, sourceCardId, pickQuery]);

  const relatedList = useMemo(() => {
    if (!source) return [];
    const refs = source.card.relatedRefs ?? [];
    return refs.map((ref) => {
      const hit = findCardInTree(collections, ref.colId, ref.cardId);
      return { ref, hit };
    });
  }, [source, collections]);

  const pickCandidatesSorted = useMemo(() => {
    if (!source) return [];
    const flat = flattenAllCardsWithPath(collections, []);
    const q = pickQuery.trim().toLowerCase();
    const relatedSet = new Set(
      (source.card.relatedRefs ?? []).map(
        (r) => `${r.colId}\0${r.cardId}`
      )
    );
    relatedSet.add(`${sourceColId}\0${sourceCardId}`);
    const filtered = flat.filter(({ col, card }) => {
      if (relatedSet.has(`${col.id}\0${card.id}`)) return false;
      if (!q) return true;
      return (
        htmlToPlainText(card.text).toLowerCase().includes(q) ||
        (card.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        col.name.toLowerCase().includes(q)
      );
    });
    const scored = filtered.map((row) => ({
      col: row.col,
      card: row.card,
      path: row.path,
      score: relatedPickSimilarity(
        sourceColId,
        source.card,
        row.col,
        row.card,
        row.path,
        q
      ),
    }));
    scored.sort(
      (a, b) =>
        b.score - a.score || a.path.localeCompare(b.path, "zh-CN")
    );
    const top = scored.slice(0, RELATED_PICK_POOL_MAX);
    return top.map(({ col, card, path }) => ({ col, card, path }));
  }, [collections, pickQuery, source, sourceColId, sourceCardId]);

  const pickCandidatesShown = useMemo(
    () => pickCandidatesSorted.slice(0, pickSlots),
    [pickCandidatesSorted, pickSlots]
  );

  /** 打开时从右侧滑入（与侧栏 transition 节奏一致） */
  const [slideIn, setSlideIn] = useState(false);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSlideIn(true);
      return;
    }
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => setSlideIn(true));
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, []);

  const relatedSwipe = useRelatedPanelSwipe({ onClose });

  return (
    <div
      className={
        "related-panel-mount" + (slideIn ? " related-panel-mount--slide-in" : "")
      }
    >
      <div
        className="related-panel-backdrop"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className={
          "related-panel" + (slideIn ? " related-panel--slide-in" : "")
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="related-panel-title"
        onTouchStart={relatedSwipe.onTouchStart}
        onTouchEnd={relatedSwipe.onTouchEnd}
        onTouchCancel={relatedSwipe.onTouchCancel}
      >
        <div className="related-panel__head">
          <h2 id="related-panel-title" className="related-panel__title">
            {c.uiRelatedNotes}
          </h2>
          <button
            type="button"
            className="related-panel__close"
            aria-label={c.uiClose}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div
          className={
            "related-panel__body" +
            (source ? " related-panel__body--with-pick" : "")
          }
        >
          {!source ? (
            <p className="related-panel__hint">{c.uiRelatedSourceMissing}</p>
          ) : (
            <>
              <div className="related-panel__upper">
                {relatedList.length === 0 ? (
                  <p className="related-panel__hint">
                    {canEdit
                      ? c.uiRelatedEmptySearch
                      : c.uiRelatedEmptyPlain}
                  </p>
                ) : (
                  <ul className="related-panel__list">
                    {relatedList.map(({ ref, hit }) => (
                      <li
                        key={`${ref.colId}-${ref.cardId}`}
                        className={
                          "related-panel__item" +
                          (hit ? " related-panel__item--row" : "")
                        }
                      >
                        {hit ? (
                          <>
                            <button
                              type="button"
                              className="related-panel__item-hit"
                              onClick={() =>
                                onNavigateToCard(hit.col.id, hit.card.id)
                              }
                            >
                              <div className="related-panel__item-path">
                                {collectionPathLabel(collections, hit.col.id)}
                              </div>
                              <div className="related-panel__item-text">
                                {previewCardTextOneLine(hit.card.text)}
                              </div>
                            </button>
                            {canEdit ? (
                              <button
                                type="button"
                                className="related-panel__unlink"
                                aria-label={c.uiRelatedUnlink}
                                title={c.uiRelatedUnlink}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveRelation(ref.colId, ref.cardId);
                                }}
                              >
                                ×
                              </button>
                            ) : null}
                          </>
                        ) : (
                          <div className="related-panel__missing-wrap related-panel__missing-row">
                            <p className="related-panel__missing">
                              {c.uiRelatedPeerMissing}
                            </p>
                            {canEdit ? (
                              <button
                                type="button"
                                className="related-panel__unlink"
                                aria-label={c.uiRelatedUnlinkBroken}
                                title={c.uiRelatedUnlinkBroken}
                                onClick={() =>
                                  onRemoveRelation(ref.colId, ref.cardId)
                                }
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {canEdit ? (
                <div className="related-panel__add related-panel__add--fill">
                  <p className="related-panel__add-label">
                    {c.uiRelatedPasteLabel}
                  </p>
                  <input
                    type="text"
                    className="related-panel__add-input"
                    placeholder={c.uiRelatedSearchPlaceholder}
                    value={pickQuery}
                    onChange={(e) => setPickQuery(e.target.value)}
                    autoComplete="off"
                  />
                  <div
                    ref={pickGrowRef}
                    className="related-panel__pick-grow"
                  >
                    {pickCandidatesShown.length > 0 ? (
                      <ul className="related-panel__pick-list">
                        {pickCandidatesShown.map(({ col, card, path }) => (
                          <li key={`${col.id}-${card.id}`}>
                            <button
                              type="button"
                              className="related-panel__pick-row"
                              onClick={() => {
                                onAddRelation(col.id, card.id);
                                setPickQuery("");
                              }}
                            >
                              <span className="related-panel__pick-path">
                                {path}
                              </span>
                              <span className="related-panel__pick-text">
                                {previewCardTextOneLine(card.text, 48)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : pickQuery.trim() ? (
                      <p className="related-panel__hint related-panel__hint--pick">
                        {c.uiRelatedNoResults}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="related-panel__add related-panel__add--fill related-panel__add--readonly">
                  <p className="related-panel__add-label">
                    {c.uiRelatedPasteLabel}
                  </p>
                  <div className="related-panel__readonly-lower-body">
                    <p className="related-panel__hint">
                      {c.uiRelatedReadOnly}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
