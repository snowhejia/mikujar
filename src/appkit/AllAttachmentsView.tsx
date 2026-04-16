import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useMediaDisplaySrc } from "../mediaDisplay";
import { fileLabelFromUrl, NoteMediaThumbBody } from "../CardGallery";
import { formatDurationClock, formatHumanBytes } from "../attachmentFormat";
import { useAppChrome, type FullAppChrome } from "../i18n/useAppChrome";
import type { AttachmentListEntry } from "./collectionModel";
import type { NoteMediaItem } from "../types";
import {
  matchesAttachmentKindSegment,
  type AttachmentKindSegment,
} from "../attachmentKindSegment";

export type { AttachmentKindSegment } from "../attachmentKindSegment";

const BATCH = 40;

type SizeFilter = "all" | "lt1m" | "1_10" | "gt10";
type RatioFilter = "all" | "landscape" | "portrait" | "square";
/** 音视频时长（分钟档，与大小分档同名不同义） */
type DurationFilter = "all" | "lt1m" | "1_10" | "gt10";

const SIZE_FILTER_ORDER: readonly SizeFilter[] = [
  "all",
  "lt1m",
  "1_10",
  "gt10",
];

const RATIO_FILTER_ORDER: readonly RatioFilter[] = [
  "all",
  "landscape",
  "portrait",
  "square",
];

const DURATION_FILTER_ORDER: readonly DurationFilter[] = [
  "all",
  "lt1m",
  "1_10",
  "gt10",
];

function labelForSizeFilter(c: FullAppChrome, v: SizeFilter): string {
  switch (v) {
    case "all":
      return c.attachmentsFilterSizeAll;
    case "lt1m":
      return c.attachmentsFilterSizeLt1m;
    case "1_10":
      return c.attachmentsFilterSize1to10m;
    case "gt10":
      return c.attachmentsFilterSizeGt10m;
  }
}

function labelForRatioFilter(c: FullAppChrome, v: RatioFilter): string {
  switch (v) {
    case "all":
      return c.attachmentsFilterRatioAll;
    case "landscape":
      return c.attachmentsFilterRatioLandscape;
    case "portrait":
      return c.attachmentsFilterRatioPortrait;
    case "square":
      return c.attachmentsFilterRatioSquare;
  }
}

function labelForDurationFilter(c: FullAppChrome, v: DurationFilter): string {
  switch (v) {
    case "all":
      return c.attachmentsFilterDurationAll;
    case "lt1m":
      return c.attachmentsFilterDurationLt1m;
    case "1_10":
      return c.attachmentsFilterDuration1to10m;
    case "gt10":
      return c.attachmentsFilterDurationGt10m;
  }
}

function dimKey(e: AttachmentListEntry): string {
  return `${e.colId}:${e.card.id}:${e.mediaIndex}`;
}

function passesSize(item: NoteMediaItem, f: SizeFilter): boolean {
  if (f === "all") return true;
  const sb = item.sizeBytes;
  if (sb == null || !Number.isFinite(sb)) return true;
  const mb = sb / (1024 * 1024);
  if (f === "lt1m") return mb < 1;
  if (f === "1_10") return mb >= 1 && mb <= 10;
  if (f === "gt10") return mb > 10;
  return true;
}

function matchesRatio(w: number, h: number, f: RatioFilter): boolean {
  if (f === "all") return true;
  const r = w / h;
  if (f === "landscape") return r >= 1.25;
  if (f === "portrait") return r <= 0.8;
  if (f === "square") return r >= 0.88 && r <= 1.12;
  return true;
}

function passesRatioFilter(
  e: AttachmentListEntry,
  ratioFilter: RatioFilter,
  dimMap: Map<string, { w: number; h: number } | null>
): boolean {
  if (ratioFilter === "all") return true;
  if (e.item.kind === "audio" || e.item.kind === "file") return false;
  if (e.item.kind !== "image" && e.item.kind !== "video") return false;
  const k = dimKey(e);
  const d = dimMap.get(k);
  if (d === undefined) return true;
  if (d === null) return false;
  return matchesRatio(d.w, d.h, ratioFilter);
}

function passesDurationFilter(
  e: AttachmentListEntry,
  durationFilter: DurationFilter,
  durationMap: Map<string, number | null>
): boolean {
  if (durationFilter === "all") return true;
  if (e.item.kind !== "video" && e.item.kind !== "audio") return false;
  const k = dimKey(e);
  const sec = durationMap.get(k);
  if (sec === undefined) return true;
  if (sec === null) return false;
  const min = sec / 60;
  if (durationFilter === "lt1m") return min < 1;
  if (durationFilter === "1_10") return min >= 1 && min <= 10;
  if (durationFilter === "gt10") return min > 10;
  return true;
}

