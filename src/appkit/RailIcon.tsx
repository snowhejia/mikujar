import type { ReactNode } from "react";

/**
 * 左侧 rail / 概览面板专用的 20 个装饰形 glyph。
 * 独立于 CollectionIconGlyph：rail 想要更有形状感的一组抽象图标，
 * 不需要暴露成「用户可为合集挑选的图标」。
 * 所有路径在 24×24 viewBox 内，单色 fill / 可选 stroke 来自 currentColor。
 */

type ShapeDef = {
  body: ReactNode;
  /** 该形状的缺省配色（来自用户提供的参考图），调用方不传 color 时使用 */
  color: string;
};

/** 参考图的调色板 */
const PALETTE = {
  red: "#DE4A2C",
  orange: "#E68045",
  yellow: "#E6A82A",
  blue: "#8CB1D9",
  teal: "#1F5F57",
  pink: "#E3A0AB",
};

const SHAPES = {
  heart: {
    color: PALETTE.red,
    body: (
      <path d="M12 21 C 11 20 3 14 3 8.5 C 3 5.9 5 4 7.5 4 C 9.3 4 10.9 5 12 6.5 C 13.1 5 14.7 4 16.5 4 C 19 4 21 5.9 21 8.5 C 21 14 13 20 12 21 Z" />
    ),
  },
  sparkle: {
    color: PALETTE.yellow,
    body: (
      <g>
        <rect x="10.8" y="2" width="2.4" height="20" rx="1.2" />
        <rect
          x="10.8"
          y="2"
          width="2.4"
          height="20"
          rx="1.2"
          transform="rotate(45 12 12)"
        />
        <rect
          x="10.8"
          y="2"
          width="2.4"
          height="20"
          rx="1.2"
          transform="rotate(90 12 12)"
        />
        <rect
          x="10.8"
          y="2"
          width="2.4"
          height="20"
          rx="1.2"
          transform="rotate(135 12 12)"
        />
      </g>
    ),
  },
  donut: {
    color: PALETTE.blue,
    // 双层甜甜圈：外环（evenodd 挖洞）+ 中心实点，和 ring 区分
    body: (
      <g>
        <path
          fillRule="evenodd"
          d="M 12 2.5 A 9.5 9.5 0 1 0 12 21.5 A 9.5 9.5 0 1 0 12 2.5 Z M 12 7.5 A 4.5 4.5 0 1 1 12 16.5 A 4.5 4.5 0 1 1 12 7.5 Z"
        />
        <circle cx="12" cy="12" r="2" />
      </g>
    ),
  },
  stair: {
    color: PALETTE.teal,
    body: <path d="M3 21 V17 H9 V13 H14 V8 H21 V21 Z" />,
  },
  peanut: {
    color: PALETTE.orange,
    body: (
      <g>
        <circle cx="12" cy="7.5" r="5" />
        <circle cx="12" cy="16.5" r="5" />
      </g>
    ),
  },
  arch: {
    color: PALETTE.pink,
    // 矮胖的实心墓碑：明显的方底 + 圆顶，和 rainbow 的空心高弧区分
    body: <path d="M4 21 V13 A 8 8 0 0 1 20 13 V21 Z" />,
  },
  petal: {
    color: PALETTE.pink,
    // 圆角十字：两条胶囊交叉，避免和 quad 的 4 圆成串搞混
    body: (
      <g>
        <rect x="9" y="2" width="6" height="20" rx="3" />
        <rect x="2" y="9" width="20" height="6" rx="3" />
      </g>
    ),
  },
  wave: {
    color: PALETTE.yellow,
    body: (
      <g>
        <path d="M3 7 Q 7 4 12 6 T 21 7 L 21 11 Q 16.5 9 12 11 T 3 10 Z" />
        <path d="M3 14 Q 7 11 12 13 T 21 14 L 21 18 Q 16.5 16 12 18 T 3 17 Z" />
      </g>
    ),
  },
  butterfly: {
    color: PALETTE.red,
    body: (
      <g>
        <ellipse cx="7.5" cy="8" rx="4" ry="4.5" />
        <ellipse cx="16.5" cy="8" rx="4" ry="4.5" />
        <ellipse cx="7.5" cy="16.5" rx="4" ry="4" />
        <ellipse cx="16.5" cy="16.5" rx="4" ry="4" />
      </g>
    ),
  },
  capsule: {
    color: PALETTE.blue,
    body: (
      <rect
        x="2"
        y="9.8"
        width="20"
        height="4.4"
        rx="2.2"
        transform="rotate(-32 12 12)"
      />
    ),
  },
  arc: {
    color: PALETTE.orange,
    body: (
      <path d="M5 20 A 14 14 0 0 1 20 5 L 20 11 A 9 9 0 0 0 11 20 Z" />
    ),
  },
  quad: {
    color: PALETTE.blue,
    body: (
      <g>
        <circle cx="6.5" cy="12" r="5" />
        <circle cx="17.5" cy="12" r="5" />
        <circle cx="12" cy="6.5" r="5" />
        <circle cx="12" cy="17.5" r="5" />
      </g>
    ),
  },
  rainbow: {
    color: PALETTE.pink,
    // 瘦高空心拱桥：高度到顶，圆弧很薄，和 arch 完全不会混
    body: (
      <path d="M3 21 V13 A 9 9 0 0 1 21 13 V21 H17 V13 A 5 5 0 0 0 7 13 V21 Z" />
    ),
  },
  dots: {
    color: PALETTE.orange,
    // 五点小花：4 外加 1 中心小圆，和 petal/quad/bloom 都明显不同
    body: (
      <g>
        <circle cx="12" cy="5" r="2.4" />
        <circle cx="12" cy="19" r="2.4" />
        <circle cx="5" cy="12" r="2.4" />
        <circle cx="19" cy="12" r="2.4" />
        <circle cx="12" cy="12" r="2.4" />
      </g>
    ),
  },
  hourglass: {
    color: PALETTE.pink,
    body: (
      <path d="M5 3 H19 V6 L13 12 L19 18 V21 H5 V18 L11 12 L5 6 Z" />
    ),
  },
  sStep: {
    color: PALETTE.orange,
    body: (
      <g>
        <rect x="7" y="3" width="12" height="6" rx="3" />
        <rect x="5" y="15" width="12" height="6" rx="3" />
        <rect x="10" y="8" width="4" height="9" />
      </g>
    ),
  },
  scallop: {
    color: PALETTE.teal,
    body: (
      <path d="M3 21 V14 Q 6 9 9 14 Q 12 9 15 14 Q 18 9 21 14 V21 Z" />
    ),
  },
  ring: {
    color: PALETTE.red,
    // 纯空心圆：没有中心点，刻意区别于 donut
    body: (
      <path
        fillRule="evenodd"
        d="M 12 3 A 9 9 0 1 0 12 21 A 9 9 0 1 0 12 3 Z M 12 7 A 5 5 0 1 1 12 17 A 5 5 0 1 1 12 7 Z"
      />
    ),
  },
  bloom: {
    color: PALETTE.pink,
    body: (
      <g>
        <circle cx="12" cy="4.5" r="3.1" />
        <circle cx="17.3" cy="6.7" r="3.1" />
        <circle cx="19.5" cy="12" r="3.1" />
        <circle cx="17.3" cy="17.3" r="3.1" />
        <circle cx="12" cy="19.5" r="3.1" />
        <circle cx="6.7" cy="17.3" r="3.1" />
        <circle cx="4.5" cy="12" r="3.1" />
        <circle cx="6.7" cy="6.7" r="3.1" />
      </g>
    ),
  },
  twinkle: {
    color: PALETTE.yellow,
    body: (
      <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" />
    ),
  },
} satisfies Record<string, ShapeDef>;

export type RailIconKey = keyof typeof SHAPES;

export function RailIcon({
  shape,
  size = 22,
  color,
  className,
}: {
  shape: RailIconKey;
  size?: number;
  /** 不传则使用该 shape 在参考图里的缺省配色 */
  color?: string;
  className?: string;
}) {
  const def = SHAPES[shape];
  const fill = color ?? def.color;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="none"
      color={fill}
      aria-hidden
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flex: "0 0 auto",
      }}
    >
      {def.body}
    </svg>
  );
}
