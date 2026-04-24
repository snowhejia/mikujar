import { useState, useEffect, useRef, useMemo, type CSSProperties, type ReactNode } from "react";
import type { Collection, NoteCard } from "../../types";

// ── Color tokens (cardnote brand) ──────────────────────────────────────────────
const INK     = '#37352f';
const INK_70  = 'rgba(55,53,47,0.70)';
const INK_45  = 'rgba(55,53,47,0.45)';
const INK_14  = 'rgba(55,53,47,0.14)';
const INK_07  = 'rgba(55,53,47,0.07)';
const JAR     = '#5e9fe8';
const JAR_SOFT = 'rgba(94,159,232,0.14)';
const TILE    = '#ecece8';
const WHITE   = '#ffffff';
const SEA     = '#eef2f6';
const SEA_DEEP = '#e3e9ef';
const GRASS   = '#e7ece4';
const GRASS_EDGE = '#d6ddd3';

function shade(hex: string, amt: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt < 0) {
    const k = 1 + amt;
    r = Math.round(r * k); g = Math.round(g * k); b = Math.round(b * k);
  } else {
    r = Math.round(r + (255 - r) * amt);
    g = Math.round(g + (255 - g) * amt);
    b = Math.round(b + (255 - b) * amt);
  }
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ── Layout ────────────────────────────────────────────────────────────────────
type Layout = { id: string; x: number; y: number; islandW: number; islandD: number };

function computeLayouts(collections: Collection[]): Layout[] {
  const GA = 137.508 * (Math.PI / 180);
  return collections.map((col, i) => {
    const floors = col.children?.length ?? 0;
    const islandW = Math.min(220, Math.max(160, 160 + floors * 10));
    const islandD = Math.round(islandW * 0.85);
    const r = i === 0 ? 0 : Math.sqrt(i) * 320;
    const theta = i * GA;
    return {
      id: col.id,
      x: Math.round(r * Math.cos(theta)) - islandW / 2,
      y: Math.round(r * Math.sin(theta)) - islandD / 2,
      islandW,
      islandD,
    };
  });
}

// ── Block primitive ───────────────────────────────────────────────────────────
interface BlockProps {
  w: number; d: number; h: number;
  x?: number; y?: number;
  top?: string; side?: string; sideDark?: string;
  border?: string; radius?: number;
  sideLabel?: ReactNode;
  sideLabelColor?: string;
  sideLabelWeight?: number;
  sideLabelSize?: number;
  sideBadge?: ReactNode;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
}

