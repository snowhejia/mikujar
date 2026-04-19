import type { Collection } from "../../types";

export type IslandLayout = {
  colId: string;
  position: [number, number, number];
  radius: number;
  buildingSlots: { subColId: string; angle: number; dist: number }[];
};

const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

export function computeIslandLayouts(collections: Collection[]): IslandLayout[] {
  return collections.map((col, i) => {
    const r = i === 0 ? 0 : Math.sqrt(i) * 9;
    const theta = i * GOLDEN_ANGLE;
    const yOffset = i % 3 === 1 ? -1.5 : i % 3 === 2 ? 1.0 : 0;
    const position: [number, number, number] = [
      r * Math.cos(theta),
      yOffset,
      r * Math.sin(theta),
    ];
    const radius = Math.min(5.5, Math.max(2.8, 2.8 + col.cards.length * 0.1));
    const children = col.children ?? [];
    const buildingSlots = children.map((child, j) => ({
      subColId: child.id,
      angle: (j / Math.max(children.length, 1)) * Math.PI * 2 - Math.PI / 2,
      dist: radius * 0.52,
    }));
    return { colId: col.id, position, radius, buildingSlots };
  });
}
