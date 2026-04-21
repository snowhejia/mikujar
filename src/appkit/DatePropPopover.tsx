import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppUiLang } from "../appUiLang";

/**
 * 日期属性的弹层选择器：自定义月视图 + 可选时间 + 清空。
 * 存储格式与现有字段一致：
 *   - 仅日期：'YYYY-MM-DD'
 *   - 含时间：'YYYY-MM-DDTHH:MM'
 */

const WEEKDAY_LABELS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const WEEKDAY_LABELS_ZH = ["一", "二", "三", "四", "五", "六", "日"] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function daysInMonth(y: number, m: number) {
  /** m: 1..12；JS Date(y, m, 0) 取「m 月的最后一天」即 m-1 月的末日 */
  return new Date(y, m, 0).getDate();
}

/** 给定年月（m: 1..12），返回「该月 1 号是周几」，以周一为 0 */
function firstWeekdayMon0(y: number, m: number) {
  const sundayBased = new Date(y, m - 1, 1).getDay(); // 0..6, Sunday = 0
  return (sundayBased + 6) % 7;
}

type GridCell = { y: number; m: number; d: number; outside: boolean };

function buildGrid(viewY: number, viewM: number): GridCell[] {
  const firstMon = firstWeekdayMon0(viewY, viewM);
  const dim = daysInMonth(viewY, viewM);
  const prevY = viewM === 1 ? viewY - 1 : viewY;
  const prevM = viewM === 1 ? 12 : viewM - 1;
  const nextY = viewM === 12 ? viewY + 1 : viewY;
  const nextM = viewM === 12 ? 1 : viewM + 1;
  const prevDim = daysInMonth(prevY, prevM);
  const out: GridCell[] = [];
  for (let i = 0; i < 42; i++) {
    if (i < firstMon) {
      out.push({ y: prevY, m: prevM, d: prevDim - firstMon + i + 1, outside: true });
    } else if (i < firstMon + dim) {
      out.push({ y: viewY, m: viewM, d: i - firstMon + 1, outside: false });
    } else {
      out.push({ y: nextY, m: nextM, d: i - firstMon - dim + 1, outside: true });
    }
  }
  return out;
}

function splitValue(value: string): { date: string; time: string; hasTime: boolean } {
  const s = value?.trim?.() ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { date: s, time: "", hasTime: false };
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})(?::\d{2})?$/);
  if (m) return { date: m[1], time: m[2], hasTime: true };
  return { date: "", time: "", hasTime: false };
}

