import {
  Children,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export const MASONRY_BREAKPOINT_3COL_PX = 1180;

export function useMasonryColumnCount(): 2 | 3 {
  const [n, setN] = useState<2 | 3>(2);
  useLayoutEffect(() => {
    const mq = window.matchMedia(
      `(min-width: ${MASONRY_BREAKPOINT_3COL_PX}px)`
    );
    const sync = () => setN(mq.matches ? 3 : 2);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return n;
}

function escapeAttrSelector(s: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(s);
  }
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function roundRobinBuckets(
  nItems: number,
  columnCount: number
): number[][] {
  const cols: number[][] = Array.from({ length: columnCount }, () => []);
  for (let i = 0; i < nItems; i++) {
    cols[i % columnCount].push(i);
  }
  return cols;
}

function packShortestColumn(
  orderedKeys: string[],
  heights: Record<string, number>,
  columnCount: number,
  defaultHeight: number
): number[][] {
  const colHeights = Array(columnCount).fill(0) as number[];
  const cols: number[][] = Array.from({ length: columnCount }, () => []);
  for (let i = 0; i < orderedKeys.length; i++) {
    const k = orderedKeys[i];
    const h = heights[k] ?? defaultHeight;
    let best = 0;
    for (let c = 1; c < columnCount; c++) {
      if (colHeights[c] < colHeights[best]) best = c;
    }
    cols[best].push(i);
    colHeights[best] += h;
  }
  return cols;
}

function bucketsEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

const DEFAULT_CARD_H = 240;

/**
 * 瀑布流：按时间线顺序将每张卡放入「当前累计高度最短」的一列（Pinterest 式接龙）。
 * 依赖子节点根元素 `li.card` 上的 `data-masonry-key` 以测量高度。
 */
export function MasonryShortestColumns({
  enabled,
  columnCount,
  className,
  ariaLabel,
  children,
}: {
  enabled: boolean;
  columnCount: 2 | 3;
  className?: string;
  /** 启用瀑布流时包在容器上；关闭时为 ul 的 aria-label */
  ariaLabel?: string;
  children: ReactNode;
}) {
  const childList = useMemo(
    () => Children.toArray(children) as ReactElement[],
    [children]
  );

  const orderedKeys = useMemo(
    () =>
      childList.map((c, i) => {
        if (c.key != null && c.key !== "") return String(c.key);
        return `__idx_${i}`;
      }),
    [childList]
  );

  const keysSig = orderedKeys.join("\u0001");

  const [buckets, setBuckets] = useState<number[][]>(() =>
    roundRobinBuckets(childList.length, columnCount)
  );

  const packRef = useRef<HTMLDivElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    setBuckets(roundRobinBuckets(childList.length, columnCount));
  }, [enabled, keysSig, childList.length, columnCount]);

  useLayoutEffect(() => {
    if (!enabled || childList.length === 0) return;
    const root = packRef.current;
    if (!root) return;

    const measureAndPack = () => {
      const heights: Record<string, number> = {};
      for (const k of orderedKeys) {
        const el = root.querySelector<HTMLElement>(
          `[data-masonry-key="${escapeAttrSelector(k)}"]`
        );
        heights[k] = el?.getBoundingClientRect().height ?? DEFAULT_CARD_H;
      }
      const next = packShortestColumn(
        orderedKeys,
        heights,
        columnCount,
        DEFAULT_CARD_H
      );
      setBuckets((prev) => (bucketsEqual(prev, next) ? prev : next));
    };

    measureAndPack();

    roRef.current?.disconnect();
    const ro = new ResizeObserver(() => {
      measureAndPack();
    });
    roRef.current = ro;
    orderedKeys.forEach((k) => {
      const el = root.querySelector<HTMLElement>(
        `[data-masonry-key="${escapeAttrSelector(k)}"]`
      );
      if (el) ro.observe(el);
    });

    return () => {
      ro.disconnect();
      roRef.current = null;
    };
  }, [enabled, keysSig, columnCount, childList.length]);

  if (!enabled) {
    return (
      <ul
        className={className ?? "cards"}
        data-masonry-pack="off"
        aria-label={ariaLabel}
      >
        {children}
      </ul>
    );
  }

  return (
    <div
      ref={packRef}
      className="masonry-shortest-pack"
      data-masonry-pack="on"
      data-masonry-cols={String(columnCount)}
      aria-label={ariaLabel}
      role={ariaLabel ? "region" : undefined}
    >
      {buckets.map((indices, colIdx) => (
        <ul
          key={colIdx}
          className={(className ?? "cards") + " cards--masonry-column"}
          data-masonry-col={colIdx}
        >
          {indices.map((i) => childList[i])}
        </ul>
      ))}
    </div>
  );
}
