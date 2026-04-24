import type { CSSProperties, ReactNode } from "react";

/**
 * 合集模板 / 自动建卡预设对应的图标库。
 * 风格：rail 同款"胖乎乎"抽象几何形 + 各自饱和色；
 * 每个 preset 一个独一无二的形状，共 40+ 个，覆盖 catalog 里全部预设。
 *
 * - 24×24 viewBox，尽量让形状撑到 ~80%
 * - 通过 `tint` 传入 `rgba(...)`，自动剥 alpha 取饱和 rgb 做 fill
 * - 未命中时返回 null，调用方可继续使用 emoji 兜底
 */

type IconBody = ReactNode;

const LIBRARY: Record<string, IconBody> = {
  /* ═══════════ 8 大基类 ═══════════ */
  note: (
    // 拱门（同 rail arch）
    <path d="M3 21.5 V12 A 9 9 0 0 1 21 12 V21.5 Z" />
  ),
  file: (
    // 楼梯
    <path d="M2.5 21.5 V16.5 H9 V12 H14.5 V7 H21.5 V21.5 Z" />
  ),
  topic: (
    // 四颗胖圆
    <g>
      <circle cx="6.2" cy="12" r="5.8" />
      <circle cx="17.8" cy="12" r="5.8" />
      <circle cx="12" cy="6.2" r="5.8" />
      <circle cx="12" cy="17.8" r="5.8" />
    </g>
  ),
  clip: (
    // 弧带（同 rail arc）
    <path d="M4 21 A 15 15 0 0 1 21 4 L 21 11 A 9 9 0 0 0 11 21 Z" />
  ),
  task: (
    // 波浪（同 rail wave）
    <g>
      <path d="M2.5 5 Q 7 2.5 12 4 T 21.5 5 V10.5 Q 16 12 12 10.5 T 2.5 10 Z" />
      <path d="M2.5 13.5 Q 7 11 12 12.5 T 21.5 13.5 V19 Q 16 20.5 12 19 T 2.5 18.5 Z" />
    </g>
  ),
  project: (
    // 蝴蝶 4 叶
    <g>
      <ellipse cx="7" cy="7.5" rx="5" ry="5.2" />
      <ellipse cx="17" cy="7.5" rx="5" ry="5.2" />
      <ellipse cx="7" cy="16.5" rx="5" ry="5" />
      <ellipse cx="17" cy="16.5" rx="5" ry="5" />
    </g>
  ),
  expense: (
    // 胶囊倾斜
    <rect
      x="1.5"
      y="8.5"
      width="21"
      height="7"
      rx="3.5"
      transform="rotate(-32 12 12)"
    />
  ),
  account: (
    // 心
    <path d="M12 20.8 C 10.4 19.6 2.5 14 2.5 8.2 C 2.5 5 5 2.8 8 2.8 C 9.8 2.8 11.1 3.8 12 5.4 C 12.9 3.8 14.2 2.8 16 2.8 C 19 2.8 21.5 5 21.5 8.2 C 21.5 14 13.6 19.6 12 20.8 Z" />
  ),

  /* ═══════════ 笔记子类 (6) ═══════════ */
  note_standard: (
    // 六边形：几何学习感
    <path d="M12 2 L 21 7 V 17 L 12 22 L 3 17 V 7 Z" />
  ),
  note_book: (
    // 书脊：两段厚书
    <g>
      <rect x="3" y="4" width="7.5" height="17" rx="1.4" />
      <rect x="13.5" y="4" width="7.5" height="17" rx="1.4" />
      <rect x="4.5" y="6.5" width="4.5" height="1.6" />
      <rect x="15" y="6.5" width="4.5" height="1.6" />
    </g>
  ),
  note_video: (
    // 播放三角圆角大块
    <path d="M6 4 Q 5 3.5 5 4.5 V 19.5 Q 5 20.5 6 20 L 20.5 12.8 Q 21.5 12.3 20.5 11.8 Z" />
  ),
  idea: (
    // 灯泡：圆球 + 灯座
    <g>
      <circle cx="12" cy="10" r="6.2" />
      <rect x="9" y="16" width="6" height="3" rx="0.8" />
      <rect x="10" y="19.3" width="4" height="1.6" rx="0.6" />
    </g>
  ),
  journal: (
    // 日记本：圆角 + 小锁扣
    <g>
      <rect x="4" y="3" width="15" height="18" rx="2.2" />
      <rect x="19" y="9" width="1.8" height="6" rx="0.9" />
    </g>
  ),
  quote: (
    // 双引号：两颗圆 + 尾点
    <g>
      <path d="M3 10 Q 3 5 8.5 5 V 8 Q 6 8 6 11 H 8.5 V 14 H 4 Q 3 14 3 13 Z" />
      <path d="M12 10 Q 12 5 17.5 5 V 8 Q 15 8 15 11 H 17.5 V 14 H 13 Q 12 14 12 13 Z" />
    </g>
  ),

  /* ═══════════ 文件子类 (5) ═══════════ */
  file_image: (
    // 相框 + 山和太阳
    <g>
      <rect x="2.5" y="4" width="19" height="16" rx="2.6" />
      <circle cx="8" cy="9.5" r="1.8" fill="#fff" />
      <path d="M2.5 17 L 8 11.5 L 13 15 L 16.5 12 L 21.5 16.5 V 20 H 2.5 Z" fill="#fff" />
    </g>
  ),
  file_video: (
    // 胶片：矩形 + 8 齿孔
    <g>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <g fill="#fff">
        <circle cx="5.6" cy="8" r="0.9" />
        <circle cx="5.6" cy="12" r="0.9" />
        <circle cx="5.6" cy="16" r="0.9" />
        <circle cx="18.4" cy="8" r="0.9" />
        <circle cx="18.4" cy="12" r="0.9" />
        <circle cx="18.4" cy="16" r="0.9" />
      </g>
    </g>
  ),
  file_audio: (
    // 3 根等高均衡器条
    <g>
      <rect x="4" y="4" width="4" height="16" rx="1.4" />
      <rect x="10" y="7.5" width="4" height="12.5" rx="1.4" />
      <rect x="16" y="2.5" width="4" height="17.5" rx="1.4" />
    </g>
  ),
  file_document: (
    // 折角纸 + 横线
    <g>
      <path d="M6 3 H 14 L 20 9 V 20 Q 20 21 19 21 H 6 Q 5 21 5 20 V 4 Q 5 3 6 3 Z" />
      <path d="M14 3 V 9 H 20" fill="#fff" />
    </g>
  ),
  file_other: (
    // 叠起来的文件三层
    <g>
      <rect x="4" y="14" width="16" height="6.5" rx="1.8" />
      <rect x="5.5" y="9.5" width="13" height="3" rx="1.4" />
      <rect x="7" y="6" width="10" height="2.4" rx="1.2" />
    </g>
  ),

  /* ═══════════ 主题 / 作品子类 (13) ═══════════ */
  person: (
    // 头像：圆头 + 梯形身子
    <g>
      <circle cx="12" cy="8" r="4.2" />
      <path d="M4.5 21 Q 4.5 13 12 13 Q 19.5 13 19.5 21 Z" />
    </g>
  ),
  organization: (
    // 连排建筑 3 栋
    <g>
      <rect x="3" y="8" width="5" height="13" rx="0.8" />
      <rect x="9.5" y="4" width="5" height="17" rx="0.8" />
      <rect x="16" y="10" width="5" height="11" rx="0.8" />
    </g>
  ),
  event: (
    // 日历方块：外框 + 顶条
    <g>
      <rect x="3" y="5" width="18" height="16" rx="2.6" />
      <rect x="3" y="5" width="18" height="4.2" fill="#fff" />
      <rect x="7" y="2.5" width="2" height="4" rx="1" />
      <rect x="15" y="2.5" width="2" height="4" rx="1" />
    </g>
  ),
  place: (
    // 地标泪滴 + 白心
    <g>
      <path d="M12 2.5 C 17.5 2.5 19 6.5 19 9.5 C 19 14.5 12 21.5 12 21.5 C 12 21.5 5 14.5 5 9.5 C 5 6.5 6.5 2.5 12 2.5 Z" />
      <circle cx="12" cy="9.5" r="3.2" fill="#fff" />
    </g>
  ),
  topic_concept: (
    // 脑图：中心圆 + 3 枝
    <g>
      <circle cx="12" cy="12" r="5" />
      <circle cx="5" cy="6" r="2.6" />
      <circle cx="19" cy="6" r="2.6" />
      <circle cx="12" cy="20" r="2.6" />
      <path d="M8 9 L 5 6 M 16 9 L 19 6 M 12 17 L 12 20" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </g>
  ),
  work_book: (
    // 打开的书
    <g>
      <path d="M3 6 Q 7 4 11 6 V 20 Q 7 18 3 20 Z" />
      <path d="M13 6 Q 17 4 21 6 V 20 Q 17 18 13 20 Z" />
    </g>
  ),
  work_movie: (
    // 场记板
    <g>
      <rect x="3" y="9" width="18" height="12" rx="1.6" />
      <path d="M3 9 L 7 4 L 10.5 9 Z" fill="currentColor" />
      <path d="M7 4 L 11 4 L 14.5 9 L 10.5 9 Z" fill="currentColor" />
      <path d="M11 4 L 15 4 L 18.5 9 L 14.5 9 Z" fill="currentColor" />
      <path d="M15 4 L 19 4 L 22.5 9 L 18.5 9 Z" fill="currentColor" />
    </g>
  ),
  work_anime: (
    // 星 + 小月
    <g>
      <path d="M8.5 2 L 10.5 6.5 L 15.5 7 L 11.7 10.2 L 13 15 L 8.5 12.3 L 4 15 L 5.3 10.2 L 1.5 7 L 6.5 6.5 Z" />
      <path d="M18 13 A 4 4 0 1 1 17 20 A 3 3 0 1 0 18 13 Z" />
    </g>
  ),
  work_music: (
    // 黑胶唱片
    <g>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="4.5" fill="#fff" />
      <circle cx="12" cy="12" r="1.4" />
    </g>
  ),
  work_game: (
    // 胖手柄
    <g>
      <rect x="3" y="8" width="18" height="10" rx="5" />
      <circle cx="8" cy="13" r="1.8" fill="#fff" />
      <circle cx="16" cy="13" r="1.8" fill="#fff" />
    </g>
  ),
  work_article: (
    // 纸 + 三行
    <g>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M7 8 H 17 M 7 12 H 17 M 7 16 H 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </g>
  ),
  work_course: (
    // 学位帽
    <g>
      <path d="M2 9.5 L 12 5 L 22 9.5 L 12 14 Z" />
      <path d="M6 12 V 16 Q 12 19 18 16 V 12" />
      <rect x="20" y="9" width="1.4" height="5.5" rx="0.7" />
    </g>
  ),
  work_app: (
    // 9 宫格 app 布局
    <g>
      <rect x="3" y="3" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.25" y="3" width="5.5" height="5.5" rx="1.2" />
      <rect x="15.5" y="3" width="5.5" height="5.5" rx="1.2" />
      <rect x="3" y="9.25" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.25" y="9.25" width="5.5" height="5.5" rx="1.2" />
      <rect x="15.5" y="9.25" width="5.5" height="5.5" rx="1.2" />
      <rect x="3" y="15.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.25" y="15.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="15.5" y="15.5" width="5.5" height="5.5" rx="1.2" />
    </g>
  ),

  /* ═══════════ 剪藏子类 (8) ═══════════ */
  clip_bookmark: (
    // 书签
    <path d="M7 3 H 17 Q 18 3 18 4 V 20.5 Q 18 21.5 17 21 L 12 18 L 7 21 Q 6 21.5 6 20.5 V 4 Q 6 3 7 3 Z" />
  ),
  post_xhs: (
    // 彩虹小拱
    <path d="M2 21.5 V12 A 10 10 0 0 1 22 12 V21.5 H16.5 V12 A 4.5 4.5 0 0 0 7.5 12 V21.5 Z" />
  ),
  post_bilibili: (
    // 电视机：矩形 + 两天线
    <g>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M7 3 L 12 7 L 17 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="13.5" r="1.3" fill="#fff" />
      <circle cx="14" cy="13.5" r="1.3" fill="#fff" />
    </g>
  ),
  clip_wechat: (
    // 双气泡
    <g>
      <path d="M8.5 4 Q 3 4 3 9 Q 3 11.8 5.5 13.4 L 4.8 16 L 7.6 14.4 Q 10 15 12 14.8 Q 12 10 8.5 10 Q 5 10 5 6 Q 5 4 8.5 4 Z" />
      <path d="M15 9 Q 10 9 10 13 Q 10 16 12.6 17.6 L 12 20 L 14.6 18.8 Q 16 19 17 19 Q 21 18.5 21 14 Q 21 9 15 9 Z" />
    </g>
  ),
  clip_douyin: (
    // 八分音符
    <path d="M13.5 2.5 Q 14 5 16 6.5 Q 17.8 7.8 19.5 8 V 11.3 Q 16.8 11.3 14.5 9.8 V 15.6 Q 14.5 20 11 21.2 Q 7 22.3 5 19.6 Q 3 16.8 5.2 14 Q 7.2 11.6 10.6 12.2 V 15.3 Q 9 14.6 8 15.6 Q 7 17 8 18.5 Q 9.2 20 10.8 19 Q 11.4 18.5 11.4 17.4 V 2.5 Z" />
  ),
  clip_weibo: (
    // 水滴眼：椭圆 + 瞳
    <g>
      <ellipse cx="12" cy="13" rx="9.5" ry="7" />
      <ellipse cx="10" cy="13" rx="2.6" ry="2" fill="#fff" />
      <circle cx="10" cy="13" r="1" />
    </g>
  ),
  clip_twitter: (
    // X 双条
    <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" fill="none">
      <path d="M5 5 L 19 19" />
      <path d="M19 5 L 5 19" />
    </g>
  ),
  clip_other: (
    // 回形针
    <path
      d="M16.5 8 L 8 16.5 Q 5.8 18.7 8 20.8 Q 10.2 23 12.4 20.8 L 21 12.2 Q 24 9 20.5 5.5 Q 17 2 13.8 5 L 5.5 13.3 Q 3 15.8 5 17.8"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  /* ═══════════ 任务子类 (2) ═══════════ */
  task_todo: (
    // 圆角空框（当前项 check 由"未完成"本身表达）
    <g stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
    </g>
  ),
  habit_log: (
    // 填色勾
    <g>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <path
        d="M7.5 12.5 L 10.8 15.8 L 17 8.8"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
};

export type PresetTypeIconKey = keyof typeof LIBRARY;

export function hasPresetTypeIcon(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(LIBRARY, id);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** 简易 RGB ↔ HSL（0–1 归一化）*/
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * 从 tint（`rgba(...)` / `rgb(...)`）提取颜色，并做 Sunrise Glow 友好的"降饱和"：
 *  - 饱和度上限 ~0.48（避免糖果色）
 *  - 亮度往中段靠拢（0.42 ~ 0.58），颜色既不刺眼也不死暗
 *  - 最后再和深墨色 mix 一点，把调子往 sunrise 的暖紫棕拉
 */
function softenedColorFromTint(
  tint: string | null | undefined
): string | null {
  if (!tint) return null;
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(tint);
  if (!m) return null;
  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newS = Math.min(s, 0.48);
  const newL = clamp01(Math.max(0.42, Math.min(0.58, l * 0.82 + 0.15)));
  const [nr, ng, nb] = hslToRgb(h, newS, newL);
  /** 再和 sunrise 暖墨 #3a2630 融 18%，整体色调统一偏暖 */
  const ink = [0x3a, 0x26, 0x30];
  const t = 0.18;
  const mix = (a: number, b2: number) => Math.round(a * (1 - t) + b2 * t);
  return `rgb(${mix(nr, ink[0])}, ${mix(ng, ink[1])}, ${mix(nb, ink[2])})`;
}

export function PresetTypeIcon({
  id,
  tint,
  size = 24,
  className,
  style,
}: {
  id: string;
  tint?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const body = LIBRARY[id];
  if (!body) return null;
  const color = softenedColorFromTint(tint) ?? "var(--sg-ink, #3a2630)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      color={color}
      stroke="none"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flex: "0 0 auto",
        ...style,
      }}
      aria-hidden
    >
      {body}
    </svg>
  );
}
