import "server-only";
import { classifyCategories } from "./categories.ts";
import { MOCK_APP_DETAILS, MOCK_PLAYERS } from "./mock.ts";
import type { ProfileRef } from "./profile.ts";
import type { AppDetails, OwnedGame, Player } from "./types.ts";

const API = "https://api.steampowered.com";
const STORE = "https://store.steampowered.com/api";

export const isMock = () => process.env.STEAM_MOCK === "1";

/** The API key is missing or Steam rejected it */
export class SteamKeyError extends Error {}

function apiKey(): string {
  const key = process.env.STEAM_API_KEY;
  if (!key) throw new SteamKeyError("STEAM_API_KEY is not set");
  return key;
}

async function getJson<T>(url: string, revalidate: number): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (res.status === 401 || res.status === 403) throw new SteamKeyError("Steam rejected the API key");
  if (!res.ok) throw new Error(`Steam request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function resolveSteamId(ref: ProfileRef): Promise<string | null> {
  if (isMock()) {
    const match = MOCK_PLAYERS.find((p) =>
      ref.kind === "id" ? p.steamid === ref.steamid : p.vanity === ref.name.toLowerCase(),
    );
    return match?.steamid ?? null;
  }
  if (ref.kind === "id") return ref.steamid;
  const data = await getJson<{ response: { success: number; steamid?: string } }>(
    `${API}/ISteamUser/ResolveVanityURL/v1/?key=${apiKey()}&vanityurl=${encodeURIComponent(ref.name)}`,
    86400,
  );
  return data.response.success === 1 ? (data.response.steamid ?? null) : null;
}

interface SummaryJson {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

async function getOwnedGames(steamid: string): Promise<OwnedGame[] | null> {
  const data = await getJson<{
    response: { games?: { appid: number; name: string; playtime_forever: number }[] };
  }>(
    `${API}/IPlayerService/GetOwnedGames/v1/?key=${apiKey()}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1`,
    600,
  );
  // Steam returns an empty response object when game details are private
  const games = data.response.games;
  if (!games) return null;
  return games.map((g) => ({ appid: g.appid, name: g.name, playtimeMinutes: g.playtime_forever }));
}

export async function getPlayers(steamids: string[]): Promise<Player[]> {
  if (isMock()) {
    return steamids.flatMap((id) => {
      const p = MOCK_PLAYERS.find((m) => m.steamid === id);
      return p ? [{ steamid: p.steamid, name: p.name, avatar: p.avatar, profileUrl: p.profileUrl, games: p.games }] : [];
    });
  }
  const data = await getJson<{ response: { players: SummaryJson[] } }>(
    `${API}/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey()}&steamids=${steamids.join(",")}`,
    600,
  );
  const summaries = new Map(data.response.players.map((p) => [p.steamid, p]));
  return Promise.all(
    steamids
      .filter((id) => summaries.has(id))
      .map(async (id) => {
        const s = summaries.get(id)!;
        return {
          steamid: id,
          name: s.personaname,
          avatar: s.avatarfull,
          profileUrl: s.profileurl,
          games: await getOwnedGames(id),
        };
      }),
  );
}

interface StoreJson {
  success: boolean;
  data?: {
    name: string;
    is_free: boolean;
    categories?: { id: number }[];
    price_overview?: { initial: number; final: number; discount_percent: number; final_formatted: string };
  };
}

export async function getAppDetails(appid: number, cc: string): Promise<AppDetails | null> {
  if (isMock()) return MOCK_APP_DETAILS[appid] ?? null;
  try {
    const data = await getJson<Record<string, StoreJson>>(
      `${STORE}/appdetails?appids=${appid}&cc=${cc}&l=english&filters=basic,categories,price_overview`,
      86400,
    );
    const app = data[appid];
    if (!app?.success || !app.data) return null;
    const { multiplayer, modes } = classifyCategories((app.data.categories ?? []).map((c) => c.id));
    const p = app.data.price_overview;
    return {
      name: app.data.name,
      isFree: app.data.is_free,
      multiplayer,
      modes,
      price: p
        ? { initial: p.initial, final: p.final, discountPercent: p.discount_percent, formatted: p.final_formatted }
        : null,
    };
  } catch {
    // The store API rate-limits aggressively; treat failures as unknown
    return null;
  }
}
