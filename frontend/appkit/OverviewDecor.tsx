import type { CSSProperties, ReactNode } from "react";

/**
 * 概览 dashboard 装饰：星芒 / 花朵 / Figma 选框手柄 / 书签。
 * 配色默认：星芒黄 + 花朵periwinkle，呼应 dashboard 的蓝+黄强调色；
 * `pointer-events: none` 避免抢 hover。
 */

type DecorProps = {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

/** Sunrise Glow 调色板：珊瑚 / 桃 / 日出黄 / 天蓝 */
const OV_CORAL = "#FF9A8B";
const OV_CORAL_DEEP = "#E87866";
const OV_PEACH = "#FFC3A0";
const OV_YELLOW = "#FECF6A";
const OV_SKY = "#A1E3FF";
const INK_WARM = "#3A2630";

export function SparkleIcon({
  size = 22,
  color = OV_YELLOW,
  className,
  style,
}: DecorProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    >
      <path
        d="M12 1.5c.5 4.4 1.4 6.6 3.2 8 1.8 1.4 4 2 7.3 2.5-3.3.5-5.5 1.1-7.3 2.5-1.8 1.4-2.7 3.6-3.2 8-.5-4.4-1.4-6.6-3.2-8C7 13.1 4.8 12.5 1.5 12c3.3-.5 5.5-1.1 7.3-2.5 1.8-1.4 2.7-3.6 3.2-8z"
        fill={color}
      />
    </svg>
  );
}

export function FlowerIcon({
  size = 20,
  color = OV_SKY,
  className,
  style,
}: DecorProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    >
      <g fill={color}>
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
      </g>
      <circle cx="12" cy="12" r="2.6" fill={OV_PEACH} />
    </svg>
  );
}

/** 4 角小蓝方 + 虚线外框：Figma selection handles 贴纸 */
export function SelectionHandleFrame({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): ReactNode {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        pointerEvents: "none",
        border: "1px dashed rgba(232, 120, 102, 0.55)",
        borderRadius: 4,
        ...style,
      }}
      aria-hidden
    >
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <span
          key={corner}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            background: "#ffffff",
            border: `1.4px solid ${OV_CORAL_DEEP}`,
            borderRadius: 1,
            top: corner.startsWith("t") ? -4 : "auto",
            bottom: corner.startsWith("b") ? -4 : "auto",
            left: corner.endsWith("l") ? -4 : "auto",
            right: corner.endsWith("r") ? -4 : "auto",
          }}
        />
      ))}
    </div>
  );
}

/** 自绘骰子：倾斜方框描边 + 五点（骰子 5 面），配色与 dashboard 主调一致 */
export function DiceIcon({
  size = 16,
  color = OV_CORAL_DEEP,
  dotColor = OV_YELLOW,
  className,
  style,
}: DecorProps & { dotColor?: string }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{
        pointerEvents: "none",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      aria-hidden
    >
      <g
        transform="rotate(-8 12 12)"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="16" height="16" rx="4" ry="4" />
      </g>
      <g fill={dotColor} transform="rotate(-8 12 12)">
        <circle cx="8.5" cy="8.5" r="1.4" />
        <circle cx="15.5" cy="8.5" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="8.5" cy="15.5" r="1.4" />
        <circle cx="15.5" cy="15.5" r="1.4" />
      </g>
    </svg>
  );
}

export function BookmarkIcon({
  size = 16,
  color = INK_WARM,
  className,
  style,
}: DecorProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    >
      <path d="M6 3h12v18l-6-4.2L6 21V3z" fill={color} />
    </svg>
  );
}

/* ═══════════════ 额外涂鸦形状（内部用，丰富 hero 装饰） ═══════════════ */

type StrokeDoodleProps = {
  size: number;
  color: string;
  style?: CSSProperties;
};

