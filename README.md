# Play Together

Paste your friends' Steam profiles and instantly see every **multiplayer game you all own**, plus the ones
that are just **one purchase away** (with the current price and sale discount, or "Free to play").

- Accepts profile URLs (`/id/name` or `/profiles/7656…`), SteamID64s or custom URL names
- Filter by Co-op, PvP or Couch/local
- Shareable links: searches are saved in the URL (`?p=alice,bob,carol`)
- One-click **Launch** (opens Steam) and store links
- Private libraries are detected and explained instead of silently failing

## Get your own link (about 2 minutes, once)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMattisVUnreal%2FMySteamProfile&project-name=play-together&repository-name=play-together&env=STEAM_API_KEY&envDescription=Your%20free%20Steam%20Web%20API%20key&envLink=https%3A%2F%2Fsteamcommunity.com%2Fdev%2Fapikey)

1. Click the **Deploy** button above and sign in with GitHub. Vercel's free plan is enough.
2. When it asks for `STEAM_API_KEY`, paste your Steam key. Don't have one? Get it free at
   <https://steamcommunity.com/dev/apikey> (any domain name works, e.g. `localhost`).
3. Click **Deploy** and wait about a minute. You get a link like `play-together.vercel.app`.

That's it. Open the link on any phone or PC and send it to your friends. Nobody else needs to install anything
or have a key. Your key stays secret on the server.

**Using it:** paste Steam profile links (one per line), click **Find games**, then copy the page address to share
the result. Everyone needs **Game details** set to Public in Steam (Profile → Edit Profile → Privacy Settings).

## For developers

Built with Next.js (App Router) and TypeScript. Your Steam API key stays on the server.

### Running locally

```bash
npm install
cp .env.example .env.local   # then put your key in STEAM_API_KEY
npm run dev                  # http://localhost:3000
```

Get a key at <https://steamcommunity.com/dev/apikey>. Never commit `.env.local`.

**No key?** Set `STEAM_MOCK=1` in `.env.local` to use sample data (profiles `alice`, `bob`, `carol`, `dave`).

### Deploying

Works on Vercel out of the box: import the repo, add `STEAM_API_KEY` as an environment variable, deploy.

### Notes

- Everyone's Steam profile must have **Game details** set to Public (Profile → Edit Profile → Privacy Settings).
- The Steam store API is rate-limited (~200 requests / 5 min). Store lookups are cached for 24h and capped at
  120 games per search, most-played first.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |
