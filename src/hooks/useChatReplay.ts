"use client";

/**
 * Chat replay orchestration
 * -------------------------
 * - **Pure rules** live in `@/lib/chatReplay/logic` (testable, no React).
 * - **Timing constants** in `@/lib/chatReplay/constants`.
 * - This hook wires the player clock (via refs, 1 Hz tick) to fetches and UI state.
 *
 * Why refs for `streamTime` / flags: the parent may update `currentTime` faster than 1 Hz;
 * the replay tick and buffer checks intentionally read the latest value without
 * re-subscribing effects to every clock tick.
 */

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import type SimpleBarCore from "simplebar-core";
import { fetchChatByOffset, fetchChatByCursor } from "@/lib/api";
import type { ChatComment } from "@/types/vod";
import {
  CHAT_BUFFER_REFETCH_DEBOUNCE_MS,
  CHAT_BACKWARD_SCRUB_MIN_SEC,
  CHAT_MAX_SHOWN_DEFAULT,
  CHAT_TICK_MS,
  clampChatMaxShown,
} from "@/lib/chatReplay/constants";
import {
  bufferContainsStreamTime,
  collectDueThroughTime,
  initialShownForStreamTime,
  shouldPrefetchNextPage,
} from "@/lib/chatReplay/logic";

/** Fixed ring-buffer size for replay (messages); no UI control. */
const CHAT_SHOWN_CAP = clampChatMaxShown(CHAT_MAX_SHOWN_DEFAULT);

export type ChatReplayStatus = "loading" | "ready" | "error";

export interface ChatReplayResult {
  shown:          ChatComment[];
  status:         ChatReplayStatus;
  simplebarRef:   React.RefObject<SimpleBarCore | null>;
  autoScroll:     boolean;
  setAutoScroll:  (v: boolean) => void;
  handleScroll:   (e: React.UIEvent<HTMLDivElement>) => void;
}

type LoadMode = "cold" | "warm";

export function useChatReplay(
  vodId: string,
  /** Absolute stream time in seconds (e.g. game segment start + player offset). */
  currentTime: number,
  isPlaying: boolean,
  chatDelaySec = 0,
): ChatReplayResult {
  const [comments, setComments]     = useState<ChatComment[]>([]);
  const [cursor, setCursor]         = useState<string | undefined>();
  const [shown, setShown]           = useState<ChatComment[]>([]);
  const [status, setStatus]         = useState<ChatReplayStatus>("loading");
  const [autoScroll, setAutoScroll] = useState(true);

  const simplebarRef = useRef<SimpleBarCore | null>(null);

  const stoppedIdx        = useRef(0);
  const tickerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTickTimeRef   = useRef(-1);
  const loadAbortRef         = useRef<AbortController | null>(null);
  const loadMoreInFlightRef  = useRef(false);
  const tickFnRef            = useRef<() => void>(() => {});

  const commentsRef   = useRef(comments);
  const cursorRef     = useRef(cursor);
  const isPlayingRef  = useRef(isPlaying);
  const streamTimeRef = useRef(currentTime + chatDelaySec);
  const statusRef     = useRef<ChatReplayStatus>(status);
  const vodIdRef      = useRef(vodId);

  useLayoutEffect(() => {
    commentsRef.current   = comments;
    cursorRef.current     = cursor;
    isPlayingRef.current  = isPlaying;
    streamTimeRef.current = currentTime + chatDelaySec;
    statusRef.current     = status;
    vodIdRef.current      = vodId;
  });

  const clearRefetchTimeout = useCallback(() => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
      refetchTimeoutRef.current = null;
    }
  }, []);

  const loadAt = useCallback(
    async (offsetSeconds: number, mode: LoadMode = "cold") => {
      const warm = mode === "warm";
      loadAbortRef.current?.abort();
      const ctrl = new AbortController();
      loadAbortRef.current = ctrl;

      if (!warm) {
        if (tickerRef.current) {
          clearInterval(tickerRef.current);
          tickerRef.current = null;
        }
        clearRefetchTimeout();
        setStatus("loading");
        commentsRef.current = [];
        cursorRef.current   = undefined;
        setComments([]);
        setShown([]);
        stoppedIdx.current      = 0;
        prevTickTimeRef.current = -1;
      } else {
        clearRefetchTimeout();
      }

      try {
        const data = await fetchChatByOffset(vodId, offsetSeconds, ctrl.signal);
        if (ctrl.signal.aborted) return;

        const list = data.comments ?? [];
        commentsRef.current = list;
        cursorRef.current   = data.cursor;
        setComments(list);
        setCursor(data.cursor);

        const t = streamTimeRef.current;
        const { stopIndex, shown: nextShown } = initialShownForStreamTime(
          list,
          t,
          CHAT_SHOWN_CAP,
        );
        stoppedIdx.current = stopIndex;
        setShown(nextShown);
        prevTickTimeRef.current = streamTimeRef.current;

        setStatus("ready");
      } catch {
        if (ctrl.signal.aborted) return;
        if (!warm) setStatus("error");
      }
    },
    [vodId, clearRefetchTimeout],
  );

  const loadMore = useCallback(async () => {
    const cur = cursorRef.current;
    if (!cur || loadMoreInFlightRef.current) return;

    const vodAtStart = vodIdRef.current;
    loadMoreInFlightRef.current = true;

    try {
      const data = await fetchChatByCursor(vodId, cur);
      if (vodAtStart !== vodIdRef.current) return;

      const incoming = data.comments ?? [];
      const existingIds = new Set(commentsRef.current.map((x) => x.id));
      const fresh = incoming.filter((c) => !existingIds.has(c.id));

      const beforeLen = commentsRef.current.length;
      const prevCursorSnapshot = cur;

      if (data.cursor !== undefined) {
        cursorRef.current = data.cursor;
        setCursor(data.cursor);
      }

      if (fresh.length > 0) {
        const next = [...commentsRef.current, ...fresh];
        commentsRef.current = next;
        setComments(next);
      }

      const cursorAdvanced =
        data.cursor !== undefined && data.cursor !== prevCursorSnapshot;
      const appended = commentsRef.current.length > beforeLen;
      const canChain = appended || cursorAdvanced;

      if (canChain) {
        queueMicrotask(() => {
          if (vodAtStart !== vodIdRef.current || statusRef.current !== "ready") return;
          if (!cursorRef.current) return;
          const list = commentsRef.current;
          const t = streamTimeRef.current;
          if (shouldPrefetchNextPage(list, t)) void loadMore();
        });
      }
    } catch {
      /* non-fatal — user keeps current buffer */
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [vodId]);

  /** Cold bootstrap: align first fetch with current stream clock (not offset 0). */
  useEffect(() => {
    const offset = Math.max(0, Math.floor(streamTimeRef.current));
    void loadAt(offset, "cold");
    return () => {
      loadAbortRef.current?.abort();
    };
  }, [vodId, loadAt]);

  const scheduleRefetchIfOutsideBuffer = useCallback(() => {
    if (statusRef.current !== "ready") return;
    const t    = streamTimeRef.current;
    const list = commentsRef.current;
    if (!list.length) return;

    if (bufferContainsStreamTime(list, t)) {
      clearRefetchTimeout();
      return;
    }
    if (refetchTimeoutRef.current) return;
    refetchTimeoutRef.current = setTimeout(() => {
      refetchTimeoutRef.current = null;
      void loadAt(Math.max(0, Math.floor(streamTimeRef.current)), "warm");
    }, CHAT_BUFFER_REFETCH_DEBOUNCE_MS);
  }, [loadAt, clearRefetchTimeout]);

  useEffect(() => {
    if (!isPlaying || status !== "ready") return;
    scheduleRefetchIfOutsideBuffer();
  }, [isPlaying, status, vodId, comments.length, chatDelaySec, scheduleRefetchIfOutsideBuffer]);

  const tick = useCallback(() => {
    if (!isPlayingRef.current || statusRef.current !== "ready") return;
    const list = commentsRef.current;
    if (!list.length) return;

    const t = streamTimeRef.current;

    if (!bufferContainsStreamTime(list, t)) {
      scheduleRefetchIfOutsideBuffer();
      return;
    }
    clearRefetchTimeout();

    const prev = prevTickTimeRef.current;
    if (prev >= 0 && t < prev - CHAT_BACKWARD_SCRUB_MIN_SEC) {
      const { stopIndex, shown: nextShown } = initialShownForStreamTime(
        list,
        t,
        CHAT_SHOWN_CAP,
      );
      stoppedIdx.current = stopIndex;
      setShown(nextShown);
      prevTickTimeRef.current = t;
      return;
    }
    prevTickTimeRef.current = t;

    const { nextIndex, slice } = collectDueThroughTime(list, stoppedIdx.current, t);
    if (nextIndex <= stoppedIdx.current) return;

    stoppedIdx.current = nextIndex;
    setShown((prev) => {
      const next = [...prev, ...slice];
      return next.length > CHAT_SHOWN_CAP ? next.slice(next.length - CHAT_SHOWN_CAP) : next;
    });

    if (shouldPrefetchNextPage(list, t)) void loadMore();
  }, [loadMore, scheduleRefetchIfOutsideBuffer, clearRefetchTimeout]);

  useLayoutEffect(() => {
    tickFnRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (isPlaying && status === "ready") {
      if (!tickerRef.current) {
        tickFnRef.current();
        tickerRef.current = setInterval(() => tickFnRef.current(), CHAT_TICK_MS);
      }
    } else if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };
  }, [isPlaying, status]);

  useEffect(() => {
    if (!autoScroll) return;
    const el = simplebarRef.current?.getScrollElement?.();
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, autoScroll]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  }

  return { shown, status, simplebarRef, autoScroll, setAutoScroll, handleScroll };
}
