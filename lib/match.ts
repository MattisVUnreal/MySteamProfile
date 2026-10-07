import type { MatchedGame, Player } from "./types.ts";

/**
 * Finds games owned by everyone, plus "near misses" owned by all but one
 * player. Players with private libraries are ignored.
 */
export function findSharedGames(players: Player[]): MatchedGame[] {
  const visible = players.filter((p) => p.games !== null);
  const n = visible.length;
  if (n < 2) return [];
  const minOwners = Math.max(2, n - 1);

  const byApp = new Map<number, { name: string; playtime: Record<string, number> }>();
  for (const player of visible) {
    for (const game of player.games!) {
      let entry = byApp.get(game.appid);
      if (!entry) {
        entry = { name: game.name, playtime: {} };
        byApp.set(game.appid, entry);
      }
      entry.playtime[player.steamid] = game.playtimeMinutes;
    }
  }

  const games: MatchedGame[] = [];
  for (const [appid, { name, playtime }] of byApp) {
    const owners = Object.keys(playtime);
    if (owners.length < minOwners) continue;
    games.push({
      appid,
      name,
      owners,
      missing: visible.map((p) => p.steamid).filter((id) => !(id in playtime)),
      playtimeMinutes: playtime,
      details: null,
    });
  }

  const total = (g: MatchedGame) => Object.values(g.playtimeMinutes).reduce((a, b) => a + b, 0);
  return games.sort((a, b) => b.owners.length - a.owners.length || total(b) - total(a));
}

export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
