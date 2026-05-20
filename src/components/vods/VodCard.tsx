"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { formatDate, formatDuration, chapterColor } from "@/lib/utils";
import type { Vod } from "@/types/vod";

interface VodCardProps {
  vod: Vod;
}

export function VodCard({ vod }: VodCardProps) {
  const [imgError, setImgError] = useState(false);

  const firstGame     = vod.games?.[0];
  const thumbnail     = !imgError ? (firstGame?.thumbnail_url ?? null) : null;
  const hasVideo      = (vod.games?.length ?? 0) > 0;
  const href          = `/vods/${vod.id}`;
  const topChapters   = vod.chapters?.slice(0, 2) ?? [];
  const extraChapters = Math.max(0, (vod.chapters?.length ?? 0) - 2);

  const card = (
    <div
      className="vod-card rounded-lg overflow-hidden"
      style={{
        background: "var(--color-bg-surface)",
        opacity: hasVideo ? 1 : 0.65,
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: "var(--color-bg-elevated)" }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={vod.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon
              icon={hasVideo ? "mdi:television-play" : "mdi:clock-outline"}
              className="w-8 h-8"
              style={{ color: "var(--color-text-disabled)" }}
            />
          </div>
        )}

        {/* Play overlay — CSS-only, shown on group hover */}
        {hasVideo && (
          <div className="vod-card-overlay absolute inset-0 flex items-center justify-center">
            <div className="vod-card-play-btn flex items-center justify-center rounded-full"
              style={{
                width: 52,
                height: 52,
                background: "var(--color-amber)",
                color: "#111110",
              }}
            >
              <Icon icon="mdi:play" style={{ width: 26, height: 26, marginLeft: 3 }} />
            </div>
          </div>
        )}

        {/* Duration badge */}
        {vod.duration && (
          <span
            className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "rgba(0,0,0,0.78)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
            }}
          >
            {formatDuration(vod.duration)}
          </span>
        )}

        {vod.games?.length > 1 && (
          <span
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "rgba(0,0,0,0.78)",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
            }}
          >
            {vod.games.length} segs
          </span>
        )}

        {!hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: "rgba(0,0,0,0.75)", color: "var(--color-text-muted)" }}
            >
              Uploading…
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2">
        <h3
          className="text-sm font-semibold leading-snug line-clamp-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
        >
          {vod.title || `VOD ${vod.id}`}
        </h3>

        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
        >
          <span>{formatDate(vod.createdAt)}</span>
        </div>

        {topChapters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {topChapters.map((ch, i) => (
              <span
                key={i}
                className="chapter-pill"
                style={{ borderLeft: `2px solid ${chapterColor(i)}`, paddingLeft: 6 }}
                title={ch.name}
              >
                <span className="truncate max-w-[100px]">{ch.name}</span>
              </span>
            ))}
            {extraChapters > 0 && (
              <span className="chapter-pill" style={{ color: "var(--color-text-muted)" }}>
                +{extraChapters}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!hasVideo) return <div>{card}</div>;

  return (
    <Link
      href={href}
      className="group block"
      aria-label={`Watch ${vod.title || `VOD ${vod.id}`}`}
    >
      {card}
    </Link>
  );
}
