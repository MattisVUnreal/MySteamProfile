"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { MatchedGame, MatchResult, Player } from "@/lib/types.ts";

type Mode = "all" | "coop" | "pvp" | "local";

const REGIONS: [string, string][] = [
  ["us", "US ($)"],
  ["gb", "UK (£)"],
  ["de", "Europe (€)"],
  ["ca", "Canada"],
  ["au", "Australia"],
  ["br", "Brazil"],
];

const hours = (minutes: number) => `${Math.round(minutes / 60).toLocaleString()} h`;

function Avatar({ player, size = 32 }: { player: Player; size?: number }) {
  if (player.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="avatar" src={player.avatar} alt={player.name} title={player.name} width={size} height={size} />;
  }
  return (
    <span className="avatar placeholder" title={player.name} style={{ width: size, height: size }}>
      {player.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function PlayTogether() {
  const router = useRouter();
  const params = useSearchParams();
  const [text, setText] = useState("");
  const [cc, setCc] = useState("us");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [showNearMisses, setShowNearMisses] = useState(true);

  async function search(profiles: string[], region: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profiles, cc: region }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Shared links (?p=alice,bob) run the search straight away
  useEffect(() => {
    const shared = params.get("p");
    const region = params.get("cc") ?? "us";
    if (shared) {
      const profiles = shared.split(",").filter(Boolean);
      setText(profiles.join("\n"));
      setCc(region);
      search(profiles, region);
      return;
    }
    try {
      const saved = localStorage.getItem("profiles");
      if (saved) setText(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const profiles = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    try {
      localStorage.setItem("profiles", profiles.join("\n"));
    } catch {}
    router.replace(`?p=${profiles.map(encodeURIComponent).join(",")}&cc=${cc}`, { scroll: false });
    search(profiles, cc);
  }

  const playersById = useMemo(() => new Map(result?.players.map((p) => [p.steamid, p])), [result]);
  const visibleCount = result?.players.filter((p) => p.games).length ?? 0;

  const games = useMemo(() => {
    if (!result) return [];
    return result.games.filter((g) => {
      if (!showNearMisses && g.missing.length > 0) return false;
      if (mode === "all") return true;
      return g.details?.modes[mode] ?? false;
    });
  }, [result, mode, showNearMisses]);

  const everyone = games.filter((g) => g.missing.length === 0);
  const nearMisses = games.filter((g) => g.missing.length > 0);

  return (
    <>
      <form className="search" onSubmit={submit}>
        <label htmlFor="profiles">Steam profiles, one per line</label>
        <textarea
          id="profiles"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"https://steamcommunity.com/id/yourname\n76561197960287930\nfriendname"}
        />
        <div className="row">
          <select value={cc} onChange={(e) => setCc(e.target.value)} aria-label="Store region">
            {REGIONS.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Checking libraries…" : "Find games"}
          </button>
        </div>
      </form>

      {error && <p className="notice error">{error}</p>}

      {result && (
        <section className="results">
          {result.mock && (
            <p className="notice">Demo mode: showing sample data. Try the profiles alice, bob, carol and dave.</p>
          )}

          <div className="players">
            {result.players.map((p) => (
              <a key={p.steamid} className={`player ${p.games ? "" : "private"}`} href={p.profileUrl} target="_blank" rel="noreferrer">
                <Avatar player={p} />
                <span>
                  {p.name}
                  <small>{p.games ? `${p.games.length} games` : "Private library"}</small>
                </span>
              </a>
            ))}
          </div>

          {result.errors.map((e) => (
            <p key={e.input} className="notice error">
              <strong>{e.input}</strong>: {e.message}
            </p>
          ))}
          {result.players.some((p) => !p.games) && (
            <p className="notice">
              Private libraries are skipped. Ask them to set <em>Game details</em> to Public under Steam &rarr; Profile
              &rarr; Edit Profile &rarr; Privacy Settings.
            </p>
          )}

          {visibleCount < 2 ? (
            <p className="empty">Need at least two public libraries to compare.</p>
          ) : (
            <>
              <div className="filters">
                {(["all", "coop", "pvp", "local"] as Mode[]).map((m) => (
                  <button key={m} type="button" className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                    {{ all: "All multiplayer", coop: "Co-op", pvp: "PvP", local: "Couch / local" }[m]}
                  </button>
                ))}
                {visibleCount > 2 && (
                  <label className="toggle">
                    <input type="checkbox" checked={showNearMisses} onChange={(e) => setShowNearMisses(e.target.checked)} />
                    Show games one person is missing
                  </label>
                )}
              </div>

              <h2>
                Everyone owns <span className="count">{everyone.length}</span>
              </h2>
              {everyone.length === 0 ? (
                <p className="empty">No shared multiplayer games with these filters.</p>
              ) : (
                <div className="grid">
                  {everyone.map((g) => (
                    <GameCard key={g.appid} game={g} playersById={playersById} />
                  ))}
                </div>
              )}

              {nearMisses.length > 0 && (
                <>
                  <h2>
                    One purchase away <span className="count">{nearMisses.length}</span>
                  </h2>
                  <div className="grid">
                    {nearMisses.map((g) => (
                      <GameCard key={g.appid} game={g} playersById={playersById} />
                    ))}
                  </div>
                </>
              )}
              {result.truncated && (
                <p className="notice">Huge libraries! Only the most-played shared games were checked.</p>
              )}
            </>
          )}
        </section>
      )}
    </>
  );
}

function GameCard({ game, playersById }: { game: MatchedGame; playersById: Map<string, Player> }) {
  const d = game.details;
  const total = Object.values(game.playtimeMinutes).reduce((a, b) => a + b, 0);
  const missing = game.missing.map((id) => playersById.get(id)?.name).filter(Boolean).join(", ");
  const tags = d
    ? ([
        d.modes.coop && "Co-op",
        d.modes.pvp && "PvP",
        d.modes.online && "Online",
        d.modes.local && "Local",
      ].filter(Boolean) as string[])
    : ["Store info unavailable"];

  return (
    <article className="card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="cover"
        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
        alt=""
        loading="lazy"
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      />
      <div className="body">
        <h3>{d?.name ?? game.name}</h3>
        <div className="tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="owners">
          {game.owners.map((id) => {
            const p = playersById.get(id);
            return p ? <Avatar key={id} player={p} size={24} /> : null;
          })}
          <small>{hours(total)} combined</small>
        </div>
        {game.missing.length > 0 && (
          <p className="missing">
            {missing} needs it ·{" "}
            {d?.isFree ? (
              <strong className="free">Free to play</strong>
            ) : d?.price ? (
              <>
                <strong>{d.price.formatted}</strong>
                {d.price.discountPercent > 0 && <span className="sale">-{d.price.discountPercent}%</span>}
              </>
            ) : (
              "price unknown"
            )}
          </p>
        )}
        <div className="actions">
          <a href={`steam://run/${game.appid}`}>Launch</a>
          <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noreferrer">
            Store page
          </a>
        </div>
      </div>
    </article>
  );
}
