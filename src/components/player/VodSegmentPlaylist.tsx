"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { formatDate, toHMS } from "@/lib/utils";
import type { VodGame, VodNeighbor } from "@/types/vod";

interface VodSegmentPlaylistProps {
  games: VodGame[];
  prevVods?: VodNeighbor[];
  nextVods?: VodNeighbor[];
  activeIndex: number;
  onSelect: (index: number) => void;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

function VodNavButton({
  href,
  label,
  title,
  date,
  icon,
  iconPosition,
}: {
  href: string;
  label: string;
  title: string;
  date?: string;
  icon: "mdi:chevron-left" | "mdi:chevron-right";
  iconPosition: "start" | "end";
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:opacity-90"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        maxWidth: 280,
      }}
      aria-label={`${label}: ${title}`}
    >
      {iconPosition === "start" && (
        <Icon icon={icon} className="h-4 w-4 shrink-0" style={{ color: "var(--color-amber)" }} />
      )}
      <span className="min-w-0 flex-1">
        <span
          className="block text-[0.65rem] font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-amber)" }}
        >
          {label}
        </span>
        <span className="block truncate text-xs" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </span>
        {date && (
          <span
            className="block truncate text-[0.65rem]"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
          >
            {date}
          </span>
        )}
      </span>
      {iconPosition === "end" && (
        <Icon icon={icon} className="h-4 w-4 shrink-0" style={{ color: "var(--color-amber)" }} />
      )}
    </Link>
  );
}

export function VodSegmentPlaylist({
  games,
  prevVods = [],
  nextVods = [],
  activeIndex,
  onSelect,
  visible: visibleProp,
  onVisibleChange,
}: VodSegmentPlaylistProps) {
  const [visibleInternal, setVisibleInternal] = useState(true);
  const visible = visibleProp ?? visibleInternal;
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const olderVod = nextVods[0] ?? null;
  const newerVod = prevVods[0] ?? null;
  const hasNav = Boolean(olderVod || newerVod);
  const hasParts = games.length > 1;

  function setVisible(next: boolean) {
    onVisibleChange?.(next);
    if (visibleProp === undefined) setVisibleInternal(next);
  }

  useEffect(() => {
    if (!visible || !hasParts) return;
    segmentRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, visible, hasParts]);

  if (!hasNav && games.length === 0) return null;

  return (
    <div
      className="flex-shrink-0 border-t"
      style={{
        background: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-2"
        style={{ borderBottom: visible ? "1px solid var(--color-border)" : undefined }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon icon="mdi:playlist-play" className="w-4 h-4 shrink-0" style={{ color: "var(--color-amber)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            {hasParts ? `${games.length} parts` : "Navigation"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasParts && (
            <span
              className="hidden sm:inline text-xs"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
            >
              Part {activeIndex + 1} of {games.length}
            </span>
          )}

          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
            style={{
              color: visible ? "var(--color-amber)" : "var(--color-text-muted)",
              background: visible ? "var(--color-amber-dim)" : "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
            }}
            aria-expanded={visible}
            aria-controls="vod-segment-playlist"
          >
            <Icon icon={visible ? "mdi:chevron-down" : "mdi:chevron-up"} className="w-3.5 h-3.5" />
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {visible && (
        <div id="vod-segment-playlist" className="flex flex-col gap-3 px-4 py-3">
          {(newerVod || olderVod) && (
            <div className="flex items-stretch justify-center gap-3">
              {newerVod ? (
                <VodNavButton
                  href={`/vods/${newerVod.id}`}
                  label="Next"
                  title={newerVod.title}
                  date={newerVod.createdAt ? formatDate(newerVod.createdAt) : undefined}
                  icon="mdi:chevron-left"
                  iconPosition="start"
                />
              ) : (
                <div className="flex-1" style={{ maxWidth: 280 }} />
              )}

              {olderVod ? (
                <VodNavButton
                  href={`/vods/${olderVod.id}`}
                  label="Previous"
                  title={olderVod.title}
                  date={olderVod.createdAt ? formatDate(olderVod.createdAt) : undefined}
                  icon="mdi:chevron-right"
                  iconPosition="end"
                />
              ) : (
                <div className="flex-1" style={{ maxWidth: 280 }} />
              )}
            </div>
          )}

          {hasParts && (
            <div className="flex flex-wrap gap-2">
              {games.map((game, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={game.id}
                    ref={(el) => { segmentRefs.current[index] = el; }}
                    type="button"
                    onClick={() => onSelect(index)}
                    className="rounded-md px-3 py-1.5 text-left text-xs transition-colors"
                    style={{
                      background: active ? "var(--color-amber-dim)" : "var(--color-bg-elevated)",
                      border: active ? "1px solid var(--color-amber)" : "1px solid var(--color-border)",
                      color: active ? "var(--color-amber-light)" : "var(--color-text-secondary)",
                    }}
                    aria-current={active ? "true" : undefined}
                  >
                    <span className="font-semibold">Part {index + 1}</span>
                    <span className="mx-1 opacity-40">·</span>
                    <span>{game.game_name}</span>
                    <span
                      className="ml-1 opacity-60"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
                    >
                      @ {toHMS(parseFloat(game.start_time) || 0)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