function AttachmentDimsProbe({
  item,
  dimKey: key,
  onDim,
}: {
  item: NoteMediaItem;
  dimKey: string;
  onDim: (k: string, d: { w: number; h: number } | null) => void;
}) {
  const imgSrc = useMediaDisplaySrc(
    item.kind === "image" ? (item.thumbnailUrl ?? item.url) : ""
  );
  const videoSrc = useMediaDisplaySrc(item.kind === "video" ? item.url : "");

  useEffect(() => {
    let cancelled = false;
    if (item.kind === "image") {
      if (!imgSrc) return undefined;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w > 0 && h > 0) onDim(key, { w, h });
        else onDim(key, null);
      };
      img.onerror = () => {
        if (!cancelled) onDim(key, null);
      };
      img.src = imgSrc;
      return () => {
        cancelled = true;
        img.onload = null;
        img.onerror = null;
      };
    }
    if (item.kind === "video") {
      if (!videoSrc) return undefined;
      const v = document.createElement("video");
      v.preload = "metadata";
      v.playsInline = true;
      v.onloadedmetadata = () => {
        if (cancelled) return;
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (w > 0 && h > 0) onDim(key, { w, h });
        else onDim(key, null);
      };
      v.onerror = () => {
        if (!cancelled) onDim(key, null);
      };
      v.src = videoSrc;
      return () => {
        cancelled = true;
        v.removeAttribute("src");
        v.load();
      };
    }
    return undefined;
  }, [item.kind, imgSrc, videoSrc, key, onDim, item.thumbnailUrl, item.url]);

  return null;
}

function AttachmentDurationProbe({
  item,
  durKey: key,
  onDur,
}: {
  item: NoteMediaItem;
  durKey: string;
  onDur: (k: string, sec: number | null) => void;
}) {
  const src = useMediaDisplaySrc(
    item.kind === "video" || item.kind === "audio" ? item.url : ""
  );

  useEffect(() => {
    if (item.kind !== "video" && item.kind !== "audio") return undefined;
    if (!src) return undefined;
    let cancelled = false;
    const el = document.createElement(
      item.kind === "video" ? "video" : "audio"
    );
    el.preload = "metadata";
    const onMeta = () => {
      if (cancelled) return;
      const d = el.duration;
      if (Number.isFinite(d) && !Number.isNaN(d) && d > 0 && d < 1e7) {
        onDur(key, d);
      } else {
        onDur(key, null);
      }
    };
    const onErr = () => {
      if (!cancelled) onDur(key, null);
    };
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("error", onErr);
    el.src = src;
    return () => {
      cancelled = true;
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("error", onErr);
      el.removeAttribute("src");
      el.load();
    };
  }, [src, item.kind, key, onDur, item.url]);

  return null;
}

function AttachmentAvDuration({ item }: { item: NoteMediaItem }) {
  const src = useMediaDisplaySrc(
    item.kind === "video" || item.kind === "audio" ? item.url : ""
  );
  const [sec, setSec] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (item.kind !== "video" && item.kind !== "audio") return undefined;
    if (!src) return undefined;
    const el = document.createElement(
      item.kind === "video" ? "video" : "audio"
    );
    el.preload = "metadata";
    const onMeta = () => {
      const d = el.duration;
      if (Number.isFinite(d) && !Number.isNaN(d) && d > 0 && d < 1e7) {
        setSec(d);
      } else {
        setSec(null);
      }
    };
    const onErr = () => setSec(null);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("error", onErr);
    el.src = src;
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("error", onErr);
      el.removeAttribute("src");
      el.load();
    };
  }, [src, item.kind]);

  if (item.kind !== "video" && item.kind !== "audio") return null;
  if (sec === undefined) {
    return (
      <span className="attachments-page__meta-muted" aria-hidden>
        …
      </span>
    );
  }
  if (sec === null) {
    return (
      <span className="attachments-page__meta-muted" aria-hidden>
        —
      </span>
    );
  }
  return <span>{formatDurationClock(sec)}</span>;
}

