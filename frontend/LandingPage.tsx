import type { ReactNode } from "react";
// 把 cardnote pink-glass landing 原封不动搬进来；driver 负责 PRESETS / 色相自动循环 / TweaksPanel。
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error JSX 模块无类型声明（vite 会编译 .jsx）
import { LandingApp } from "./landing/LandingApp.jsx";

export function LandingPage({
  onStart,
}: {
  onStart: (panel?: "login" | "register") => void;
}): ReactNode {
  return <LandingApp onStart={onStart} />;
}
