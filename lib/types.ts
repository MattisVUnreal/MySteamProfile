export interface OwnedGame {
  appid: number;
  name: string;
  playtimeMinutes: number;
}

export interface Player {
  steamid: string;
  name: string;
  avatar: string;
  profileUrl: string;
  /** null when the profile or its game details are private */
  games: OwnedGame[] | null;
}

export interface GameModes {
  coop: boolean;
  pvp: boolean;
  online: boolean;
  local: boolean;
}

export interface Price {
  final: number;
  initial: number;
  discountPercent: number;
  formatted: string;
}

export interface AppDetails {
  name: string;
  isFree: boolean;
  multiplayer: boolean;
  modes: GameModes;
  price: Price | null;
}

export interface MatchedGame {
  appid: number;
  name: string;
  owners: string[];
  missing: string[];
  playtimeMinutes: Record<string, number>;
  /** null when the store page could not be loaded (e.g. delisted game) */
  details: AppDetails | null;
}

export interface ProfileError {
  input: string;
  message: string;
}

export interface MatchResult {
  players: Player[];
  errors: ProfileError[];
  games: MatchedGame[];
  /** true when more candidates existed than we looked up in the store */
  truncated: boolean;
  mock: boolean;
}