function StrokeSvg({
  size,
  color,
  style,
  children,
}: StrokeDoodleProps & { children: ReactNode }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={Math.max(1.8, size / 14)}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Heart({ size, color, style }: StrokeDoodleProps): ReactNode {
  return (
    <StrokeSvg size={size} color={color} style={style}>
      <path d="M12 20c-4-3-8-6-8-11 0-3 4-5 6-3 1 1 2 2 2 3 0-1 1-2 2-3 2-2 6 0 6 3 0 5-4 8-8 11z" />
    </StrokeSvg>
  );
}

function Wavy({ size, color, style }: StrokeDoodleProps): ReactNode {
  return (
    <StrokeSvg size={size} color={color} style={style}>
      <path d="M2 14c2-4 4-4 6 0s4 4 6 0 4-4 6 0 4 4 6 0" />
    </StrokeSvg>
  );
}

function Squiggle({ size, color, style }: StrokeDoodleProps): ReactNode {
  return (
    <StrokeSvg size={size} color={color} style={style}>
      <path d="M3 12c0-4 5-4 5 0s5 4 5 0 5-4 5 0 3 2 3 2" />
    </StrokeSvg>
  );
}

function CircleO({ size, color, style }: StrokeDoodleProps): ReactNode {
  return (
    <StrokeSvg size={size} color={color} style={style}>
      <path d="M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" />
    </StrokeSvg>
  );
}

function Dots({
  size,
  color,
  style,
}: StrokeDoodleProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    >
      <circle cx="6" cy="8" r="1.6" />
      <circle cx="12" cy="5" r="1.3" />
      <circle cx="10" cy="14" r="1.6" />
      <circle cx="17" cy="10" r="1.3" />
      <circle cx="19" cy="17" r="1.7" />
      <circle cx="5" cy="18" r="1.2" />
    </svg>
  );
}

function Bracket({ size, color, style }: StrokeDoodleProps): ReactNode {
  return (
    <StrokeSvg size={size} color={color} style={style}>
      <path d="M15 4l-6 8 6 8" />
    </StrokeSvg>
  );
}

/** 一组散落的装饰：混合星 / 心 / 波浪 / 点阵 / 圆 / 小花，避免形状单调 */
export function SprinkleCluster({
  className,
}: {
  className?: string;
}): ReactNode {
  return (
    <div className={className} aria-hidden>
      <SparkleIcon
        size={26}
        color={OV_YELLOW}
        style={{ position: "absolute", top: "12%", right: "12%", animation: "ov-twinkle 2.4s ease-in-out infinite" }}
      />
      <Dots
        size={22}
        color={OV_CORAL}
        style={{ position: "absolute", top: "46%", right: "4%" }}
      />
      <Heart
        size={18}
        color={OV_CORAL_DEEP}
        style={{ position: "absolute", bottom: "18%", right: "16%" }}
      />
      <Wavy
        size={34}
        color={OV_SKY}
        style={{ position: "absolute", top: "6%", left: "8%" }}
      />
      <CircleO
        size={18}
        color={OV_CORAL}
        style={{ position: "absolute", top: "42%", left: "2%" }}
      />
      <Squiggle
        size={26}
        color={OV_YELLOW}
        style={{ position: "absolute", bottom: "14%", left: "18%" }}
      />
    </div>
  );
}

/** 扇形展开的 3 张贴纸卡（hero 中央的装饰）；每张贴纸用不同涂鸦形状
 *  中间那张前卡叠一行用户昵称（问候语 + 昵称），让 hero 自带身份感 */
export function HeroStickerStack({
  className,
  nickname,
  greetingKicker,
}: {
  className?: string;
  /** 当前登录用户昵称；未登录时传空串，仅显示 greetingKicker */
  nickname: string;
  /** 昵称上方的小问候文本（"Hello," 等） */
  greetingKicker: string;
}): ReactNode {
  return (
    <div className={className} aria-hidden>
      <div className="overview-dashboard__sticker overview-dashboard__sticker--left">
        <Heart
          size={36}
          color={OV_CORAL}
          style={{ position: "absolute", top: "32%", left: "30%" }}
        />
        <Squiggle
          size={24}
          color={OV_CORAL_DEEP}
          style={{ position: "absolute", bottom: "20%", right: "22%" }}
        />
      </div>
      <div className="overview-dashboard__sticker overview-dashboard__sticker--right">
        <Wavy
          size={38}
          color="#FFFFFF"
          style={{ position: "absolute", top: "26%", right: "22%" }}
        />
        <Dots
          size={30}
          color={OV_YELLOW}
          style={{ position: "absolute", bottom: "24%", left: "22%" }}
        />
      </div>
      <div className="overview-dashboard__sticker overview-dashboard__sticker--front">
        <Bracket
          size={22}
          color={OV_YELLOW}
          style={{ position: "absolute", top: "14%", left: "16%" }}
        />
        <FlowerIcon
          size={26}
          color="#FFFFFF"
          style={{
            position: "absolute",
            bottom: "14%",
            right: "16%",
            opacity: 0.9,
          }}
        />
        <div className="overview-dashboard__sticker-greeting">
          <span className="overview-dashboard__sticker-greeting-kicker">
            {greetingKicker}
          </span>
          {nickname ? (
            <span className="overview-dashboard__sticker-greeting-name">
              {nickname}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
