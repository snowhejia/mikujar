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

const DEFAULT_CARD_H = 280;

/** 按序号 0,1,0,1… 分到各列，首帧占位 */
function splitRoundRobin(n: number, cols: number): number[][] {
  const out: number[][] = Array.from({ length: cols }, () => []);
  for (let i = 0; i < n; i++) out[i % cols].push(i);
  return out;
}

/** 每张卡进「当前累计高度最小」的那一列（并列取最左列） */
function packToShortest(heights: number[], columnCount: number): number[][] {
  const colH = Array(columnCount).fill(0);
  const buckets: number[][] = Array.from({ length: columnCount }, () => []);
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i] ?? DEFAULT_CARD_H;
    const c = colH.indexOf(Math.min(...colH));
    buckets[c].push(i);
    colH[c] += h;
  }
  return buckets;
}

function sameBuckets(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) if (a[i][j] !== b[i][j]) return false;
  }
  return true;
}

function readCardHeight(el: HTMLElement | null): number {
  if (!el) return DEFAULT_CARD_H;
  const h = Math.max(
    el.getBoundingClientRect().height,
    el.offsetHeight
  );
  if (!Number.isFinite(h) || h < 8) return DEFAULT_CARD_H;
  return Math.ceil(h);
}

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
  const nCols = (enabled ? columnCount : 2) as 2 | 3 | 4 | 5 | 6;
  const childList = useMemo(
    () => Children.toArray(children) as ReactElement[],
    [children]
  );

  const keys = useMemo(
    () =>
      childList.map((c, i) =>
        c.key != null && c.key !== "" ? String(c.key) : `__idx_${i}`
      ),
    [childList]
  );

  const keysSig = keys.join("\u0001");

  const [buckets, setBuckets] = useState<number[][]>(() =>
    splitRoundRobin(childList.length, nCols)
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) return;
    setBuckets(splitRoundRobin(childList.length, nCols));
  }, [enabled, keysSig, childList.length, nCols]);

  useLayoutEffect(() => {
    if (!enabled || childList.length === 0) return;
    const root = rootRef.current;
    if (!root) return;

    const pack = () => {
      const heights = keys.map((k) => {
        const el = root.querySelector<HTMLElement>(
          `[data-masonry-key="${escapeAttrSelector(k)}"]`
        );
        return readCardHeight(el);
      });
      const next = packToShortest(heights, nCols);
      setBuckets((prev) => (sameBuckets(prev, next) ? prev : next));
    };

    pack();

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        pack();
      });
    };

    const ro = new ResizeObserver(onResize);
    keys.forEach((k) => {
      const el = root.querySelector<HTMLElement>(
        `[data-masonry-key="${escapeAttrSelector(k)}"]`
      );
      if (el) ro.observe(el);
    });
    root.addEventListener("load", onResize, true);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      root.removeEventListener("load", onResize, true);
    };
  }, [enabled, keysSig, nCols, childList.length, keys]);

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
      ref={rootRef}
      className="masonry-shortest-pack"
      data-masonry-pack="on"
      data-masonry-cols={String(nCols)}
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
