// Sample data used when STEAM_MOCK=1, so the app can be tried without an API key.
// Try the profiles: alice, bob, carol, dave (dave's library is private).
import type { AppDetails, OwnedGame } from "./types.ts";

const g = (appid: number, name: string, hours: number): OwnedGame => ({ appid, name, playtimeMinutes: hours * 60 });

const modes = (coop: boolean, pvp: boolean, online: boolean, local: boolean) => ({ coop, pvp, online, local });
const usd = (cents: number, discountPercent = 0) => ({
  initial: discountPercent ? Math.round(cents / (1 - discountPercent / 100)) : cents,
  final: cents,
  discountPercent,
  formatted: `$${(cents / 100).toFixed(2)}`,
});

export const MOCK_APP_DETAILS: Record<number, AppDetails> = {
  730: { name: "Counter-Strike 2", isFree: true, multiplayer: true, modes: modes(false, true, true, false), price: null },
  570: { name: "Dota 2", isFree: true, multiplayer: true, modes: modes(true, true, true, false), price: null },
  892970: { name: "Valheim", isFree: false, multiplayer: true, modes: modes(true, false, true, false), price: usd(1999) },
  548430: { name: "Deep Rock Galactic", isFree: false, multiplayer: true, modes: modes(true, false, true, false), price: usd(749, 75) },
  1966720: { name: "Lethal Company", isFree: false, multiplayer: true, modes: modes(true, false, true, false), price: usd(999) },
  413150: { name: "Stardew Valley", isFree: false, multiplayer: true, modes: modes(true, false, true, true), price: usd(1499) },
  620: { name: "Portal 2", isFree: false, multiplayer: true, modes: modes(true, false, true, true), price: usd(98, 90) },
  1086940: { name: "Baldur's Gate 3", isFree: false, multiplayer: true, modes: modes(true, false, true, true), price: usd(5999) },
  252950: { name: "Rocket League", isFree: true, multiplayer: true, modes: modes(false, true, true, true), price: null },
  553850: { name: "HELLDIVERS™ 2", isFree: false, multiplayer: true, modes: modes(true, false, true, false), price: usd(3999) },
  1145360: { name: "Hades", isFree: false, multiplayer: false, modes: modes(false, false, false, false), price: usd(2499) },
  367520: { name: "Hollow Knight", isFree: false, multiplayer: false, modes: modes(false, false, false, false), price: usd(749, 50) },
};

interface MockPlayer {
  vanity: string;
  steamid: string;
  name: string;
  avatar: string;
  profileUrl: string;
  games: OwnedGame[] | null;
}

export const MOCK_PLAYERS: MockPlayer[] = [
  {
    vanity: "alice",
    steamid: "76561190000000001",
    name: "Alice",
    avatar: "",
    profileUrl: "https://steamcommunity.com/id/alice",
    games: [
      g(730, "Counter-Strike 2", 812), g(892970, "Valheim", 140), g(548430, "Deep Rock Galactic", 95),
      g(1966720, "Lethal Company", 31), g(413150, "Stardew Valley", 210), g(620, "Portal 2", 22),
      g(1145360, "Hades", 88), g(1086940, "Baldur's Gate 3", 160),
    ],
  },
  {
    vanity: "bob",
    steamid: "76561190000000002",
    name: "Bob",
    avatar: "",
    profileUrl: "https://steamcommunity.com/id/bob",
    games: [
      g(730, "Counter-Strike 2", 1530), g(892970, "Valheim", 60), g(1966720, "Lethal Company", 44),
      g(553850, "HELLDIVERS™ 2", 120), g(252950, "Rocket League", 400), g(1145360, "Hades", 12),
      g(620, "Portal 2", 9),
    ],
  },
  {
    vanity: "carol",
    steamid: "76561190000000003",
    name: "Carol",
    avatar: "",
    profileUrl: "https://steamcommunity.com/id/carol",
    games: [
      g(730, "Counter-Strike 2", 75), g(892970, "Valheim", 33), g(548430, "Deep Rock Galactic", 210),
      g(413150, "Stardew Valley", 64), g(553850, "HELLDIVERS™ 2", 55), g(1145360, "Hades", 40),
      g(367520, "Hollow Knight", 70),
    ],
  },
  {
    vanity: "dave",
    steamid: "76561190000000004",
    name: "Dave",
    avatar: "",
    profileUrl: "https://steamcommunity.com/id/dave",
    games: null,
  },
];
