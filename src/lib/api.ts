import type {
  Vod,
  VodGame,
  VodNeighbor,
  VodsResponse,
  ChatResponse,
  BadgesPayload,
  Emote,
  FilterType,
  FilterOptions,
} from "@/types/vod";
import { toHMS } from "@/lib/utils";

const CHANNEL = (process.env.NEXT_PUBLIC_CHANNEL ?? "quin69").toLowerCase();
const VODS_API_BASE =
  process.env.NEXT_PUBLIC_VODS_API_BASE ??
  `https://archive.overpowered.tv/api/v1/${CHANNEL}`;
const LIMIT = 18;

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  meta?: { page?: number; limit?: number; total?: number };
  message?: string;
}

interface RawVodGame {
  id: number | string;
  start?: number;
  end?: number;
  start_time?: string;
  end_time?: string;
  video_provider: string;
  video_id: string;
  thumbnail_url: string | null;
  game_id?: string;
  game_name: string;
  title: string;
  chapter_image?: string;
}

interface RawVod {
  id: number | string;
  platform_vod_id?: string;
  title: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  duration: number | string;
  platform_stream_id?: string;
  stream_id?: string;
  platform?: string;
  chapters?: Vod["chapters"];
  games?: RawVodGame[];
  youtube?: unknown[];
  drive?: unknown[];
  thumbnail_url?: string | null;
  prev?: RawVodNeighbor[];
  next?: RawVodNeighbor[];
}

interface RawVodNeighbor {
  id: number | string;
  platform_vod_id?: string;
  title: string;
  created_at?: string;
  duration: number | string;
  thumbnail_url?: string | null;
}

function normalizeNeighbor(raw: RawVodNeighbor): VodNeighbor {
  return {
    id: String(raw.platform_vod_id ?? raw.id),
    title: raw.title,
    createdAt: raw.created_at ?? "",
    duration: typeof raw.duration === "number" ? toHMS(raw.duration) : String(raw.duration),
    thumbnail_url: raw.thumbnail_url ?? null,
  };
}

function normalizeGame(raw: RawVodGame, vodId: string): VodGame {
  return {
    id: String(raw.id),
    vodId,
    video_id: raw.video_id,
    video_provider: raw.video_provider,
    thumbnail_url: raw.thumbnail_url,
    start_time: raw.start_time ?? String(raw.start ?? 0),
    end_time: raw.end_time ?? String(raw.end ?? 0),
    game_id: raw.game_id,
    game_name: raw.game_name,
    title: raw.title,
    chapter_image: raw.chapter_image,
  };
}

function normalizeVod(raw: RawVod): Vod {
  const id = String(raw.platform_vod_id ?? raw.id);

  return {
    id,
    title: raw.title,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    updatedAt: raw.updated_at ?? raw.updatedAt,
    duration: typeof raw.duration === "number" ? toHMS(raw.duration) : raw.duration,
    thumbnail_url: raw.thumbnail_url ?? null,
    stream_id: raw.platform_stream_id ?? raw.stream_id,
    platform: raw.platform,
    chapters: raw.chapters ?? [],
    youtube: raw.youtube ?? [],
    drive: raw.drive ?? [],
    games: (raw.games ?? []).map((game) => normalizeGame(game, id)),
    prev: raw.prev?.map(normalizeNeighbor),
    next: raw.next?.map(normalizeNeighbor),
  };
}

async function readApiEnvelope<T>(res: Response, fallbackMessage: string): Promise<T> {
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.success === false) {
    throw new Error(json.message ?? `${fallbackMessage}: ${res.statusText}`);
  }
  return json.data as T;
}

// ── VOD list ──────────────────────────────────────────────────────────────────

interface FetchVodsParams {
  filter: FilterType;
  filterOptions: FilterOptions;
  page: number;
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchVods({
  filter,
  filterOptions,
  page,
  limit = LIMIT,
  signal,
}: FetchVodsParams): Promise<VodsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: "created_at",
    order: "desc",
  });

  if (filter === "Date" && filterOptions.startDate && filterOptions.endDate) {
    params.set("from", filterOptions.startDate.toISOString());
    params.set("to", filterOptions.endDate.toISOString());
  } else if (filter === "Title" && filterOptions.title?.trim()) {
    params.set("title", filterOptions.title.trim());
  } else if (filter === "Game" && filterOptions.game?.trim()) {
    params.set("game_name", filterOptions.game.trim());
  }

  const res = await fetch(`${VODS_API_BASE}/vods?${params.toString()}`, { signal });
  const json = (await res.json()) as ApiEnvelope<RawVod[]>;
  if (!res.ok || json.success === false) {
    throw new Error(json.message ?? `Failed to fetch VODs: ${res.statusText}`);
  }

  const data = (json.data ?? []).map(normalizeVod);
  const meta = json.meta ?? {};

  return {
    data,
    total: meta.total ?? data.length,
    limit: meta.limit ?? limit,
    skip: ((meta.page ?? page) - 1) * (meta.limit ?? limit),
  };
}

// ── Single VOD ────────────────────────────────────────────────────────────────

export async function fetchVod(vodId: string): Promise<Vod> {
  const res = await fetch(`${VODS_API_BASE}/vods/${vodId}`);
  const raw = await readApiEnvelope<RawVod>(res, "Failed to fetch VOD");
  return normalizeVod(raw);
}

