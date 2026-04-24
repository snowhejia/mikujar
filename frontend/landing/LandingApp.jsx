// LandingApp — port of the <App> driver inside
// docs/mockups/cardnote/Landing Page - Pink.html
// 保留 PRESETS / auto-hue 循环 / 所有动态效果；只暴露 onStart 给外层 App 传
// "开始使用 / 登录"的点击回调。
import React from "react";
import { PinkLanding } from "./LandingPink.jsx";
import {
  TweaksPanel,
  useTweaks,
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweakSelect,
} from "./TweaksPanel.jsx";
import "./landing-pink.css";

const DEFAULTS = /*EDITMODE-BEGIN*/ {
  preset: "yellow",
  hue: 240,
  accentHue: 360,
  saturation: 0.1,
  ghostType: true,
  showAnnotations: true,
  autoHue: true,
  hueSpeed: 10,
} /*EDITMODE-END*/;

const PRESETS = {
  candy: {
    hue: 55,
    accentHue: 210,
    saturation: 1.0,
    inkL: 0.32,
    inkC: 0.15,
    inkH: 210,
    label: "Candy Pastel",
  },
  yellow: {
    hue: 105,
    accentHue: 262,
    saturation: 1.6,
    inkL: 0.45,
    inkC: 0.3,
    inkH: 262,
    label: "Yellow × Blue",
  },
  sunblue: {
    hue: 95,
    accentHue: 240,
    saturation: 1.4,
    inkL: 0.35,
    inkC: 0.22,
    inkH: 240,
    label: "Sun × Cobalt",
  },
  pink: {
    hue: 355,
    accentHue: 355,
    saturation: 1.0,
    inkL: 0.18,
    inkC: 0.02,
    inkH: 340,
    label: "Pink Glass",
  },
  lime: {
    hue: 130,
    accentHue: 35,
    saturation: 1.2,
    inkL: 0.14,
    inkC: 0.05,
    inkH: 130,
    label: "Lime × Orange",
  },
  cyber: {
    hue: 280,
    accentHue: 150,
    saturation: 1.3,
    inkL: 0.12,
    inkC: 0.04,
    inkH: 280,
    label: "Violet × Mint",
  },
  cream: {
    hue: 55,
    accentHue: 15,
    saturation: 0.7,
    inkL: 0.22,
    inkC: 0.08,
    inkH: 35,
    label: "Cream × Cherry",
  },
  acid: {
    hue: 95,
    accentHue: 320,
    saturation: 1.4,
    inkL: 0.1,
    inkC: 0.04,
    inkH: 280,
    label: "Acid × Magenta",
  },
  mint: {
    hue: 170,
    accentHue: 20,
    saturation: 0.9,
    inkL: 0.2,
    inkC: 0.05,
    inkH: 175,
    label: "Mint × Red",
  },
  sand: {
    hue: 55,
    accentHue: 240,
    saturation: 0.6,
    inkL: 0.22,
    inkC: 0.04,
    inkH: 45,
    label: "Sand × Cobalt",
  },
  mono: {
    hue: 260,
    accentHue: 20,
    saturation: 0.1,
    inkL: 0.1,
    inkC: 0.01,
    inkH: 260,
    label: "Mono × Red",
  },
};

