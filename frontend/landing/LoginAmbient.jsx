// 登录页全屏氛围层 —— 与 Landing pink-glass 同谱系，但**非 hero 搬运**：
// 无飘浮 pill 群 / 巨字 wordmark / 玻璃文件夹 / 扇形 3 卡。
//
// 结构：
//   · 多块 oklch 径向 orb 相互融合成 pink dusk
//   · 稀疏 TwinkleStar / Petal / Sparkle / Cloud 借动画漂移
//   · 4 段 CSS @keyframes 统一动态（breathe / drift / petal / twinkle），不接 rAF
import React from "react";
import { TwinkleStar, Petal, Sparkle, Cloud, PixelStar } from "./LandingPink.jsx";

export function LoginAmbient() {
  return (
    <div className="login-ambient" aria-hidden>
      {/* 三块巨型径向 orb，背景色团，慢速呼吸/位移 */}
      <span className="login-ambient__orb login-ambient__orb--a" />
      <span className="login-ambient__orb login-ambient__orb--b" />
      <span className="login-ambient__orb login-ambient__orb--c" />

      {/* 极轻的 dot-grid 纹理 */}
      <span className="login-ambient__dot-grid" />

      {/* 柔雾层：把 orb 边界糊开 */}
      <span className="login-ambient__veil" />

      {/* 稀疏闪烁星 —— 不同位置 / 不同延迟 */}
      <TwinkleStar
        size={14}
        color="var(--candy-pink-deep)"
        delay="0s"
        style={{ top: "14%", left: "12%" }}
      />
      <TwinkleStar
        size={10}
        color="var(--candy-sky-deep)"
        delay="0.8s"
        style={{ top: "22%", right: "18%" }}
      />
      <TwinkleStar
        size={12}
        color="var(--candy-fawn-deep)"
        delay="1.4s"
        style={{ bottom: "24%", left: "22%" }}
      />
      <TwinkleStar
        size={9}
        color="var(--candy-olive-deep)"
        delay="2.1s"
        style={{ bottom: "18%", right: "14%" }}
      />

      {/* 漂浮花瓣 / sparkle，CSS 位移 + 旋转 */}
      <span
        className="login-ambient__petal login-ambient__petal--a"
        style={{ top: "18%", left: "32%" }}
      >
        <Petal size={34} color="var(--candy-pink)" />
      </span>
      <span
        className="login-ambient__petal login-ambient__petal--b"
        style={{ bottom: "22%", right: "28%" }}
      >
        <Petal size={26} color="var(--candy-fawn)" />
      </span>
      <span
        className="login-ambient__petal login-ambient__petal--c"
        style={{ top: "60%", left: "16%" }}
      >
        <Sparkle size={22} color="var(--candy-sky)" />
      </span>

      {/* 左下角淡云影 */}
      <span className="login-ambient__cloud" style={{ bottom: "6%", left: "4%" }}>
        <Cloud size={96} color="oklch(1 0 0 / 0.5)" />
      </span>

      {/* 右上角 pixel-star 点缀 */}
      <span className="login-ambient__pixelstar" style={{ top: "8%", right: "8%" }}>
        <PixelStar scale={3} color="var(--candy-fawn-deep)" />
      </span>
    </div>
  );
}
