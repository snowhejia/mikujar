import type { ReactNode } from "react";
import type { CollectionIconShape } from "../types";

/**
 * 合集侧栏图标集（Sunrise Glow 风格重绘）。
 * - 24×24 viewBox；外层 <svg> 注入颜色 + 圆角笔触，图标内部以路径描述。
 * - 风格：rounded / organic / 手绘感；尖角改平滑曲线，笔画端点 / 拐角统一 round。
 * - 用户选的颜色真正"染色"到图形（不依赖系统 emoji 字体）。
 */

type IconDef = {
  labelZh: string;
  labelEn: string;
  /** 子元素；外层 <svg> + fill 由 CollectionIconGlyph 负责 */
  body: ReactNode;
};

const ICON_LIBRARY = {
  dot: {
    labelZh: "圆点",
    labelEn: "Dot",
    body: <circle cx="12" cy="12" r="10.5" />,
  },
  square: {
    labelZh: "方块",
    labelEn: "Square",
    /** 更圆的胶囊方，减少硬角 */
    body: <rect x="3.5" y="3.5" width="17" height="17" rx="5" ry="5" />,
  },
  triangle: {
    labelZh: "三角",
    labelEn: "Triangle",
    /** 三顶点各做小圆弧，避免尖刺 */
    body: (
      <path d="M11 3.5 Q 12 2.5 13 3.5 L 21.2 18.5 Q 21.7 20 20.2 20 H 3.8 Q 2.3 20 2.8 18.5 Z" />
    ),
  },
  diamond: {
    labelZh: "菱形",
    labelEn: "Diamond",
    body: (
      <path d="M11 2.5 Q 12 1.5 13 2.5 L 21.5 11 Q 22.5 12 21.5 13 L 13 21.5 Q 12 22.5 11 21.5 L 2.5 13 Q 1.5 12 2.5 11 Z" />
    ),
  },
  star: {
    labelZh: "星星",
    labelEn: "Star",
    /** 四向 sparkle：OverviewDecor.SparkleIcon 的同款，sunrise 标志性装饰 */
    body: (
      <path d="M12 1.8 Q 12.8 7.2 14.8 9.2 Q 16.8 11.2 22.2 12 Q 16.8 12.8 14.8 14.8 Q 12.8 16.8 12 22.2 Q 11.2 16.8 9.2 14.8 Q 7.2 12.8 1.8 12 Q 7.2 11.2 9.2 9.2 Q 11.2 7.2 12 1.8 Z" />
    ),
  },
  cross: {
    labelZh: "叉",
    labelEn: "Cross",
    /** 两道手绘交叉线，stroke-only */
    body: (
      <g fill="none" strokeWidth="3">
        <path d="M6 6 L 18 18" />
        <path d="M18 6 L 6 18" />
      </g>
    ),
  },
  check: {
    labelZh: "勾",
    labelEn: "Check",
    /** 手绘钩：两段圆角折线 */
    body: (
      <path
        d="M4.5 12 L 10 17.5 L 19.5 6.5"
        fill="none"
        strokeWidth="3"
      />
    ),
  },
  heart: {
    labelZh: "心形",
    labelEn: "Heart",
    body: (
      <path d="M12 20.5 C 6 16 2.5 12.5 2.5 8.8 C 2.5 6 4.6 4 7.1 4 C 9 4 10.7 5 12 6.8 C 13.3 5 15 4 16.9 4 C 19.4 4 21.5 6 21.5 8.8 C 21.5 12.5 18 16 12 20.5 Z" />
    ),
  },
  moon: {
    labelZh: "月亮",
    labelEn: "Moon",
    body: (
      <path d="M17.5 17.5 A 9 9 0 1 1 15.5 4 A 7 7 0 1 0 17.5 17.5 Z" />
    ),
  },
  lightning: {
    labelZh: "闪电",
    labelEn: "Bolt",
    /** 折线圆化，像一道速写 */
    body: (
      <path d="M13.5 2.2 L 4.2 12.4 Q 3.6 13 4.4 13 H 10.4 L 10.4 21.5 Q 10.4 22.4 11.1 21.6 L 20 11.4 Q 20.6 10.8 19.8 10.8 H 13.8 L 14.4 2.6 Q 14.3 1.8 13.5 2.2 Z" />
    ),
  },
  clover: {
    labelZh: "四叶草",
    labelEn: "Clover",
    /** 四圆略相交更紧凑、中间加芯 */
    body: (
      <g>
        <circle cx="12" cy="7.4" r="4.1" />
        <circle cx="7" cy="12" r="4.1" />
        <circle cx="17" cy="12" r="4.1" />
        <circle cx="12" cy="16.6" r="4.1" />
      </g>
    ),
  },
  flower: {
    labelZh: "小花",
    labelEn: "Flower",
    /** 8 瓣花 + 浅色花心，与 OverviewDecor.FlowerIcon 同款 */
    body: (
      <g>
        <ellipse cx="12" cy="5" rx="3.2" ry="4" />
        <ellipse cx="12" cy="19" rx="3.2" ry="4" />
        <ellipse cx="5" cy="12" rx="4" ry="3.2" />
        <ellipse cx="19" cy="12" rx="4" ry="3.2" />
        <ellipse
          cx="7.2"
          cy="7.2"
          rx="3.4"
          ry="2.6"
          transform="rotate(-45 7.2 7.2)"
        />
        <ellipse
          cx="16.8"
          cy="7.2"
          rx="3.4"
          ry="2.6"
          transform="rotate(45 16.8 7.2)"
        />
        <ellipse
          cx="7.2"
          cy="16.8"
          rx="3.4"
          ry="2.6"
          transform="rotate(45 7.2 16.8)"
        />
        <ellipse
          cx="16.8"
          cy="16.8"
          rx="3.4"
          ry="2.6"
          transform="rotate(-45 16.8 16.8)"
        />
        <circle cx="12" cy="12" r="2.6" fill="#ffffff" />
      </g>
    ),
  },
  plus: {
    labelZh: "加号",
    labelEn: "Plus",
    /** 胶囊十字（两段描边） */
    body: (
      <g fill="none" strokeWidth="3.4">
        <path d="M12 4.5 V 19.5" />
        <path d="M4.5 12 H 19.5" />
      </g>
    ),
  },
  bell: {
    labelZh: "铃铛",
    labelEn: "Bell",
    body: (
      <g>
        <path d="M12 3.5 Q 18.5 3.5 18.5 10 V 14 L 20.5 16.5 Q 21 17.3 20 17.3 H 4 Q 3 17.3 3.5 16.5 L 5.5 14 V 10 Q 5.5 3.5 12 3.5 Z" />
        <path d="M10 18.8 Q 10 21 12 21 Q 14 21 14 18.8 Z" />
      </g>
    ),
  },
  bookmark: {
    labelZh: "书签",
    labelEn: "Bookmark",
    /** 缺口做得圆一点，少点棱角 */
    body: (
      <path d="M7 3.5 H 17 Q 18 3.5 18 4.5 V 20.5 Q 18 21.5 17.1 21 L 12 18 L 6.9 21 Q 6 21.5 6 20.5 V 4.5 Q 6 3.5 7 3.5 Z" />
    ),
  },
  fish: {
    labelZh: "小鱼",
    labelEn: "Fish",
    body: (
      <g>
        <path d="M14.5 12 Q 14.5 6.2 9 6.2 Q 2.5 6.2 2.5 12 Q 2.5 17.8 9 17.8 Q 14.5 17.8 14.5 12 Z" />
        <path d="M14.5 10 L 21.5 7 Q 22.2 6.8 22 7.6 V 16.4 Q 22.2 17.2 21.5 17 L 14.5 14 Z" />
        <circle cx="6.5" cy="11" r="1.1" fill="#ffffff" />
      </g>
    ),
  },
  paw: {
    labelZh: "猫爪",
    labelEn: "Paw",
    body: (
      <g>
        <ellipse cx="5.5" cy="9" rx="2" ry="2.7" transform="rotate(-18 5.5 9)" />
        <ellipse cx="9.5" cy="5.5" rx="2" ry="2.7" />
        <ellipse cx="14.5" cy="5.5" rx="2" ry="2.7" />
        <ellipse cx="18.5" cy="9" rx="2" ry="2.7" transform="rotate(18 18.5 9)" />
        <path d="M12 10.8 Q 7 10.8 6 15 Q 5.4 18.2 7.7 19.9 Q 9.2 21 10.5 20.4 Q 11.3 20 12 20 Q 12.7 20 13.5 20.4 Q 14.8 21 16.3 19.9 Q 18.6 18.2 18 15 Q 17 10.8 12 10.8 Z" />
      </g>
    ),
  },
  rocket: {
    labelZh: "火箭",
    labelEn: "Rocket",
    body: (
      <g>
        <path d="M12 2.4 Q 16 5.4 16 11 V 15.5 H 8 V 11 Q 8 5.4 12 2.4 Z" />
        <path d="M8 15.5 L 5.5 19 Q 5 20 6 20 L 8.6 20 L 9.6 22 Q 10 22.8 10.6 22 L 12 19.2 L 13.4 22 Q 14 22.8 14.4 22 L 15.4 20 L 18 20 Q 19 20 18.5 19 L 16 15.5 Z" />
        <circle cx="12" cy="9" r="1.8" fill="#ffffff" />
      </g>
    ),
  },
  sword: {
    labelZh: "剑",
    labelEn: "Sword",
    body: (
      <g>
        <path d="M14 2.2 Q 14.8 1.8 15.2 2.6 L 19.3 7 Q 20 7.8 19.3 8.2 L 8.7 18.8 Q 8 19.5 7.3 18.8 L 5.2 16.6 Q 4.6 16 5.2 15.4 Z" />
        <path d="M3 16.5 L 8.5 22 Q 9 22.5 9.5 22 L 6 18.5 L 7 17.5 L 4.5 15 Q 4 14.5 3.5 15 Z" />
      </g>
    ),
  },
  crown: {
    labelZh: "皇冠",
    labelEn: "Crown",
    /** 三个圆顶 + 底座 */
    body: (
      <path d="M3 8.5 Q 2.5 7.5 3.5 8 L 7 13 Q 8 14 8.5 12.8 L 11 6.5 Q 12 5 13 6.5 L 15.5 12.8 Q 16 14 17 13 L 20.5 8 Q 21.5 7.5 21 8.5 L 20 19 Q 19.8 20 18.8 20 H 5.2 Q 4.2 20 4 19 Z" />
    ),
  },
  music: {
    labelZh: "音符",
    labelEn: "Music",
    body: (
      <g>
        <path d="M19 3 V 15.5 A 3 3 0 1 1 17 13 V 7 L 10 9 V 17.5 A 3 3 0 1 1 8 15 V 6 Z" />
      </g>
    ),
  },
  cloud: {
    labelZh: "云",
    labelEn: "Cloud",
    /** 更胖、更 puffy */
    body: (
      <path d="M6.5 19.2 Q 2.2 19.2 2.2 14.8 Q 2.2 10.4 6.5 10.4 Q 7.2 6.8 11.2 6.8 Q 15.8 6.8 16.8 10.4 Q 22 10.4 22 14.8 Q 22 19.2 17.8 19.2 Z" />
    ),
  },
  skull: {
    labelZh: "骷髅",
    labelEn: "Skull",
    body: (
      <g>
        <path d="M12 3 Q 21 3 21 12 Q 21 15.4 18.5 17.5 V 19.5 Q 18.5 20.5 17.5 20.5 H 16 V 19 H 14 V 20.5 H 10 V 19 H 8 V 20.5 H 6.5 Q 5.5 20.5 5.5 19.5 V 17.5 Q 3 15.4 3 12 Q 3 3 12 3 Z" />
        <circle cx="9" cy="12.5" r="2" fill="#ffffff" />
        <circle cx="15" cy="12.5" r="2" fill="#ffffff" />
      </g>
    ),
  },
  fire: {
    labelZh: "火焰",
    labelEn: "Fire",
    /** 双层火苗，更圆润 */
    body: (
      <path d="M12 2.2 Q 11.8 6.4 9 8.6 Q 7.2 6.4 5.8 8.4 Q 3 12 3 16.4 Q 3 21.6 8.4 22 Q 13 22.4 15.6 22 Q 21 21.4 21 16.4 Q 21 12.8 17.6 9.4 Q 16.8 12 15 10.8 Q 16.4 7.4 14 4 Q 13 3 12 2.2 Z" />
    ),
  },
  calendar: {
    labelZh: "日历",
    labelEn: "Calendar",
    /** 填充圆角日历 + 顶部月牙 + 小圆点日期标记（白色），保持和其它填充图标同质感 */
    body: (
      <g>
        <path d="M5 4 H 19 Q 20.5 4 20.5 5.5 V 19.5 Q 20.5 21 19 21 H 5 Q 3.5 21 3.5 19.5 V 5.5 Q 3.5 4 5 4 Z" />
        <path d="M3.5 9.5 H 20.5" stroke="#ffffff" strokeWidth="1.8" />
        <rect x="7" y="2.2" width="2" height="4.6" rx="1" />
        <rect x="15" y="2.2" width="2" height="4.6" rx="1" />
        <circle cx="8.5" cy="14.5" r="1.4" fill="#ffffff" />
        <circle cx="12" cy="14.5" r="1.4" fill="#ffffff" />
        <circle cx="15.5" cy="14.5" r="1.4" fill="#ffffff" />
        <circle cx="8.5" cy="17.5" r="1.4" fill="#ffffff" />
      </g>
    ),
  },
  link: {
    labelZh: "连接",
    labelEn: "Link",
    /** 两节填充胶囊交叠成链节，和其它填充款同质地 */
    body: (
      <g>
        <path d="M9 7 L 14 2 Q 16 0 18 2 L 22 6 Q 24 8 22 10 L 17 15 Q 15 17 13 15 L 12.5 14.5 Q 14.5 12.5 13.5 11.5 Q 12.5 10.5 10.5 12.5 L 10 12 Q 8 10 10 8 Z" />
        <path d="M15 17 L 10 22 Q 8 24 6 22 L 2 18 Q 0 16 2 14 L 7 9 Q 9 7 11 9 L 11.5 9.5 Q 9.5 11.5 10.5 12.5 Q 11.5 13.5 13.5 11.5 L 14 12 Q 16 14 14 16 Z" />
      </g>
    ),
  },
  trash: {
    labelZh: "垃圾桶",
    labelEn: "Trash",
    /** 填充桶身 + 盖 + 手柄 + 白色竖条，饱满可爱 */
    body: (
      <g>
        <path d="M5 7.5 H 19 L 17.8 20 Q 17.6 21 16.5 21 H 7.5 Q 6.4 21 6.2 20 Z" />
        <rect x="3" y="5.5" width="18" height="2.8" rx="1.4" />
        <path d="M9 3 Q 9 2 10 2 H 14 Q 15 2 15 3 V 5.5 H 9 Z" />
        <path
          d="M9.5 11 V 17.5 M 12 11 V 17.5 M 14.5 11 V 17.5"
          stroke="#ffffff"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    ),
  },
} satisfies Record<string, IconDef>;

export type CollectionIconKey = keyof typeof ICON_LIBRARY;

const KNOWN_KEYS = Object.keys(ICON_LIBRARY) as CollectionIconKey[];

export function normalizeCollectionIconShape(
  raw: unknown
): CollectionIconKey {
  if (typeof raw !== "string") return "dot";
  const v = raw.trim().toLowerCase();
  return (KNOWN_KEYS as readonly string[]).includes(v)
    ? (v as CollectionIconKey)
    : "dot";
}

export function COLLECTION_ICON_SHAPE_OPTIONS(): {
  value: CollectionIconKey;
  labelZh: string;
  labelEn: string;
}[] {
  return KNOWN_KEYS.map((k) => ({
    value: k,
    labelZh: ICON_LIBRARY[k].labelZh,
    labelEn: ICON_LIBRARY[k].labelEn,
  }));
}

export function CollectionIconGlyph({
  shape,
  color,
  size = 10,
  className,
}: {
  shape?: CollectionIconShape | string | null;
  color: string;
  size?: number;
  className?: string;
}) {
  const key = normalizeCollectionIconShape(shape);
  const def = ICON_LIBRARY[key];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
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
