export type ProfileRef =
  | { kind: "id"; steamid: string }
  | { kind: "vanity"; name: string };

const STEAMID64 = /^7656119\d{10}$/;

/**
 * Accepts a SteamID64, a profile URL (/profiles/<id> or /id/<name>),
 * or a bare custom URL name.
 */
export function parseProfileInput(raw: string): ProfileRef | null {
  const input = raw.trim().replace(/\/+$/, "");
  if (!input) return null;
  if (STEAMID64.test(input)) return { kind: "id", steamid: input };

  const url = input.match(/steamcommunity\.com\/(profiles|id)\/([^/?#]+)/i);
  if (url) {
    const [, type, value] = url;
    if (type.toLowerCase() === "profiles") {
      return STEAMID64.test(value) ? { kind: "id", steamid: value } : null;
    }
    return { kind: "vanity", name: decodeURIComponent(value) };
  }

  if (/^[A-Za-z0-9_-]{2,32}$/.test(input)) return { kind: "vanity", name: input };
  return null;
}