export function AllAttachmentsView({
  entries,
  scrollRootRef,
  onOpenCard,
  kindSegment,
}: {
  entries: AttachmentListEntry[];
  scrollRootRef: RefObject<HTMLElement | null>;
  onOpenCard: (colId: string, cardId: string) => void;
  kindSegment: AttachmentKindSegment;
}) {
  const c = useAppChrome();
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [ratioFilter, setRatioFilter] = useState<RatioFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [dimMap, setDimMap] = useState(
    () => new Map<string, { w: number; h: number } | null>()
  );
  const [durationMap, setDurationMap] = useState(
    () => new Map<string, number | null>()
  );

  const showRatioFilter =
    kindSegment === "image" || kindSegment === "video";
  const showDurationFilter =
    kindSegment === "video" || kindSegment === "audio";

  const effectiveRatioFilter: RatioFilter = showRatioFilter
    ? ratioFilter
    : "all";
  const effectiveDurationFilter: DurationFilter = showDurationFilter
    ? durationFilter
    : "all";

  useEffect(() => {
    if (!showRatioFilter && ratioFilter !== "all") setRatioFilter("all");
  }, [showRatioFilter, ratioFilter]);

  useEffect(() => {
    if (!showDurationFilter && durationFilter !== "all") {
      setDurationFilter("all");
    }
  }, [showDurationFilter, durationFilter]);

  const onDim = useCallback(
    (k: string, d: { w: number; h: number } | null) => {
      setDimMap((prev) => {
        if (prev.has(k)) return prev;
        const n = new Map(prev);
        n.set(k, d);
        return n;
      });
    },
    []
  );

  const onDur = useCallback((k: string, sec: number | null) => {
    setDurationMap((prev) => {
      if (prev.has(k)) return prev;
      const n = new Map(prev);
      n.set(k, sec);
      return n;
    });
  }, []);

  const afterKindSize = useMemo(() => {
    return entries.filter((e) => {
      if (!matchesAttachmentKindSegment(e.item, kindSegment)) return false;
      return passesSize(e.item, sizeFilter);
    });
  }, [entries, kindSegment, sizeFilter]);

  const afterRatio = useMemo(() => {
    return afterKindSize.filter((e) =>
      passesRatioFilter(e, effectiveRatioFilter, dimMap)
    );
  }, [afterKindSize, effectiveRatioFilter, dimMap]);

  const filteredEntries = useMemo(() => {
    return afterRatio.filter((e) =>
      passesDurationFilter(e, effectiveDurationFilter, durationMap)
    );
  }, [afterRatio, effectiveDurationFilter, durationMap]);

  const [visible, setVisible] = useState(() =>
    Math.min(BATCH, filteredEntries.length)
  );

  useEffect(() => {
    setVisible(Math.min(BATCH, filteredEntries.length));
  }, [
    kindSegment,
    sizeFilter,
    ratioFilter,
    durationFilter,
    entries.length,
    filteredEntries.length,
  ]);

  const displayed = useMemo(
    () => filteredEntries.slice(0, visible),
    [filteredEntries, visible]
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible >= filteredEntries.length) return;
    const root = scrollRootRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;
    const io = new IntersectionObserver(
      (observed) => {
        const hit = observed[0];
        if (!hit?.isIntersecting) return;
        setVisible((n) => Math.min(n + BATCH, filteredEntries.length));
      },
      { root, rootMargin: "520px 0px", threshold: 0 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [filteredEntries.length, scrollRootRef, visible]);

  const probes = useMemo(() => {
    if (effectiveRatioFilter === "all") return [];
    const out: AttachmentListEntry[] = [];
    for (const e of afterKindSize) {
      if (e.item.kind !== "image" && e.item.kind !== "video") continue;
      const k = dimKey(e);
      if (!dimMap.has(k)) out.push(e);
    }
    return out;
  }, [afterKindSize, effectiveRatioFilter, dimMap]);

  const durationProbes = useMemo(() => {
    if (effectiveDurationFilter === "all") return [];
    const out: AttachmentListEntry[] = [];
    for (const e of afterKindSize) {
      if (e.item.kind !== "video" && e.item.kind !== "audio") continue;
      const k = dimKey(e);
      if (!durationMap.has(k)) out.push(e);
    }
    return out;
  }, [afterKindSize, effectiveDurationFilter, durationMap]);

  if (entries.length === 0) {
    return (
      <div
        className="attachments-page attachments-page--empty"
        role="status"
      >
        <p className="timeline__empty">{c.attachmentsEmpty}</p>
      </div>
    );
  }

  return (
    <div className="attachments-page" role="list">
      {probes.map((e) => (
        <AttachmentDimsProbe
          key={`probe-${dimKey(e)}`}
          item={e.item}
          dimKey={dimKey(e)}
          onDim={onDim}
        />
      ))}
      {durationProbes.map((e) => (
        <AttachmentDurationProbe
          key={`dprobe-${dimKey(e)}`}
          item={e.item}
          durKey={dimKey(e)}
          onDur={onDur}
        />
      ))}
      <div
        className="attachments-page__toolbar"
        role="toolbar"
        aria-label={c.attachmentsFilterBarAria}
      >
        <div className="attachments-page__toolbar-surface">
          <div className="segmented-field">
            <span
              className="segmented-field__label"
              id="attachments-filter-size-label"
            >
              {c.attachmentsFilterSizeLabel}
            </span>
            <div
              className="segmented-control segmented-control--equal"
              role="radiogroup"
              aria-labelledby="attachments-filter-size-label"
            >
              {SIZE_FILTER_ORDER.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={sizeFilter === v}
                  className={
                    "segmented-control__btn" +
                    (sizeFilter === v ? " is-active" : "")
                  }
                  onClick={() => setSizeFilter(v)}
                >
                  {labelForSizeFilter(c, v)}
                </button>
              ))}
            </div>
          </div>
          {showRatioFilter ? (
            <div className="segmented-field">
              <span
                className="segmented-field__label"
                id="attachments-filter-ratio-label"
              >
                {c.attachmentsFilterRatioLabel}
              </span>
              <div
                className="segmented-control segmented-control--equal"
                role="radiogroup"
                aria-labelledby="attachments-filter-ratio-label"
              >
                {RATIO_FILTER_ORDER.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={ratioFilter === v}
                    className={
                      "segmented-control__btn" +
                      (ratioFilter === v ? " is-active" : "")
                    }
                    onClick={() => setRatioFilter(v)}
                  >
                    {labelForRatioFilter(c, v)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {showDurationFilter ? (
            <div className="segmented-field">
              <span
                className="segmented-field__label"
                id="attachments-filter-duration-label"
              >
                {c.attachmentsFilterDurationLabel}
              </span>
              <div
                className="segmented-control segmented-control--equal"
                role="radiogroup"
                aria-labelledby="attachments-filter-duration-label"
              >
                {DURATION_FILTER_ORDER.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={durationFilter === v}
                    className={
                      "segmented-control__btn" +
                      (durationFilter === v ? " is-active" : "")
                    }
                    onClick={() => setDurationFilter(v)}
                  >
                    {labelForDurationFilter(c, v)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p className="timeline__empty attachments-page__filter-empty">
          {c.attachmentsFilterNoMatch}
        </p>
      ) : (
        <>
          <ul className="attachments-page__grid">
            {displayed.map((e, i) => {
              const key = dimKey(e);
              const fileName =
                e.item.name?.trim() ||
                fileLabelFromUrl(e.item.url, c.uiFileFallback);
              const sb = e.item.sizeBytes;
              const sizeLabel =
                sb != null && Number.isFinite(sb) && sb >= 0
                  ? formatHumanBytes(sb)
                  : c.attachmentsMetaSizeUnknown;
              const showDuration =
                e.item.kind === "video" || e.item.kind === "audio";

              return (
                <li
                  key={key}
                  className="attachments-page__item"
                  role="listitem"
                >
                  <button
                    type="button"
                    className="attachments-page__tile"
                    onClick={() => onOpenCard(e.colId, e.card.id)}
                    aria-label={`${c.attachmentsOpenCardAria} · ${fileName} · ${e.colPath}`}
                  >
                    <div className="attachments-page__tile-media attachments-page__tile-media--natural">
                      <NoteMediaThumbBody
                        item={e.item}
                        priority={i < 24}
                      />
                    </div>
                    <span className="attachments-page__caption">
                      <span className="attachments-page__file-name">
                        {fileName}
                      </span>
                      <span className="attachments-page__meta" aria-hidden>
                        <span>{sizeLabel}</span>
                        {showDuration ? (
                          <>
                            <span className="attachments-page__meta-sep">
                              ·
                            </span>
                            <AttachmentAvDuration item={e.item} />
                          </>
                        ) : null}
                      </span>
                      <span className="attachments-page__col-path">
                        {e.colPath}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {visible < filteredEntries.length ? (
            <div
              ref={sentinelRef}
              className="timeline__all-notes-sentinel"
              aria-hidden
            />
          ) : null}
        </>
      )}
    </div>
  );
}