export function LandingApp({ onStart, heroOnly, hideTweaks, className }) {
  const [t, set] = useTweaks(DEFAULTS);
  const rootRef = React.useRef(null);

  // When preset changes, auto-push its hue/sat into tweaks
  const prevPreset = React.useRef(t.preset);
  React.useEffect(() => {
    if (prevPreset.current !== t.preset) {
      const p = PRESETS[t.preset];
      if (p) {
        set("hue", p.hue);
        set("accentHue", p.accentHue);
        set("saturation", p.saturation);
      }
      prevPreset.current = t.preset;
    }
  }, [t.preset]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const h = t.hue;
    const ah = t.accentHue;
    const s = t.saturation;
    const preset = PRESETS[t.preset] || PRESETS.pink;

    root.style.setProperty("--hue", h);
    root.style.setProperty("--accent-hue", ah);

    // Primary scale (was --pink-*)
    root.style.setProperty("--pink-50", `oklch(0.985 ${0.015 * s} ${h})`);
    root.style.setProperty("--pink-100", `oklch(0.95 ${0.15 * s} ${h})`);
    root.style.setProperty("--pink-200", `oklch(0.93 ${0.17 * s} ${h})`);
    root.style.setProperty("--pink-300", `oklch(0.9 ${0.18 * s} ${h})`);
    root.style.setProperty("--pink-400", `oklch(0.78 ${0.17 * s} ${h})`);
    root.style.setProperty("--pink-500", `oklch(0.7 ${0.19 * s} ${h})`);
    root.style.setProperty("--pink-600", `oklch(0.62 ${0.22 * s} ${h})`);
    root.style.setProperty("--pink-700", `oklch(0.5 ${0.22 * s} ${h})`);
    root.style.setProperty("--pink-ink", `oklch(0.3 ${0.18 * s} ${h})`);
    // Accent pair
    root.style.setProperty("--accent-500", `oklch(0.5 ${0.3 * s} ${ah})`);
    root.style.setProperty("--accent-600", `oklch(0.42 ${0.28 * s} ${ah})`);
    // Ink
    root.style.setProperty(
      "--ink",
      `oklch(${preset.inkL} ${preset.inkC} ${preset.inkH})`
    );
  }, [t.preset, t.hue, t.accentHue, t.saturation]);

  // Auto hue-cycle — animate primary hue through the wheel
  React.useEffect(() => {
    if (!t.autoHue) return;
    const root = rootRef.current;
    if (!root) return;
    let raf;
    const start = performance.now();
    const speed = t.hueSpeed || 8;
    const s = t.saturation;
    const tick = (now) => {
      const h = ((now - start) / 1000 / speed * 360 + (t.hue || 0)) % 360;
      root.style.setProperty("--hue", h);
      root.style.setProperty("--pink-50", `oklch(0.985 ${0.015 * s} ${h})`);
      root.style.setProperty("--pink-100", `oklch(0.95 ${0.15 * s} ${h})`);
      root.style.setProperty("--pink-200", `oklch(0.93 ${0.17 * s} ${h})`);
      root.style.setProperty("--pink-300", `oklch(0.9 ${0.18 * s} ${h})`);
      root.style.setProperty("--pink-400", `oklch(0.78 ${0.17 * s} ${h})`);
      root.style.setProperty("--pink-500", `oklch(0.7 ${0.19 * s} ${h})`);
      root.style.setProperty("--pink-600", `oklch(0.62 ${0.22 * s} ${h})`);
      root.style.setProperty("--pink-700", `oklch(0.5 ${0.22 * s} ${h})`);
      root.style.setProperty("--pink-ink", `oklch(0.3 ${0.18 * s} ${h})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [t.autoHue, t.hueSpeed, t.saturation, t.hue]);

  return (
    <div
      ref={rootRef}
      className={
        "landing-page-root" + (className ? " " + className : "")
      }
    >
      <PinkLanding
        ghost={t.ghostType}
        showAnnotations={t.showAnnotations}
        onStart={onStart}
        heroOnly={heroOnly}
      />
      {hideTweaks ? null : (
      <TweaksPanel title="Tweaks">
        <TweakSection title="Palette">
          <TweakSelect
            label="Preset"
            value={t.preset}
            onChange={(v) => set("preset", v)}
            options={Object.entries(PRESETS).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
          <TweakSlider
            label="Primary hue"
            min={0}
            max={360}
            step={5}
            value={t.hue}
            onChange={(v) => set("hue", v)}
          />
          <TweakSlider
            label="Accent hue"
            min={0}
            max={360}
            step={5}
            value={t.accentHue}
            onChange={(v) => set("accentHue", v)}
          />
          <TweakSlider
            label="Saturation"
            min={0.1}
            max={1.5}
            step={0.05}
            value={t.saturation}
            onChange={(v) => set("saturation", v)}
          />
        </TweakSection>
        <TweakSection title="Composition">
          <TweakToggle
            label="Auto cycle hue"
            value={t.autoHue}
            onChange={(v) => set("autoHue", v)}
          />
          <TweakSlider
            label="Cycle speed (sec)"
            min={2}
            max={30}
            step={1}
            value={t.hueSpeed || 8}
            onChange={(v) => set("hueSpeed", v)}
          />
          <TweakToggle
            label="Ghost serif word"
            value={t.ghostType}
            onChange={(v) => set("ghostType", v)}
          />
          <TweakToggle
            label="UI annotations"
            value={t.showAnnotations}
            onChange={(v) => set("showAnnotations", v)}
          />
        </TweakSection>
      </TweaksPanel>
      )}
    </div>
  );
}
