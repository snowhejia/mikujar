import { useEffect, useRef, useState, type RefObject } from "react";

const THRESHOLD_PX = 42;
const MAX_PULL_PX = 64;
const RUBBER = 0.42;

/**
 * 在时间线滚动容器顶部下拉触发刷新（触控）。依赖 passive: false 的 touchmove 以在顶端拦截下拉。
 */
export function usePullToRefresh(p: {
  scrollRef: RefObject<HTMLElement | null>;
  onRefresh: () => void | Promise<void>;
  enabled: boolean;
}): { pullOffset: number; refreshing: boolean } {
  const { scrollRef, onRefresh, enabled } = p;
  const [pullOffset, setPullOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const startYRef = useRef(0);
  const activeRef = useRef(false);
  const distRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;

    const resetPull = () => {
      activeRef.current = false;
      distRef.current = 0;
      setPullOffset(0);
    };

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (el.scrollTop > 4) return;
      activeRef.current = true;
      startYRef.current = e.touches[0].clientY;
      distRef.current = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!activeRef.current || refreshingRef.current) return;
      if (el.scrollTop > 4) {
        resetPull();
        return;
      }
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0) return;
      e.preventDefault();
      const d = Math.min(MAX_PULL_PX, dy * RUBBER);
      distRef.current = d;
      setPullOffset(d);
    };

    const runEnd = () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      const d = distRef.current;
      distRef.current = 0;
      setPullOffset(0);
      if (d < THRESHOLD_PX || refreshingRef.current) return;
      setRefreshing(true);
      void Promise.resolve(onRefreshRef.current())
        .catch(() => {
          /* 错误由 onRefresh / 全局 banner 处理 */
        })
        .finally(() => {
          setRefreshing(false);
        });
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", runEnd);
    el.addEventListener("touchcancel", runEnd);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", runEnd);
      el.removeEventListener("touchcancel", runEnd);
    };
  }, [enabled, scrollRef]);

  return { pullOffset, refreshing };
}
