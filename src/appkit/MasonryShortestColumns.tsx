import {
  Children,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

function escapeAttrSelector(s: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(s);
  }
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** 首帧占位：按序号轮流分到各列，避免全堆一列 */
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

/**
 * 最短列接龙：每张卡放进「当前累计高度最小」的列；并列时取列下标最小（靠左）。
 */
function packShortestColumn(
  orderedKeys: string[],
  heights: Record<string, number>,
  columnCount: number,
  defaultHeight: number
): number[][] {
  const colHeights = Array(columnCount).fill(0) as number[];
  const cols: number[][] = Array.from({ length: columnCount }, () => []);
  for (let i = 0; i < orderedKeys.length; i++) {
    const h = heights[orderedKeys[i]] ?? defaultHeight;
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

const DEFAULT_CARD_H = 280;

function readCardHeight(el: HTMLElement | null): number {
  if (!el) return DEFAULT_CARD_H;
  const br = el.getBoundingClientRect().height;
  const oh = el.offsetHeight;
  const h = Math.max(
    Number.isFinite(br) ? br : 0,
    Number.isFinite(oh) ? oh : 0
  );
  if (!Number.isFinite(h) || h < 8) return DEFAULT_CARD_H;
  return Math.ceil(h);
}

/**
 * 瀑布流：按时间线顺序将每张卡放入累计高度最短的一列。
 * 子节点根元素须为带 `data-masonry-key` 的 `li.card`。
 */
export function MasonryShortestColumns({
  columnCount,
  className,
  ariaLabel,
  children,
}: {
  columnCount: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const enabled = columnCount > 1;
  const packColumns = (enabled ? columnCount : 2) as 2 | 3 | 4 | 5 | 6;
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
    roundRobinBuckets(childList.length, packColumns)
  );

  const packRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) return;
    setBuckets(roundRobinBuckets(childList.length, packColumns));
  }, [enabled, keysSig, childList.length, packColumns]);

  useLayoutEffect(() => {
    if (!enabled || childList.length === 0) return;
    const root = packRef.current;
    if (!root) return;

    const pack = () => {
      const heights: Record<string, number> = {};
      for (const k of orderedKeys) {
        const el = root.querySelector<HTMLElement>(
          `[data-masonry-key="${escapeAttrSelector(k)}"]`
        );
        heights[k] = readCardHeight(el);
      }
      const next = packShortestColumn(
        orderedKeys,
        heights,
        packColumns,
        DEFAULT_CARD_H
      );
      setBuckets((prev) => (bucketsEqual(prev, next) ? prev : next));
    };

    pack();

    const schedulePack = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        pack();
      });
    };

    const ro = new ResizeObserver(schedulePack);
    orderedKeys.forEach((k) => {
      const el = root.querySelector<HTMLElement>(
        `[data-masonry-key="${escapeAttrSelector(k)}"]`
      );
      if (el) ro.observe(el);
    });

    root.addEventListener("load", schedulePack, true);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      root.removeEventListener("load", schedulePack, true);
    };
  }, [enabled, keysSig, packColumns, childList.length, orderedKeys]);

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
      data-masonry-cols={String(packColumns)}
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