function Block({
  w, d, h, x = 0, y = 0,
  top = WHITE, side = TILE, sideDark, border = INK_14, radius = 2,
  sideLabel, sideLabelColor = INK, sideLabelWeight = 600, sideLabelSize = 11,
  sideBadge, children, onClick, style,
}: BlockProps) {
  const darker = sideDark ?? shade(side, -0.08);
  const base: CSSProperties = { position: 'absolute', transformOrigin: '0 0', boxSizing: 'border-box' };
  return (
    <div onClick={onClick} style={{ position: 'absolute', left: x, top: y, transformStyle: 'preserve-3d', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {/* top */}
      <div style={{ ...base, width: w, height: d, background: top, border: `1px solid ${border}`, borderRadius: radius, transform: `translateZ(${h}px)`, transition: 'transform 300ms cubic-bezier(.2,.7,.2,1), background 200ms' }}>
        {children}
      </div>
      {/* front */}
      <div style={{ ...base, width: w, height: h, background: darker, borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}`, borderTop: `1px solid ${border}`, transform: `translateY(${d}px) translateZ(${h}px) rotateX(-90deg)`, display: 'flex', alignItems: 'center', padding: '0 10px', overflow: 'hidden' }}>
        {sideLabel != null && (
          <div style={{ fontSize: sideLabelSize, fontWeight: sideLabelWeight, color: sideLabelColor, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
            {sideLabel}
            {sideBadge != null && (
              <span style={{ marginLeft: 'auto', fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: Math.max(9, sideLabelSize - 2), color: INK_45, fontWeight: 500 }}>{sideBadge}</span>
            )}
          </div>
        )}
      </div>
      {/* right */}
      <div style={{ ...base, width: h, height: d, background: side, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, borderRight: `1px solid ${border}`, transform: `translateX(${w}px) translateZ(${h}px) rotateY(90deg)` }} />
      {/* back */}
      <div style={{ ...base, width: w, height: h, background: shade(side, -0.04), borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}`, borderTop: `1px solid ${border}`, transform: `translateZ(${h}px) rotateX(90deg)` }} />
      {/* left */}
      <div style={{ ...base, width: h, height: d, background: shade(side, 0.04), borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, borderLeft: `1px solid ${border}`, transform: `translateX(0) rotateY(-90deg)` }} />
      {/* bottom */}
      <div style={{ ...base, width: w, height: d, background: shade(side, -0.1), border: `1px solid ${border}`, transform: `translateZ(0)` }} />
    </div>
  );
}

// ── Pitched gable roof ────────────────────────────────────────────────────────
function PitchedRoof({ w, d, color = INK, border = INK }: { w: number; d: number; color?: string; border?: string }) {
  const rise = Math.max(12, Math.min(w, d) * 0.25);
  const halfD = d / 2;
  const slopeLen = Math.sqrt(halfD * halfD + rise * rise);
  const angleDeg = Math.atan2(rise, halfD) * 180 / Math.PI;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: d, transformStyle: 'preserve-3d' }}>
      <div style={{ position: 'absolute', left: 0, top: halfD, width: w, height: slopeLen, background: color, border: `1px solid ${border}`, boxSizing: 'border-box', transformOrigin: '0 0', transform: `translateZ(${rise}px) rotateX(${-angleDeg}deg)` }} />
      <div style={{ position: 'absolute', left: 0, top: halfD - slopeLen, width: w, height: slopeLen, background: shade(color, -0.15), border: `1px solid ${border}`, boxSizing: 'border-box', transformOrigin: '0 100%', transform: `translateZ(${rise}px) rotateX(${angleDeg}deg)` }} />
    </div>
  );
}

// ── Island ground (sea → beach → land) ───────────────────────────────────────
function IslandGround({ w, d }: { w: number; d: number }) {
  const pad = 18, landH = 24, beachH = 14, seaH = 2;
  return (
    <>
      <Block w={w + 70} d={d + 70} h={seaH} x={-35} y={-35} top={SEA} side={SEA_DEEP} border={INK_07} radius={8} />
      <div style={{ position: 'absolute', transform: `translateZ(${seaH}px)`, transformStyle: 'preserve-3d' }}>
        <Block w={w + pad * 2} d={d + pad * 2} h={beachH} x={-pad} y={-pad} top={GRASS} side={GRASS_EDGE} border={INK_07} radius={8} />
      </div>
      <div style={{ position: 'absolute', transform: `translateZ(${seaH + beachH}px)`, transformStyle: 'preserve-3d' }}>
        <Block w={w} d={d} h={landH} top={WHITE} side={TILE} border={INK_14} radius={6}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${INK_07} 1px, transparent 1px), linear-gradient(90deg, ${INK_07} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.9 }} />
        </Block>
      </div>
    </>
  );
}

// ── Floor plan dots ───────────────────────────────────────────────────────────
function FloorPlan({ n, color, active }: { w?: number; d?: number; n: number; color: string; active: boolean }) {
  const N = Math.min(n, 14);
  const cols = Math.max(2, Math.ceil(Math.sqrt(N)));
  return (
    <div style={{ position: 'absolute', inset: 14, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3, pointerEvents: 'none' }}>
      {Array.from({ length: N }).map((_, i) => (
        <div key={i} style={{ aspectRatio: '1', background: active && i % 4 === 0 ? color : i % 3 === 0 ? JAR_SOFT : TILE, border: `1px solid ${INK_14}`, borderRadius: 1 }} />
      ))}
    </div>
  );
}

// ── Building ──────────────────────────────────────────────────────────────────
interface BuildingProps {
  collection: Collection;
  islandW: number; islandD: number;
  exploded: boolean; isActive: boolean; isDimmed: boolean;
  onClick: (id: string) => void;
  onClickFloor: (bid: string, fid: string) => void;
  activeFloorId: string | null;
}

