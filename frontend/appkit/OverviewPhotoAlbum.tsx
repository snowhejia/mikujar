import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Collection, NoteCard, NoteMediaItem } from "../types";
import { MediaThumbImage } from "../mediaDisplay";
import { DiceIcon, SparkleIcon } from "./OverviewDecor";

export type OverviewPhotoItem = {
  card: NoteCard;
  col: Collection;
  item: NoteMediaItem;
};

export type OverviewPhotoAlbumProps = {
  photos: OverviewPhotoItem[];
  onOpenCard: (colId: string, cardId: string) => void;
  i18n: {
    kicker: string;
    empty: string;
    reroll: string;
    play: string;
    pause: string;
  };
};

/** 自动轮播间隔（ms）；用户点 🎲 换一张会临时重置计时器 */
const ROTATE_MS = 15000;

/** 概览通知卡下方的横向相册：从图片附件里自动轮播，每 5s 换一张；
 *  🎲 手动换一张，⏸ 暂停 / ▶ 继续自动轮播；点图跳来源卡片大页 */
export function OverviewPhotoAlbum({
  photos,
  onOpenCard,
  i18n,
}: OverviewPhotoAlbumProps): ReactNode {
  const [idx, setIdx] = useState(() =>
    photos.length === 0 ? 0 : Math.floor(Math.random() * photos.length)
  );
  const [paused, setPaused] = useState(false);
  /** 让 useEffect 依赖变化能强制重启计时（点 🎲 后立刻开始新的 5s 计时而不是延续旧的） */
  const [rotateTick, setRotateTick] = useState(0);

  /** 池大小变化（新增/删除图片）时夹断 idx */
  useEffect(() => {
    if (photos.length === 0) return;
    if (idx >= photos.length) setIdx(0);
  }, [photos.length, idx]);

  /** 自动轮播：pool > 1 且未暂停时，每 ROTATE_MS 切到下一张 */
  useEffect(() => {
    if (photos.length <= 1) return;
    if (paused) return;
    const t = window.setInterval(() => {
      setIdx((cur) => (cur + 1) % photos.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [photos.length, paused, rotateTick]);

  const pickRandomOther = useCallback(() => {
    if (photos.length <= 1) return;
    let n = Math.floor(Math.random() * photos.length);
    for (let i = 0; i < 10 && n === idx; i += 1) {
      n = Math.floor(Math.random() * photos.length);
    }
    setIdx(n);
    setRotateTick((x) => x + 1);
  }, [idx, photos.length]);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  if (photos.length === 0) {
    return (
      <div className="overview-dashboard__card overview-dashboard__album overview-dashboard__album--empty">
        <div className="overview-dashboard__album-head">
          <div className="overview-dashboard__album-kicker">{i18n.kicker}</div>
        </div>
        <div className="overview-dashboard__notif-empty">{i18n.empty}</div>
      </div>
    );
  }

  const current = photos[idx];
  /** 优先用缩略图（上传时生成的 WebP 小图）；无则回退到原图。手机端流量敏感。 */
  const thumb = current.item.thumbnailUrl || current.item.url;
  const alt = current.item.name || current.col.name;

  return (
    <div className="overview-dashboard__card overview-dashboard__album">
      <SparkleIcon
        size={14}
        color="#FECF6A"
        className="overview-dashboard__card-corner-star"
      />
      <div className="overview-dashboard__album-head">
        <div className="overview-dashboard__album-kicker">{i18n.kicker}</div>
        <div className="overview-dashboard__album-actions">
          <button
            type="button"
            className="overview-dashboard__pill overview-dashboard__pill--ghost overview-dashboard__album-btn"
            onClick={togglePause}
            aria-label={paused ? i18n.play : i18n.pause}
            title={paused ? i18n.play : i18n.pause}
          >
            {paused ? "▶" : "❚❚"}
          </button>
          <button
            type="button"
            className="overview-dashboard__pill overview-dashboard__pill--ghost overview-dashboard__album-btn"
            onClick={pickRandomOther}
            aria-label={i18n.reroll}
            title={i18n.reroll}
          >
            <DiceIcon size={14} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="overview-dashboard__album-banner"
        onClick={() => onOpenCard(current.col.id, current.card.id)}
        title={alt}
      >
        <MediaThumbImage
          /** key 绑定当前图 URL：切到下一张时强制重挂载，CSS 动画（淡入 + 15s 缓慢放大）重启 */
          key={`${idx}-${thumb}`}
          url={thumb}
          className="overview-dashboard__album-banner-img"
          alt={alt}
          priority
        />
        <div className="overview-dashboard__album-banner-meta">
          <span className="overview-dashboard__album-banner-name">
            {current.item.name || "（未命名）"}
          </span>
          <span className="overview-dashboard__album-banner-col">
            {current.col.name}
          </span>
        </div>
      </button>

      {photos.length > 1 ? (
        <div
          className="overview-dashboard__album-dots"
          role="tablist"
          aria-label={i18n.kicker}
        >
          {buildDotIndices(idx, photos.length).map((d) => (
            <span
              key={d.key}
              className={
                "overview-dashboard__album-dot" +
                (d.active ? " overview-dashboard__album-dot--active" : "") +
                (d.tiny ? " overview-dashboard__album-dot--tiny" : "")
              }
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** pool 很大时只显示当前附近的 ~7 个点 + 两端极小点示意还有更多 */
function buildDotIndices(
  active: number,
  total: number
): Array<{ key: string; active: boolean; tiny: boolean }> {
  const MAX_DOTS = 7;
  if (total <= MAX_DOTS) {
    return Array.from({ length: total }, (_, i) => ({
      key: `d-${i}`,
      active: i === active,
      tiny: false,
    }));
  }
  const half = Math.floor(MAX_DOTS / 2);
  let start = active - half;
  let end = active + half;
  if (start < 0) {
    end += -start;
    start = 0;
  }
  if (end > total - 1) {
    start -= end - (total - 1);
    end = total - 1;
  }
  start = Math.max(0, start);
  const out: Array<{ key: string; active: boolean; tiny: boolean }> = [];
  if (start > 0) out.push({ key: "pre", active: false, tiny: true });
  for (let i = start; i <= end; i += 1) {
    out.push({ key: `d-${i}`, active: i === active, tiny: false });
  }
  if (end < total - 1) out.push({ key: "post", active: false, tiny: true });
  return out;
}
