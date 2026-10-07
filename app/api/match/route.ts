import { NextResponse } from "next/server";
import { findSharedGames, mapLimit } from "@/lib/match.ts";
import { parseProfileInput } from "@/lib/profile.ts";
import { getAppDetails, getPlayers, isMock, resolveSteamId, SteamKeyError } from "@/lib/steam.ts";
import type { MatchResult, ProfileError } from "@/lib/types.ts";

const MAX_PLAYERS = 8;
// The store API allows roughly 200 requests per 5 minutes, so cap lookups per search
const MAX_STORE_LOOKUPS = 120;

export async function POST(req: Request) {
  let body: { profiles?: unknown; cc?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const inputs = Array.isArray(body.profiles)
    ? [...new Set(body.profiles.filter((p): p is string => typeof p === "string").map((p) => p.trim()).filter(Boolean))]
    : [];
  if (inputs.length < 2) return NextResponse.json({ error: "Add at least two profiles" }, { status: 400 });
  if (inputs.length > MAX_PLAYERS) {
    return NextResponse.json({ error: `You can compare up to ${MAX_PLAYERS} profiles` }, { status: 400 });
  }
  const cc = typeof body.cc === "string" && /^[a-z]{2}$/.test(body.cc) ? body.cc : "us";

  try {
    const errors: ProfileError[] = [];
    const resolved = await Promise.all(
      inputs.map(async (input) => {
        const ref = parseProfileInput(input);
        if (!ref) {
          errors.push({ input, message: "That doesn't look like a Steam profile" });
          return null;
        }
        const steamid = await resolveSteamId(ref);
        if (!steamid) errors.push({ input, message: "Profile not found" });
        return steamid;
      }),
    );
    const steamids = [...new Set(resolved.filter((id): id is string => id !== null))];
    const players = steamids.length ? await getPlayers(steamids) : [];

    const candidates = findSharedGames(players);
    const looked = candidates.slice(0, MAX_STORE_LOOKUPS);
    const details = await mapLimit(looked, 6, (g) => getAppDetails(g.appid, cc));
    const games = looked
      .map((g, i) => ({ ...g, details: details[i] }))
      .filter((g) => g.details === null || g.details.multiplayer);

    const result: MatchResult = {
      players,
      errors,
      games,
      truncated: candidates.length > looked.length,
      mock: isMock(),
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    if (err instanceof SteamKeyError) {
      return NextResponse.json(
        {
          error:
            "This site's Steam API key is missing or invalid. The site owner needs to set STEAM_API_KEY in Vercel (Project → Settings → Environment Variables) and redeploy.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Couldn't reach Steam. Try again in a minute." }, { status: 502 });
  }
}
