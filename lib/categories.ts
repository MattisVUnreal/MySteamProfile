import type { GameModes } from "./types.ts";

// Steam store category ids
const MULTIPLAYER = new Set([1, 9, 20, 24, 27, 36, 37, 38, 39, 47, 48, 49]);
const COOP = new Set([9, 38, 39, 48]);
const PVP = new Set([20, 36, 37, 47, 49]);
const ONLINE = new Set([20, 27, 36, 38]);
const LOCAL = new Set([24, 37, 39, 47, 48]);

export function classifyCategories(ids: number[]): { multiplayer: boolean; modes: GameModes } {
  const has = (set: Set<number>) => ids.some((id) => set.has(id));
  return {
    multiplayer: has(MULTIPLAYER),
    modes: { coop: has(COOP), pvp: has(PVP), online: has(ONLINE), local: has(LOCAL) },
  };
}
