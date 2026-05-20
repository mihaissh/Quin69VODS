/** Seconds before the last buffered comment when we start prefetching the next page. */
export const CHAT_PREFETCH_LEAD_SEC = 45;

/** Debounce before reloading the buffer at a new stream offset (scrub / segment jump). */
export const CHAT_BUFFER_REFETCH_DEBOUNCE_MS = 300;

/** How far the stream clock must move backward in one tick to treat it as a scrub (not noise). */
export const CHAT_BACKWARD_SCRUB_MIN_SEC = 1.5;

/** Default max lines in the replay pane (ring buffer). */
export const CHAT_MAX_SHOWN_DEFAULT = 200;

/** Allowed range for replay ring buffer clamp (logic + hook). */
export const CHAT_MAX_SHOWN_MIN = 50;
export const CHAT_MAX_SHOWN_MAX = 500;

export function clampChatMaxShown(n: number): number {
  const f = Math.floor(Number(n));
  if (!Number.isFinite(f)) return CHAT_MAX_SHOWN_DEFAULT;
  return Math.min(CHAT_MAX_SHOWN_MAX, Math.max(CHAT_MAX_SHOWN_MIN, f));
}

/**
 * Replay cadence — Twitch web ties VOD chat closely to playback time; sub‑250ms
 * keeps batches small without hammering React every frame.
 */
export const CHAT_TICK_MS = 100;
