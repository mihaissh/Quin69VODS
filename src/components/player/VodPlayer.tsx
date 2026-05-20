"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { YouTubePlayer } from "./YouTubePlayer";
import { ChatPanel } from "./ChatPanel";
import { VodSegmentPlaylist } from "./VodSegmentPlaylist";
import { toHMS, formatDate, formatDuration, chapterColor } from "@/lib/utils";
import type { Vod, VodChapter, VodGame } from "@/types/vod";
import type { YouTubePlayer as YTPlayer } from "react-youtube";

type Layout = "side" | "theater" | "video-only";

interface VodPlayerProps {
  vod: Vod;
  initialTimestamp?: number;
  initialGameIdx?: number;
}

const FLOAT_W = 320; // floating chat panel width

// ── Draggable hook ────────────────────────────────────────────────────────────

type DragBounds = () => { maxX: number; maxY: number };

function useDraggable(initialX: number, initialY: number, getBounds: DragBounds) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const drag = useRef({ active: false, ox: 0, oy: 0, sx: 0, sy: 0 });
  const getBoundsRef = useRef(getBounds);

  useEffect(() => {
    getBoundsRef.current = getBounds;
  }, [getBounds]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    drag.current = { active: true, ox: pos.x, oy: pos.y, sx: e.clientX, sy: e.clientY };
    e.preventDefault();
  }, [pos]);

  const clamp = useCallback((x: number, y: number) => {
    const { maxX, maxY } = getBoundsRef.current();
    return {
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y)),
    };
  }, []);

  const nudge = useCallback((dx: number, dy: number) => {
    setPos((p) => clamp(p.x + dx, p.y + dy));
  }, [clamp]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const nx = drag.current.ox + e.clientX - drag.current.sx;
      const ny = drag.current.oy + e.clientY - drag.current.sy;
      setPos(clamp(nx, ny));
    };
    const onUp = () => { drag.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [clamp]);

  return { pos, onMouseDown, nudge };
}

// ── Vertical resize hook ──────────────────────────────────────────────────────

function useResizableHeight(initialH: number, min = 180, max = 900) {
  const [height, setHeight] = useState(initialH);
  const resize = useRef({ active: false, startY: 0, startH: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    resize.current = { active: true, startY: e.clientY, startH: height };
    e.preventDefault();
    e.stopPropagation();
  }, [height]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resize.current.active) return;
      setHeight(Math.max(min, Math.min(max, resize.current.startH + e.clientY - resize.current.startY)));
    };
    const onUp = () => { resize.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [min, max]);

  return { height, onMouseDown };
}

// ── VodPlayer ─────────────────────────────────────────────────────────────────

export function VodPlayer({ vod, initialTimestamp = 0, initialGameIdx = 0 }: VodPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [activeGame, setActiveGame]   = useState(initialGameIdx);
  const [layout, setLayout]           = useState<Layout>("side");
  const [copied, setCopied]           = useState(false);
  const [playlistVisible, setPlaylistVisible] = useState(true);
  const playerRef = useRef<YTPlayer | null>(null);

  const floatingResize = useResizableHeight(460);

  const floatingBounds = useCallback(() => {
    if (typeof window === "undefined") return { maxX: 0, maxY: 0 };
    return {
      maxX: Math.max(0, window.innerWidth - FLOAT_W - 8),
      maxY: Math.max(0, window.innerHeight - floatingResize.height - 8),
    };
  }, [floatingResize.height]);

  const floatingChat = useDraggable(
    typeof window !== "undefined" ? Math.max(0, window.innerWidth - FLOAT_W - 12) : 900,
    80,
    floatingBounds,
  );

  const games: VodGame[]  = vod.games ?? [];
  const currentGameData   = games[activeGame];
  const gameStartSec       = useMemo(() => parseFloat(currentGameData?.start_time ?? "0"), [currentGameData]);
  const globalTime         = gameStartSec + currentTime;

  /** Passed to YouTubePlayer as `startSeconds` on remount (`key` includes `activeGame`). */
  const [segmentStartSeconds, setSegmentStartSeconds] = useState(initialTimestamp);

  const activeChapter: VodChapter | null = useMemo(() => {
    if (!vod.chapters?.length) return null;
    return [...vod.chapters].reverse().find((ch) => ch.start <= globalTime) ?? null;
  }, [vod.chapters, globalTime]);

  const activeChapterIdx = useMemo(
    () => vod.chapters?.findIndex((c) => c.start === activeChapter?.start && c.name === activeChapter?.name) ?? 0,
    [vod.chapters, activeChapter]
  );

  function copyTimestamp() {
    const url = new URL(window.location.href);
    url.searchParams.set("t", String(Math.floor(globalTime)));
    url.searchParams.set("seg", String(activeGame));
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function selectGame(index: number) {
    if (index === activeGame) return;
    setActiveGame(index);
    setSegmentStartSeconds(0);
    setCurrentTime(0);
  }

  const chatVisible = layout !== "video-only";
  const theaterMode = layout === "theater";

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100%", background: "var(--color-bg-base)" }}
    >
      {/* ── Top bar ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{
          height: 44,
          background: "var(--color-bg-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Link href="/"
          className="flex items-center gap-1 text-xs opacity-50 hover:opacity-90 transition-opacity"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4" />
          Archive
        </Link>
        <span style={{ color: "var(--color-border-strong)" }}>/</span>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold truncate block"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
            title={vod.title}
          >
            {vod.title || `VOD ${vod.id}`}
          </span>
        </div>

        {activeChapter && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs flex-shrink-0"
            style={{
              borderLeft: `2px solid ${chapterColor(activeChapterIdx)}`,
              paddingLeft: 6,
              background: "var(--color-bg-elevated)",
              color: "var(--color-text-secondary)",
            }}
          >
            {activeChapter.name}
          </span>
        )}

        <div className="hidden md:flex items-center gap-3 text-xs flex-shrink-0"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
        >
          <span>{formatDate(vod.createdAt)}</span>
          {vod.duration && <span>{formatDuration(vod.duration)}</span>}
        </div>

        <button onClick={copyTimestamp}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
          style={{
            color: copied ? "var(--color-amber)" : "var(--color-text-muted)",
            background: copied ? "var(--color-amber-dim)" : "transparent",
          }}
          title="Copy link to this moment"
        >
          <Icon icon={copied ? "mdi:check" : "mdi:link-variant"} className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono" style={{ fontSize: "0.7rem" }}>
            {copied ? "copied!" : toHMS(globalTime)}
          </span>
        </button>

        {(games.length > 0 || (vod.prev?.length ?? 0) > 0 || (vod.next?.length ?? 0) > 0) && (
          <button
            type="button"
            onClick={() => setPlaylistVisible((v) => !v)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
            style={{
              color: playlistVisible ? "var(--color-amber)" : "var(--color-text-muted)",
              background: playlistVisible ? "var(--color-amber-dim)" : "transparent",
            }}
            title={playlistVisible ? "Hide video playlist" : "Show video playlist"}
            aria-expanded={playlistVisible}
          >
            <Icon icon="mdi:playlist-play" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline" style={{ fontSize: "0.7rem" }}>
              {playlistVisible ? "Hide videos" : "Show videos"}
            </span>
          </button>
        )}

        {/* Layout switcher */}
        <div className="flex rounded overflow-hidden flex-shrink-0"
          style={{ border: "1px solid var(--color-border)" }}
        >
          {([
            { id: "side",       icon: "mdi:dock-right",          title: "Side by side" },
            { id: "theater",    icon: "mdi:overscan",            title: "Theater (floating chat)" },
            { id: "video-only", icon: "mdi:chat-remove-outline", title: "Video only" },
          ] as const).map((b) => (
            <button key={b.id} onClick={() => setLayout(b.id)}
              className="w-7 h-7 flex items-center justify-center transition-colors"
              style={{
                background: layout === b.id ? "var(--color-amber)" : "var(--color-bg-elevated)",
                color: layout === b.id ? "#111110" : "var(--color-text-muted)",
              }}
              title={b.title}
            >
              <Icon icon={b.icon} className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Video column ──────────────────────────────── */}
        <div
          className="flex flex-col min-w-0 flex-1 overflow-hidden"
          style={{ background: "var(--color-bg-base)" }}
        >
          {/* Player — fills all available height */}
          <div className="flex-1 min-h-0 relative" style={{ background: "#000" }}>
            {currentGameData?.video_id ? (
              <YouTubePlayer
                key={`${currentGameData.video_id}-${activeGame}`}
                videoId={currentGameData.video_id}
                fillHeight
                startSeconds={segmentStartSeconds}
                onTimeUpdate={setCurrentTime}
                onReady={(p) => { playerRef.current = p; }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: "var(--color-bg-elevated)" }}
              >
                <div className="text-center">
                  <Icon icon="mdi:youtube" className="w-10 h-10 mb-2 mx-auto"
                    style={{ color: "var(--color-text-disabled)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {games.length === 0 ? "No video uploaded yet" : "No video for this part"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <VodSegmentPlaylist
            games={games}
            prevVods={vod.prev}
            nextVods={vod.next}
            activeIndex={activeGame}
            onSelect={selectGame}
            visible={playlistVisible}
            onVisibleChange={setPlaylistVisible}
          />
        </div>

        {/* ── Side chat ─────────────────────────────────── */}
        {chatVisible && !theaterMode && (
          <div
            className="flex-shrink-0 flex flex-col border-l overflow-hidden"
            style={{ width: 300, borderColor: "var(--color-border)" }}
          >
            <ChatPanel vodId={vod.id} currentTime={globalTime} isPlaying={isPlaying} />
          </div>
        )}
      </div>

      {/* ── Floating draggable chat (theater mode) ─────── */}
      {theaterMode && chatVisible && (
        <div
          className="fixed z-50 flex flex-col rounded-lg"
          role="complementary"
          aria-label="Floating chat replay"
          style={{
            left: floatingChat.pos.x,
            top: floatingChat.pos.y,
            width: FLOAT_W,
            height: floatingResize.height,
            background: "rgba(17,17,16,0.95)",
            border: "1px solid var(--color-border)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 flex-shrink-0"
            style={{
              background: "var(--color-bg-elevated)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              role="group"
              tabIndex={0}
              aria-label="Move chat window. Use arrow keys or drag with the pointer."
              className="flex min-w-0 flex-1 cursor-grab select-none items-center gap-2 rounded px-1 py-0.5 active:cursor-grabbing"
              onMouseDown={floatingChat.onMouseDown}
              onKeyDown={(e) => {
                const step = 24;
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  floatingChat.nudge(-step, 0);
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  floatingChat.nudge(step, 0);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  floatingChat.nudge(0, -step);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  floatingChat.nudge(0, step);
                }
              }}
            >
              <Icon icon="mdi:drag" className="h-4 w-4 shrink-0" style={{ color: "var(--color-text-muted)" }} aria-hidden />
              <span className="text-xs font-semibold truncate" style={{ color: "var(--color-text-secondary)" }}>
                Chat Replay
              </span>
            </div>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setLayout("side")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100"
              style={{ color: "var(--color-text-muted)" }}
              title="Dock to side"
              aria-label="Dock chat to side panel"
            >
              <Icon icon="mdi:close" className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1" style={{ overflow: "hidden" }}>
            <ChatPanel vodId={vod.id} currentTime={globalTime} isPlaying={isPlaying} />
          </div>

          <div
            onMouseDown={floatingResize.onMouseDown}
            className="flex h-2.5 shrink-0 cursor-ns-resize items-center justify-center"
            style={{
              background: "var(--color-bg-elevated)",
              borderTop: "1px solid var(--color-border)",
            }}
            title="Drag to resize height"
            aria-label="Resize chat height, drag vertically"
          >
            <div style={{ width: 32, height: 3, borderRadius: 99, background: "var(--color-border-strong)" }} aria-hidden />
          </div>
        </div>
      )}
    </div>
  );
}