function monthHeaderLabel(y: number, m: number, lang: "zh" | "en") {
  if (lang === "en") {
    const MONTH_EN = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${MONTH_EN[m - 1]} ${y}`;
  }
  return `${y} 年 ${m} 月`;
}

function formatTrigger(value: string, lang: "zh" | "en"): string {
  const { date, time, hasTime } = splitValue(value);
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  const base =
    lang === "en"
      ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]} ${d}, ${y}`
      : `${y} 年 ${m} 月 ${d} 日`;
  return hasTime ? `${base} ${time}` : base;
}

type Props = {
  /** 'YYYY-MM-DD' | 'YYYY-MM-DDTHH:MM' | '' */
  value: string;
  onChange: (next: string | null) => void;
  /** 按钮未选值时的占位（如 "选择日期"） */
  placeholder?: string;
  /** 对外容器类名：可用来对齐到现有属性值区域 */
  className?: string;
};

export function DatePropPopover({
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  const { lang } = useAppUiLang();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; minWidth: number }>({
    left: 0,
    top: 0,
    minWidth: 280,
  });

  const parsed = useMemo(() => splitValue(value), [value]);
  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  }, [open]);

  const initialView = useMemo(() => {
    if (parsed.date) {
      const [y, m] = parsed.date.split("-").map(Number);
      return { y, m };
    }
    return { y: today.y, m: today.m };
  }, [parsed.date, today]);

  const [viewY, setViewY] = useState(initialView.y);
  const [viewM, setViewM] = useState(initialView.m);

  /** 重新打开时跳回所选月份 */
  useEffect(() => {
    if (!open) return;
    setViewY(initialView.y);
    setViewM(initialView.m);
  }, [open, initialView.y, initialView.m]);

  /** 计算弹出位置 */
  useEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vw = window.innerWidth;
    const popW = Math.min(340, vw - 16);
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, vw - popW - 8)
    );
    /** 下方优先；视口不够时放上方 */
    const below = rect.bottom + 4;
    const estH = 420;
    const top =
      below + estH > window.innerHeight && rect.top > estH + 12
        ? Math.max(8, rect.top - estH - 4)
        : below;
    setPos({ left, top, minWidth: Math.max(280, rect.width) });
  }, [open]);

  /** 外点 / ESC 关闭 */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const root = popoverRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const t = window.setTimeout(() => {
      document.addEventListener("pointerdown", onDown, true);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const grid = useMemo(() => buildGrid(viewY, viewM), [viewY, viewM]);
  const weekdayLabels =
    lang === "en" ? WEEKDAY_LABELS_EN : WEEKDAY_LABELS_ZH;

  const selected = parsed.date
    ? (() => {
        const [y, m, d] = parsed.date.split("-").map(Number);
        return { y, m, d };
      })()
    : null;

  const commitDate = (y: number, m: number, d: number) => {
    const ymd = `${y}-${pad2(m)}-${pad2(d)}`;
    if (parsed.hasTime) onChange(`${ymd}T${parsed.time}`);
    else onChange(ymd);
  };

  const prevMonth = () => {
    if (viewM === 1) {
      setViewY(viewY - 1);
      setViewM(12);
    } else setViewM(viewM - 1);
  };
  const nextMonth = () => {
    if (viewM === 12) {
      setViewY(viewY + 1);
      setViewM(1);
    } else setViewM(viewM + 1);
  };
  const jumpToday = () => {
    setViewY(today.y);
    setViewM(today.m);
  };

  const toggleIncludeTime = () => {
    if (!parsed.date) return;
    if (parsed.hasTime) onChange(parsed.date);
    else onChange(`${parsed.date}T00:00`);
  };
  const updateTime = (t: string) => {
    if (!parsed.date) return;
    const clean = t.trim();
    if (!clean) onChange(parsed.date);
    else onChange(`${parsed.date}T${clean}`);
  };
  const clearAll = () => {
    onChange(null);
  };

  const triggerLabel = formatTrigger(value, lang);

  return (
    <div className={className ? `date-prop-popover-wrap ${className}` : "date-prop-popover-wrap"}>
      <button
        ref={triggerRef}
        type="button"
        className={
          "date-prop-popover-trigger" +
          (triggerLabel ? "" : " date-prop-popover-trigger--empty") +
          (open ? " is-open" : "")
        }
        onClick={() => setOpen((v) => !v)}
      >
        {triggerLabel ||
          placeholder ||
          (lang === "en" ? "Empty" : "空")}
      </button>
      {open
        ? createPortal(
            <div
              ref={popoverRef}
              className="date-prop-popover"
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                minWidth: pos.minWidth,
              }}
              role="dialog"
              aria-label={lang === "en" ? "Pick a date" : "选择日期"}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="date-prop-popover__value">
                {triggerLabel ||
                  (lang === "en" ? "No date" : "未设置")}
              </div>
              <div className="date-prop-popover__nav">
                <span className="date-prop-popover__month">
                  {monthHeaderLabel(viewY, viewM, lang)}
                </span>
                <button
                  type="button"
                  className="date-prop-popover__nav-today"
                  onClick={jumpToday}
                >
                  {lang === "en" ? "Today" : "今天"}
                </button>
                <button
                  type="button"
                  className="date-prop-popover__nav-arrow"
                  onClick={prevMonth}
                  aria-label={lang === "en" ? "Previous month" : "上个月"}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="date-prop-popover__nav-arrow"
                  onClick={nextMonth}
                  aria-label={lang === "en" ? "Next month" : "下个月"}
                >
                  ›
                </button>
              </div>
              <div className="date-prop-popover__weekdays" aria-hidden>
                {weekdayLabels.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="date-prop-popover__grid" role="grid">
                {grid.map((c) => {
                  const isSelected =
                    !!selected &&
                    selected.y === c.y &&
                    selected.m === c.m &&
                    selected.d === c.d;
                  const isToday =
                    c.y === today.y && c.m === today.m && c.d === today.d;
                  return (
                    <button
                      type="button"
                      key={`${c.y}-${c.m}-${c.d}-${c.outside ? "o" : "i"}`}
                      role="gridcell"
                      aria-selected={isSelected}
                      className={
                        "date-prop-popover__cell" +
                        (c.outside ? " is-outside" : "") +
                        (isToday && !isSelected ? " is-today" : "") +
                        (isSelected ? " is-selected" : "")
                      }
                      onClick={() => commitDate(c.y, c.m, c.d)}
                    >
                      {c.d}
                    </button>
                  );
                })}
              </div>
              <hr className="date-prop-popover__sep" />
              <div className="date-prop-popover__row">
                <span className="date-prop-popover__row-label">
                  {lang === "en" ? "Include time" : "包含时间"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={parsed.hasTime}
                  className={
                    "date-prop-popover__toggle" +
                    (parsed.hasTime ? " is-on" : "")
                  }
                  disabled={!parsed.date}
                  onClick={toggleIncludeTime}
                  aria-label={lang === "en" ? "Toggle time" : "切换时间"}
                >
                  <span className="date-prop-popover__toggle-knob" />
                </button>
              </div>
              {parsed.hasTime ? (
                <div className="date-prop-popover__row date-prop-popover__row--time">
                  <input
                    type="time"
                    className="date-prop-popover__time-input"
                    value={parsed.time}
                    onChange={(e) => updateTime(e.target.value)}
                    aria-label={lang === "en" ? "Time" : "时间"}
                  />
                </div>
              ) : null}
              <hr className="date-prop-popover__sep" />
              <button
                type="button"
                className="date-prop-popover__clear"
                onClick={clearAll}
                disabled={!parsed.date}
              >
                {lang === "en" ? "Clear" : "清空"}
              </button>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
