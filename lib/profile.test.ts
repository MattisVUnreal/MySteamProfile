import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProfileInput } from "./profile.ts";
import { findSharedGames } from "./match.ts";
import type { Player } from "./types.ts";

test("parses ids, urls and vanity names", () => {
  assert.deepEqual(parseProfileInput("76561197960287930"), { kind: "id", steamid: "76561197960287930" });
  assert.deepEqual(parseProfileInput("https://steamcommunity.com/profiles/76561197960287930/"), {
    kind: "id",
    steamid: "76561197960287930",
  });
  assert.deepEqual(parseProfileInput("steamcommunity.com/id/gabelogannewell"), { kind: "vanity", name: "gabelogannewell" });
  assert.deepEqual(parseProfileInput("  gaben "), { kind: "vanity", name: "gaben" });
  assert.equal(parseProfileInput(""), null);
  assert.equal(parseProfileInput("not a profile!"), null);
  assert.equal(parseProfileInput("https://steamcommunity.com/profiles/123"), null);
});

const player = (steamid: string, appids: number[] | null): Player => ({
  steamid,
  name: steamid,
  avatar: "",
  profileUrl: "",
  games: appids && appids.map((appid) => ({ appid, name: `g${appid}`, playtimeMinutes: appid })),
});

test("finds games owned by everyone and near misses, ignoring private profiles", () => {
  const games = findSharedGames([player("a", [1, 2, 3]), player("b", [1, 2]), player("c", [1, 3]), player("d", null)]);
  assert.deepEqual(
    games.map((g) => [g.appid, g.missing]),
    [[1, []], [3, ["b"]], [2, ["c"]]],
  );
});

test("two players only match games both own", () => {
  const games = findSharedGames([player("a", [1, 2]), player("b", [2, 3])]);
  assert.deepEqual(games.map((g) => g.appid), [2]);
});

test("needs at least two visible libraries", () => {
  assert.deepEqual(findSharedGames([player("a", [1]), player("b", null)]), []);
});
