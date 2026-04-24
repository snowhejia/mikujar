import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Collection, NoteCard, NoteMediaItem } from "../types";
import { useMediaDisplaySrc, MediaThumbImage } from "../mediaDisplay";
import { DiceIcon, SparkleIcon } from "./OverviewDecor";

export type OverviewMusicTrack = {
  card: NoteCard;
  col: Collection;
  item: NoteMediaItem;
  /** 展示名：优先 item.name，其次文件卡 title */
  displayName: string;
};

export type OverviewMusicPlayerProps = {
  tracks: OverviewMusicTrack[];
  i18n: {
    kicker: string;
    noTracks: string;
    prev: string;
    next: string;
    play: string;
    pause: string;
    shuffle: string;
  };
};

/** 概览 Hero 侧的音乐播放器：从"有封面的音频附件"里随机播放一轨 */
export function OverviewMusicPlayer({
  tracks,
  i18n,
}: OverviewMusicPlayerProps): ReactNode {
  /** 当前轨索引；初始随机 */
  const [idx, setIdx] = useState(() =>
    tracks.length === 0 ? 0 : Math.floor(Math.random() * tracks.length)
  );
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** tracks 长度变化时夹断当前 idx */
  useEffect(() => {
    if (tracks.length === 0) return;
    if (idx >= tracks.length) setIdx(0);
  }, [tracks.length, idx]);

  const current = tracks[idx];
  const audioSrc = useMediaDisplaySrc(current?.item.url);

  /** 轨切换：停当前音，切 idx，新轨由 useEffect 自动加载；播放状态延续 */
  const goTo = useCallback(
    (nextIdx: number) => {
      if (tracks.length === 0) return;
      const n = ((nextIdx % tracks.length) + tracks.length) % tracks.length;
      setIdx(n);
      setProgress(0);
    },
    [tracks.length]
  );

  const shuffle = useCallback(() => {
    if (tracks.length <= 1) return;
    let n = Math.floor(Math.random() * tracks.length);
    /** 避免原地不动：10 次内尝试找一个不同的轨，超过就听命运 */
    for (let i = 0; i < 10 && n === idx; i += 1) {
      n = Math.floor(Math.random() * tracks.length);
    }
    goTo(n);
  }, [idx, tracks.length, goTo]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      void a.play().catch(() => {
        /** 有些浏览器需要用户手势；按钮点击本身就是手势，失败只能静默 */
      });
    } else {
      a.pause();
    }
  }, []);

  /** 切换轨后，如果上一刻是播放中，自动续播新轨（浏览器允许在用户手势链路内连续触发 play） */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!audioSrc) return;
    if (playing) {
      void a.play().catch(() => {
        setPlaying(false);
      });
    }
  }, [audioSrc, playing]);

  /** 进度条：currentTime / duration 归一化 */
  const handleTime = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const d = a.duration || current?.item.durationSec || 0;
    setProgress(d > 0 ? Math.min(1, a.currentTime / d) : 0);
  }, [current?.item.durationSec]);

  const seekBy = useCallback((delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    const d = a.duration || 0;
    if (d > 0) {
      a.currentTime = Math.max(0, Math.min(d, a.currentTime + delta));
    }
  }, []);

  const timeText = useMemo(() => {
    const a = audioRef.current;
    const d = a?.duration || current?.item.durationSec || 0;
    const cur = a?.currentTime ?? 0;
    return `${fmtMmSs(cur)} / ${fmtMmSs(d)}`;
  }, [progress, current?.item.durationSec]);

  if (tracks.length === 0 || !current) {
    return (
      <div className="overview-dashboard__card overview-dashboard__music overview-dashboard__music--empty">
        <div className="overview-dashboard__music-kicker">{i18n.kicker}</div>
        <div className="overview-dashboard__notif-empty">{i18n.noTracks}</div>
      </div>
    );
  }

  const coverUrl = current.item.coverUrl || current.item.thumbnailUrl || "";

  return (
    <div className="overview-dashboard__card overview-dashboard__music">
      <SparkleIcon
        size={14}
        color="#FECF6A"
        className="overview-dashboard__card-corner-star"
      />
      <div className="overview-dashboard__music-kicker">{i18n.kicker}</div>

      <div className="overview-dashboard__music-cover">
        {coverUrl ? (
          <MediaThumbImage
            url={coverUrl}
            className="overview-dashboard__music-cover-img"
            alt={current.displayName}
            priority
          />
        ) : (
          <div className="overview-dashboard__music-cover-fallback" aria-hidden>
            ♪
          </div>
        )}
        <div
          className={
            "overview-dashboard__music-disc" +
            (playing ? " overview-dashboard__music-disc--spinning" : "")
          }
          aria-hidden
        />
      </div>

      <div className="overview-dashboard__music-meta">
        <div
          className="overview-dashboard__music-title"
          title={current.displayName}
        >
          {current.displayName || "（未命名）"}
        </div>
        <div className="overview-dashboard__music-col" title={current.col.name}>
          {current.col.name}
        </div>
      </div>

      <div
        className="overview-dashboard__music-progress"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="overview-dashboard__music-progress-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div className="overview-dashboard__music-time">{timeText}</div>

      <div className="overview-dashboard__music-controls">
        <button
          type="button"
          className="overview-dashboard__music-btn"
          onClick={() => goTo(idx - 1)}
          aria-label={i18n.prev}
          title={i18n.prev}
        >
          ⏮
        </button>
        <button
          type="button"
          className="overview-dashboard__music-btn overview-dashboard__music-btn--primary"
          onClick={toggle}
          aria-label={playing ? i18n.pause : i18n.play}
          title={playing ? i18n.pause : i18n.play}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          className="overview-dashboard__music-btn"
          onClick={() => goTo(idx + 1)}
          aria-label={i18n.next}
          title={i18n.next}
        >
          ⏭
        </button>
        <button
          type="button"
          className="overview-dashboard__music-btn overview-dashboard__music-btn--ghost"
          onClick={shuffle}
          aria-label={i18n.shuffle}
          title={i18n.shuffle}
        >
          <DiceIcon size={18} />
        </button>
      </div>

      {audioSrc ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            goTo(idx + 1);
          }}
          onTimeUpdate={handleTime}
          onLoadedMetadata={handleTime}
          onDoubleClick={() => seekBy(10)}
          style={{ display: "none" }}
        />
      ) : null}
    </div>
  );
}

function fmtMmSs(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