// ── Chat ──────────────────────────────────────────────────────────────────────
// The endpoint uses `cursor` (not `_next`) in its response.

export async function fetchChatByOffset(
  vodId: string,
  offsetSeconds: number,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const res = await fetch(
    `${VODS_API_BASE}/vods/${vodId}/comments?content_offset_seconds=${Math.max(0, Math.floor(offsetSeconds))}`,
    { signal },
  );
  const data = await readApiEnvelope<{ comments?: ChatResponse["comments"]; cursor?: string }>(
    res,
    "Chat fetch failed",
  );
  return {
    comments: data.comments ?? [],
    cursor: data.cursor,
  };
}

export async function fetchChatByCursor(
  vodId: string,
  cursor: string
): Promise<ChatResponse> {
  const res = await fetch(`${VODS_API_BASE}/vods/${vodId}/comments?cursor=${encodeURIComponent(cursor)}`);
  const data = await readApiEnvelope<{ comments?: ChatResponse["comments"]; cursor?: string }>(
    res,
    "Chat fetch failed",
  );
  return {
    comments: data.comments ?? [],
    cursor: data.cursor,
  };
}

// ── Badges — /v2/badges ───────────────────────────────────────────────────────

export async function fetchBadges(): Promise<BadgesPayload | null> {
  try {
    const res = await fetch(`${VODS_API_BASE}/v2/badges`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data as BadgesPayload;
  } catch {
    return null;
  }
}

// ── VOD emotes — /emotes?vod_id= ─────────────────────────────────────────────

export async function fetchVodEmotes(vodId: string): Promise<{
  ffz_emotes: RawFFZEmote[];
  bttv_emotes: RawBTTVEmote[];
  "7tv_emotes": RawSevenTVEmote[];
} | null> {
  try {
    const res = await fetch(`${VODS_API_BASE}/emotes?vod_id=${vodId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data?.length) return null;
    return json.data[0];
  } catch {
    return null;
  }
}

// ── Third-party emote APIs ────────────────────────────────────────────────────

interface RawBTTVEmote { id: string; code: string }
interface RawFFZEmote {
  id?: number | string;
  name: string;
  urls: Record<string, string>;
}
interface RawSevenTVEmote {
  id?: string;
  name?: string;
  code?: string;
  data?: { host?: { url?: string } };
}

export async function fetchBTTVGlobal(): Promise<Emote[]> {
  try {
    const res = await fetch("https://api.betterttv.net/3/cached/emotes/global");
    if (!res.ok) return [];
    const data: RawBTTVEmote[] = await res.json();
    return data.map((e) => ({
      id: e.id,
      code: e.code,
      url: `https://cdn.betterttv.net/emote/${e.id}/2x`,
      source: "bttv" as const,
    }));
  } catch { return []; }
}

export async function fetchBTTVChannel(twitchId: string): Promise<Emote[]> {
  try {
    const res = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${twitchId}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.status >= 400) return [];
    const all: RawBTTVEmote[] = [
      ...(data.channelEmotes ?? []),
      ...(data.sharedEmotes ?? []),
    ];
    return all.map((e) => ({
      id: e.id,
      code: e.code,
      url: `https://cdn.betterttv.net/emote/${e.id}/2x`,
      source: "bttv" as const,
    }));
  } catch { return []; }
}

export async function fetchFFZChannel(twitchId: string): Promise<Emote[]> {
  try {
    const res = await fetch(`https://api.frankerfacez.com/v1/room/id/${twitchId}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.status >= 400) return [];
    const setId = data?.room?.set;
    const emoticons: RawFFZEmote[] = setId ? (data.sets?.[setId]?.emoticons ?? []) : [];
    return emoticons.map((e) => ({
      id: String(e.id ?? e.name),
      code: e.name,
      url: e.urls["2"] ?? e.urls["1"] ?? "",
      source: "ffz" as const,
    }));
  } catch { return []; }
}

export async function fetchSevenTVChannel(twitchId: string): Promise<Emote[]> {
  try {
    const res = await fetch(`https://7tv.io/v3/users/twitch/${twitchId}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.status_code >= 400) return [];
    const emotes: RawSevenTVEmote[] = data?.emote_set?.emotes ?? [];
    return emotes.map((e) => ({
      id: e.id ?? "",
      code: e.name ?? e.code ?? "",
      url: e.id ? `https://cdn.7tv.app/emote/${e.id}/2x.webp` : `https:${e.data?.host?.url ?? ""}/2x.webp`,
      source: "7tv" as const,
    }));
  } catch { return []; }
}

export async function fetchSevenTVGlobal(): Promise<Emote[]> {
  try {
    const res = await fetch("https://7tv.io/v3/emote-sets/global");
    if (!res.ok) return [];
    const data = await res.json();
    const emotes: RawSevenTVEmote[] = data?.emotes ?? [];
    return emotes.map((e) => ({
      id: e.id ?? "",
      code: e.name ?? e.code ?? "",
      url: e.id ? `https://cdn.7tv.app/emote/${e.id}/2x.webp` : `https:${e.data?.host?.url ?? ""}/2x.webp`,
      source: "7tv" as const,
    }));
  } catch { return []; }
}
