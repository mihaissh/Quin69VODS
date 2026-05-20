// ── VOD / Archive types ───────────────────────────────────────────────────────

export interface VodChapter {
  name: string;
  image?: string;
  /** seconds from stream start */
  start: number;
  end: number;
  gameId?: string;
  duration?: string;
}

/**
 * A video clip attached to a VOD (game segment uploaded to YouTube, etc.)
 * The `youtube` and `drive` arrays on a Vod are always empty — actual video
 * content lives here.
 */
export interface VodGame {
  id: string;
  vodId: string;
  video_id: string;
  video_provider: string;
  thumbnail_url: string | null;
  /** seconds (stored as string by the API) */
  start_time: string;
  end_time: string;
  game_id?: string;
  game_name: string;
  title: string;
  chapter_image?: string;
  createdAt?: string;
}

export interface Vod {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  /** "HH:MM:SS" string */
  duration: string;
  thumbnail_url: string | null;
  stream_id?: string;
  platform?: string;
  chapters: VodChapter[];
  /** Always empty on this API — use `games` instead */
  youtube: unknown[];
  /** Always empty on this API — use `games` instead */
  drive: unknown[];
  /** The actual playable video segments */
  games: VodGame[];
  /** Newer adjacent streams (from single-VOD API). */
  prev?: VodNeighbor[];
  /** Older adjacent streams (from single-VOD API). */
  next?: VodNeighbor[];
}

/** Lightweight VOD row returned in prev/next navigation lists. */
export interface VodNeighbor {
  id: string;
  title: string;
  createdAt: string;
  duration: string;
  thumbnail_url: string | null;
}

export interface VodsResponse {
  data: Vod[];
  total: number;
  limit: number;
  skip: number;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatFragment {
  text?: string;
  /** null when no emote — API may use `id` or `emoteID` */
  emote?: { id?: string; emoteID?: string; type?: string } | null;
  emoticon?: { emoticon_id: string } | null;
  /** Twitch bits cheer fragment (Helix / GQL replay). */
  cheermote?: {
    bits?: number;
    prefix?: string;
    tier?: number;
  } | null;
  __typename?: string;
}

export interface UserBadge {
  id?: string;
  /** Some payloads use `_id` for the badge set (quin69VOD). */
  _id?: string;
  setID?: string;
  version?: string;
  __typename?: string;
}

export interface ChatComment {
  id: string;
  vod_id?: string;
  display_name: string;
  /** Twitch login when present (replay / Helix). */
  user_login?: string;
  user_name?: string;
  /** Stored as string by API — always parse with parseFloat/parseInt */
  content_offset_seconds: string | number;
  user_color?: string;
  user_badges?: UserBadge[];
  /** Fragment list, or raw string from some backends. */
  message: ChatFragment[] | string;
  /** Some Twitch-shaped payloads expose fragments at the root. */
  fragments?: ChatFragment[];
  /** Twitch `/me` (action) messages. */
  message_type?: string;
  comment_type?: string;
  is_action?: boolean;
  createdAt?: string;
}

export interface ChatResponse {
  comments: ChatComment[];
  cursor?: string;
}

// ── Badges from /v2/badges ────────────────────────────────────────────────────

export interface BadgeVersion {
  id: string;
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
  title?: string;
}
export interface BadgeSet {
  set_id: string;
  versions: BadgeVersion[];
}
export interface BadgesPayload {
  channel?: BadgeSet[];
  global?: BadgeSet[];
}

// ── Third-party emotes ────────────────────────────────────────────────────────

export interface Emote {
  id: string;
  code: string;
  url: string;
  source?: "bttv" | "ffz" | "7tv";
}

/** Raw emote object for CDN URLs (matches quin69VOD tri-map + EmoteRenderer pattern). */
export interface ThirdPartyEmote {
  id:   string;
  name: string;
  code: string;
  source: "bttv" | "ffz" | "7tv";
}

export interface EmotesMaps {
  "7tv": Map<string, ThirdPartyEmote>;
  bttv: Map<string, ThirdPartyEmote>;
  ffz:  Map<string, ThirdPartyEmote>;
}

// ── Filters ───────────────────────────────────────────────────────────────────

export type FilterType = "Default" | "Date" | "Title" | "Game";

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  title?: string;
  game?: string;
}
