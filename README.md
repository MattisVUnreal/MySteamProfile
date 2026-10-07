# Play Together

Paste your friends' Steam profiles and instantly see every **multiplayer game you all own**, plus the ones
that are just **one purchase away** (with the current price and sale discount, or "Free to play").

- Accepts profile URLs (`/id/name` or `/profiles/7656…`), SteamID64s or custom URL names
- Filter by Co-op, PvP or Couch/local
- Shareable links: searches are saved in the URL (`?p=alice,bob,carol`)
- One-click **Launch** (opens Steam) and store links
- Private libraries are detected and explained instead of silently failing

Built with Next.js (App Router) and TypeScript. Your Steam API key stays on the server.

## Running locally

```bash
npm install
cp .env.example .env.local   # then put your key in STEAM_API_KEY
npm run dev                  # http://localhost:3000
```

Get a key at <https://steamcommunity.com/dev/apikey>. Never commit `.env.local`.

**No key?** Set `STEAM_MOCK=1` in `.env.local` to use sample data (profiles `alice`, `bob`, `carol`, `dave`).

## Deploying

Works on Vercel out of the box: import the repo, add `STEAM_API_KEY` as an environment variable, deploy.

## Notes

- Everyone's Steam profile must have **Game details** set to Public (Profile → Edit Profile → Privacy Settings).
- The Steam store API is rate-limited (~200 requests / 5 min). Store lookups are cached for 24h and capped at
  120 games per search, most-played first.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |
