"use client";

import { useRef, useCallback, useEffect } from "react";
import YouTube, { type YouTubeProps, type YouTubePlayer as YTPlayer } from "react-youtube";

interface YouTubePlayerProps {
  videoId: string;
  startSeconds?: number;
  /** When true, iframe fills parent height instead of 16:9 ratio */
  fillHeight?: boolean;
  onTimeUpdate?: (seconds: number) => void;
  onReady?: (player: YTPlayer) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export function YouTubePlayer({
  videoId,
  startSeconds = 0,
  fillHeight = false,
  onTimeUpdate,
  onReady,
  onPlay,
  onPause,
}: YouTubePlayerProps) {
  const playerRef  = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      try {
        const iframe = playerRef.current?.getIframe?.();
        if (iframe && document.body.contains(iframe)) {
          const t = playerRef.current?.getCurrentTime?.();
          if (typeof t === "number") onTimeUpdate?.(t);
        }
      } catch { /* not ready */ }
    }, 500);
  }, [onTimeUpdate]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      start: Math.floor(startSeconds),
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
    },
  };

  const player = (
    <YouTube
      videoId={videoId}
      opts={opts}
      onReady={(e) => { playerRef.current = e.target; onReady?.(e.target); }}
      onPlay={() => { startPolling(); onPlay?.(); }}
      onPause={() => { stopPolling(); onPause?.(); }}
      onEnd={stopPolling}
      style={{ width: "100%", height: "100%", display: "block" }}
      iframeClassName="w-full h-full block"
    />
  );

  if (fillHeight) {
    return (
      <div style={{ position: "absolute", inset: 0, background: "#000" }}>
        {player}
      </div>
    );
  }

  return (
    <div className="yt-iframe-wrapper">
      {player}
    </div>
  );
}
