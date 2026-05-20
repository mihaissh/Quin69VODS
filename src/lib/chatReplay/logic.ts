import type { ChatComment } from "@/types/vod";
import { CHAT_MAX_SHOWN_DEFAULT, CHAT_PREFETCH_LEAD_SEC } from "./constants";

/** Normalised stream offset for one comment (API may return string or number). */
export function commentStreamOffsetSeconds(c: ChatComment): number {
  return parseFloat(String(c.content_offset_seconds));
}

/**
 * Whether the loaded comment page still brackets `streamTimeSec`.
 * Twitch-style VOD chat pages are sequential; we allow `tailSlackSec` past the
 * last comment so playback can advance slightly before the next cursor fetch.
 */
export function bufferContainsStreamTime(
  comments: ReadonlyArray<ChatComment>,
  streamTimeSec: number,
  tailSlackSec: number = CHAT_PREFETCH_LEAD_SEC,
): boolean {
  if (comments.length === 0) return false;
  const first = commentStreamOffsetSeconds(comments[0]);
  const last  = commentStreamOffsetSeconds(comments[comments.length - 1]);
  return streamTimeSec - last <= tailSlackSec && streamTimeSec >= first;
}

/**
 * After a fresh buffer load, compute how many comments are at or before `streamTimeSec`
 * and what should be visible (capped).
 */
export function initialShownForStreamTime(
  comments: ReadonlyArray<ChatComment>,
  streamTimeSec: number,
  maxShown = CHAT_MAX_SHOWN_DEFAULT,
): { stopIndex: number; shown: ChatComment[] } {
  let i = 0;
  while (i < comments.length && commentStreamOffsetSeconds(comments[i]) <= streamTimeSec) {
    i++;
  }
  const shown = i ? comments.slice(0, i).slice(-maxShown) : [];
  return { stopIndex: i, shown };
}

/**
 * Indices `[fromIndex, nextIndex)` are due through `streamTimeSec` (exclusive upper bound).
 */
export function collectDueThroughTime(
  comments: ReadonlyArray<ChatComment>,
  fromIndex: number,
  streamTimeSec: number,
): { nextIndex: number; slice: ChatComment[] } {
  let j = fromIndex;
  while (j < comments.length && commentStreamOffsetSeconds(comments[j]) <= streamTimeSec) {
    j++;
  }
  return { nextIndex: j, slice: comments.slice(fromIndex, j) };
}

/** True when we should request the next page via cursor (near end of buffer). */
export function shouldPrefetchNextPage(
  comments: ReadonlyArray<ChatComment>,
  streamTimeSec: number,
  leadSec: number = CHAT_PREFETCH_LEAD_SEC,
): boolean {
  if (comments.length === 0) return false;
  const last = commentStreamOffsetSeconds(comments[comments.length - 1]);
  return streamTimeSec > last - leadSec;
}