function Building({ collection, islandW, islandD, exploded, isActive, isDimmed, onClick, onClickFloor, activeFloorId }: BuildingProps) {
  const floors = collection.children ?? [];
  const color = collection.dotColor || JAR;
  const w = Math.round(islandW * 0.6);
  const d = Math.round(islandD * 0.6);
  const bx = (islandW - w) / 2;
  const by = (islandD - d) / 2 - 4;
  const FLOOR_H = 30;
  const GROUND_H = 40;
  const liftBase = isActive ? 24 : 0;
  const gap = exploded ? 20 : 0;
  const totalFloors = floors.length;
  const totalCards = floors.reduce((s, f) => s + f.cards.length, 0);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(collection.id); }}
      style={{ position: 'absolute', left: bx, top: by, transformStyle: 'preserve-3d', transform: `translateZ(${GROUND_H + liftBase}px)`, transition: 'transform 400ms cubic-bezier(.2,.7,.2,1), opacity 300ms, filter 300ms', opacity: isDimmed ? 0.4 : 1, filter: isDimmed ? 'saturate(0.5)' : 'none' }}
    >
      {floors.map((floor, i) => {
        const zBase = i * (FLOOR_H + gap);
        const isFloorActive = activeFloorId === floor.id;
        const sideColor = isFloorActive ? shade(color, 0.15) : WHITE;
        return (
          <div
            key={floor.id}
            onClick={(e) => { e.stopPropagation(); if (exploded) onClickFloor(collection.id, floor.id); }}
            style={{ position: 'absolute', transformStyle: 'preserve-3d', transform: `translateZ(${zBase}px)`, transition: 'transform 400ms cubic-bezier(.2,.7,.2,1)', cursor: exploded ? 'pointer' : 'default' }}
          >
            <Block
              w={w} d={d} h={FLOOR_H - 2}
              top={WHITE} side={sideColor} sideDark={shade(sideColor, -0.06)}
              border={INK_14} radius={2}
              sideLabel={floor.name} sideLabelColor={INK} sideBadge={floor.cards.length} sideLabelSize={11}
            >
              <FloorPlan n={floor.cards.length} color={color} active={isFloorActive} />
              <div style={{ position: 'absolute', left: 8, top: 6, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 9, color: INK_45, letterSpacing: '0.1em', background: WHITE, padding: '1px 4px', borderRadius: 3, border: `1px solid ${INK_07}` }}>F{i + 1}</div>
            </Block>
          </div>
        );
      })}

      {/* pitched roof */}
      <div style={{ position: 'absolute', transformStyle: 'preserve-3d', transform: `translateZ(${totalFloors * (FLOOR_H + gap)}px)`, transition: 'transform 400ms cubic-bezier(.2,.7,.2,1)' }}>
        <PitchedRoof w={w} d={d} color={shade(color, -0.15)} border={INK_14} />
      </div>

      {/* floating pill label */}
      {!isActive && (
        <div style={{ position: 'absolute', left: w / 2 - 60, top: -8, width: 120, textAlign: 'center', transformStyle: 'preserve-3d', transform: `translateZ(${totalFloors * FLOOR_H + 52}px) rotateZ(40deg) rotateX(-55deg)`, pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: WHITE, border: `1px solid ${INK_14}`, borderRadius: 6, padding: '3px 8px', fontSize: 11, color: INK, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, border: `1px solid ${INK_14}`, flexShrink: 0 }} />
            {collection.name}
            {totalFloors > 0 && <span style={{ color: INK_45, fontWeight: 500, marginLeft: 2 }}>{totalFloors}层·{totalCards}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Island with building ──────────────────────────────────────────────────────
interface IslandProps {
  collection: Collection;
  layout: Layout;
  exploded: boolean; isActive: boolean; isDimmed: boolean;
  onSelectBuilding: (id: string) => void;
  onClickFloor: (bid: string, fid: string) => void;
  activeFloorId: string | null;
}

function IslandWithBuilding({ collection, layout, exploded, isActive, isDimmed, onSelectBuilding, onClickFloor, activeFloorId }: IslandProps) {
  return (
    <div style={{ position: 'absolute', left: layout.x, top: layout.y, transformStyle: 'preserve-3d' }}>
      <IslandGround w={layout.islandW} d={layout.islandD} />
      <Building
        collection={collection} islandW={layout.islandW} islandD={layout.islandD}
        exploded={exploded} isActive={isActive} isDimmed={isDimmed}
        onClick={onSelectBuilding} onClickFloor={onClickFloor} activeFloorId={activeFloorId}
      />
    </div>
  );
}

// ── Camera stage ──────────────────────────────────────────────────────────────
type Cam = { rx: number; rz: number; zoom: number };

function Stage({ cam, children, onBackgroundClick }: { cam: Cam; children: ReactNode; onBackgroundClick: () => void }) {
  return (
    <div onClick={onBackgroundClick} style={{ position: 'absolute', inset: 0, perspective: 1600, perspectiveOrigin: '50% 38%', background: SEA, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 30% 30%, ${INK_07} 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, ${INK_07} 0 1px, transparent 2px)`, backgroundSize: '80px 80px, 110px 110px', opacity: 0.7, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d', transform: `translate(-50%,-50%) scale(${cam.zoom}) rotateX(${cam.rx}deg) rotateZ(${cam.rz}deg)`, transition: 'transform 500ms cubic-bezier(.2,.7,.2,1)' }}>
        {children}
      </div>
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ activeCol, activeFloor, onHome, onBuilding }: {
  activeCol: Collection | null; activeFloor: Collection | null;
  onHome: () => void; onBuilding: () => void;
}) {
  const BtnStyle: CSSProperties = { all: 'unset', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 6px', borderRadius: 4, cursor: 'pointer' };
  return (
    <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6, background: WHITE, border: `1px solid ${INK_14}`, borderRadius: 8, padding: '6px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', fontSize: 13, color: INK, maxWidth: 'calc(100% - 340px)' }}>
      <button onClick={onHome} style={{ ...BtnStyle, color: INK_45, fontWeight: 500 }}>笔记群岛</button>
      {activeCol && (
        <>
          <span style={{ color: INK_45, fontSize: 12 }}>/</span>
          <button onClick={onBuilding} style={{ ...BtnStyle, color: activeFloor ? INK_70 : INK, fontWeight: activeFloor ? 500 : 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeCol.dotColor || JAR, border: `1px solid ${INK_14}` }} />
            {activeCol.name}
          </button>
        </>
      )}
      {activeFloor && (
        <>
          <span style={{ color: INK_45, fontSize: 12 }}>/</span>
          <span style={{ fontWeight: 600, padding: '2px 6px' }}>{activeFloor.name}</span>
        </>
      )}
    </div>
  );
}

// ── Notes panel (right sidebar) ───────────────────────────────────────────────
function NotesPanel({ collections, activeCol, activeFloor, onNavigate }: {
  collections: Collection[];
  activeCol: Collection | null;
  activeFloor: Collection | null;
  onNavigate: (id: string) => void;
}) {
  const scope = activeFloor ? 'floor' : activeCol ? 'building' : 'island';
  const title = activeFloor?.name ?? activeCol?.name ?? '笔记群岛';
  const scopeLabel = scope === 'island' ? '合集 · 群岛' : scope === 'building' ? '子合集 · 岛屿建筑' : '楼层';
  const hint = activeFloor ? '该楼层下的笔记'
    : activeCol?.hint ?? (scope === 'building' ? '点击楼层查看笔记' : '所有合集的笔记总览');
  const totalCards = activeFloor
    ? activeFloor.cards.length
    : activeCol
    ? (activeCol.children ?? []).reduce((s, f) => s + f.cards.length, 0) + activeCol.cards.length
    : collections.reduce((s, c) => s + c.cards.length + (c.children ?? []).reduce((a, f) => a + f.cards.length, 0), 0);
  const totalFloors = activeCol ? (activeCol.children?.length ?? 0) : collections.reduce((s, c) => s + (c.children?.length ?? 0), 0);
  const totalBuildings = collections.length;

  const recentCards: (NoteCard & { colName: string })[] = useMemo(() => {
    const out: (NoteCard & { colName: string })[] = [];
    const addFrom = (cards: NoteCard[], colName: string) => {
      cards.forEach(c => out.push({ ...c, colName }));
    };
    if (activeFloor) {
      addFrom(activeFloor.cards, activeFloor.name);
    } else if (activeCol) {
      addFrom(activeCol.cards, activeCol.name);
      (activeCol.children ?? []).forEach(f => addFrom(f.cards, f.name));
    } else {
      collections.forEach(col => {
        addFrom(col.cards, col.name);
        (col.children ?? []).forEach(f => addFrom(f.cards, f.name));
      });
    }
    return out.sort((a, b) => (b.addedOn ?? '').localeCompare(a.addedOn ?? '')).slice(0, 5);
  }, [collections, activeCol, activeFloor]);

  const children = activeFloor ? [] : activeCol ? (activeCol.children ?? []) : collections;

  return (
    <div style={{ position: 'absolute', top: 20, right: 20, bottom: 20, zIndex: 10, width: 300, background: WHITE, border: `1px solid ${INK_14}`, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', fontSize: 13, color: INK, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${INK_07}` }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_45, fontWeight: 600, marginBottom: 6 }}>{scopeLabel}</div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
        {hint && <div style={{ marginTop: 4, color: INK_45, fontSize: 12, lineHeight: 1.5 }}>{hint}</div>}
        {/* stats */}
        <div style={{ display: 'flex', marginTop: 12, border: `1px solid ${INK_07}`, borderRadius: 8, overflow: 'hidden' }}>
          {scope === 'island' && <StatCell k="岛屿" v={totalBuildings} />}
          {scope !== 'floor' && <StatCell k="楼层" v={totalFloors} />}
          <StatCell k="笔记" v={totalCards} />
        </div>
      </div>
      <div style={{ overflowY: 'auto', padding: '8px 10px 12px' }}>
        {children.length > 0 && (
          <>
            <SectionLabel>{scope === 'island' ? '岛屿' : '楼层'}</SectionLabel>
            {children.map((item, i) => {
              const color = 'dotColor' in item ? (item as Collection).dotColor : activeCol?.dotColor ?? JAR;
              const count = (item as Collection).cards.length + ((item as Collection).children ?? []).reduce((s, f) => s + f.cards.length, 0);
              const sub = scope === 'island'
                ? `${(item as Collection).children?.length ?? 0} 层 · ${count} 条`
                : `F${i + 1} · ${(item as Collection).cards.length} 条`;
              return (
                <RowChild key={item.id} color={color} name={item.name} sub={sub} onClick={() => onNavigate(item.id)} />
              );
            })}
          </>
        )}
        {recentCards.length > 0 && (
          <>
            <SectionLabel>最近笔记</SectionLabel>
            {recentCards.map(card => (
              <div key={card.id} style={{ display: 'flex', flexDirection: 'column', padding: '8px 10px', margin: '4px 0', border: `1px solid ${INK_07}`, borderRadius: 8 }}>
                <div style={{ color: INK, lineHeight: 1.5, fontSize: 13, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{card.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11, color: INK_45 }}>
                  <span style={{ fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>{card.addedOn ?? '今天'}</span>
                  <span style={{ padding: '1px 6px', background: JAR_SOFT, color: '#4a8fd8', borderRadius: 3, fontSize: 10 }}>{card.colName}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function StatCell({ k, v }: { k: string; v: number }) {
  return (
    <div style={{ flex: 1, padding: '8px 10px', borderLeft: `1px solid ${INK_07}` }}>
      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>{v}</div>
      <div style={{ fontSize: 10, color: INK_45, letterSpacing: '0.08em', marginTop: 2 }}>{k}</div>
    </div>
  );
}
function SectionLabel({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK_45, fontWeight: 600, padding: '10px 6px 6px' }}>{children}</div>;
}
function RowChild({ color, name, sub, onClick }: { color: string; name: string; sub: string; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = INK_07)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, border: `1px solid ${INK_14}`, flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{name}</span>
      <span style={{ color: INK_45, fontSize: 11 }}>{sub}</span>
    </div>
  );
}

// ── Camera HUD ────────────────────────────────────────────────────────────────
function CameraHud({ setCam, spinning, onToggleSpin }: { cam?: Cam; setCam: React.Dispatch<React.SetStateAction<Cam>>; spinning: boolean; onToggleSpin: () => void }) {
  const btn: CSSProperties = { all: 'unset', cursor: 'pointer', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 14, color: INK_70 };
  const sep = <div style={{ width: 1, background: INK_07, margin: '3px 2px' }} />;
  return (
    <div style={{ position: 'absolute', left: 24, bottom: 24, zIndex: 10, display: 'flex', gap: 4, background: WHITE, border: `1px solid ${INK_14}`, borderRadius: 8, padding: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <button style={btn} title="左转" onClick={() => setCam(c => ({ ...c, rz: c.rz - 10 }))}>⟲</button>
      <button style={btn} title="右转" onClick={() => setCam(c => ({ ...c, rz: c.rz + 10 }))}>⟳</button>
      {sep}
      <button style={btn} title="放大" onClick={() => setCam(c => ({ ...c, zoom: Math.min(1.8, c.zoom + 0.1) }))}>＋</button>
      <button style={btn} title="缩小" onClick={() => setCam(c => ({ ...c, zoom: Math.max(0.35, c.zoom - 0.1) }))}>−</button>
      {sep}
      <button style={btn} title="俯视" onClick={() => setCam({ rx: 75, rz: 0, zoom: 1 })}>◇</button>
      <button style={btn} title="等轴" onClick={() => setCam({ rx: 55, rz: -38, zoom: 0.75 })}>◆</button>
      {sep}
      <button style={{ ...btn, color: spinning ? JAR : INK_70 }} title={spinning ? '停止旋转' : '自动旋转'} onClick={onToggleSpin}>↻</button>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
type Props = {
  collections: Collection[];
  onNavigateToCollection: (colId: string) => void;
};

export function IslandWorldView({ collections, onNavigateToCollection }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [cam, setCam] = useState<Cam>({ rx: 55, rz: -38, zoom: 0.75 });
  const [spinning, setSpinning] = useState(true);
  const rafRef = useRef<number>(0);

  const layouts = useMemo(() => computeLayouts(collections), [collections]);

  useEffect(() => {
    if (!spinning) return;
    const t0 = performance.now();
    const baseRz = -38;
    const loop = (t: number) => {
      const dt = (t - t0) / 1000;
      setCam(c => ({ ...c, rz: baseRz + Math.sin(dt * 0.3) * 6 }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spinning]);

  const activeCol = collections.find(c => c.id === activeId) ?? null;
  const activeFloor = activeCol?.children?.find(f => f.id === activeFloorId) ?? null;

  const handleNavigate = (id: string) => {
    onNavigateToCollection(id);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei UI",ui-sans-serif,system-ui,-apple-system,sans-serif' }}>
      <Stage cam={cam} onBackgroundClick={() => { setActiveId(null); setActiveFloorId(null); }}>
        {layouts.map((layout, i) => {
          const col = collections[i];
          if (!col) return null;
          return (
            <IslandWithBuilding
              key={layout.id}
              collection={col}
              layout={layout}
              exploded={activeId === col.id}
              isActive={activeId === col.id}
              isDimmed={!!activeId && activeId !== col.id}
              activeFloorId={activeId === col.id ? activeFloorId : null}
              onSelectBuilding={(id) => { setActiveFloorId(null); setActiveId(prev => prev === id ? null : id); }}
              onClickFloor={(_bid, fid) => setActiveFloorId(prev => prev === fid ? null : fid)}
            />
          );
        })}
      </Stage>

      <Breadcrumb
        activeCol={activeCol}
        activeFloor={activeFloor}
        onHome={() => { setActiveId(null); setActiveFloorId(null); }}
        onBuilding={() => setActiveFloorId(null)}
      />

      <NotesPanel
        collections={collections}
        activeCol={activeCol}
        activeFloor={activeFloor}
        onNavigate={handleNavigate}
      />

      <CameraHud
        cam={cam}
        setCam={setCam}
        spinning={spinning}
        onToggleSpin={() => setSpinning(s => !s)}
      />
    </div>
  );
}
