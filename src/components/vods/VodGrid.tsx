"use client";

import { Icon } from "@iconify/react";
import { VodCard } from "./VodCard";
import { VodCardSkeleton } from "@/components/ui/Skeleton";
import { VODS_PAGE_SIZE } from "@/lib/vodsPagination";
import type { Vod } from "@/types/vod";

interface VodGridProps {
  vods: Vod[];
  loading: boolean;
  isInitialLoad: boolean;
  error: Error | null;
}

export function VodGrid({
  vods,
  loading,
  isInitialLoad,
  error,
}: VodGridProps) {
  const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  // Only skeleton placeholders on the very first archive load (no data yet).
  if (isInitialLoad && loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: VODS_PAGE_SIZE }).map((_, i) => (
          <VodCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-20 rounded-lg"
        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
      >
        <Icon icon="mdi:alert-circle-outline" className="w-8 h-8" style={{ color: "var(--color-live)" }} />
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Failed to load VODs</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!loading && vods.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-20 rounded-lg"
        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
      >
        <Icon icon="mdi:television-off" className="w-8 h-8" style={{ color: "var(--color-text-disabled)" }} />
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>No VODs found</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${GRID} relative`}>
      {loading && (
        <div
          className="absolute inset-0 z-[1] flex items-start justify-center pt-24 rounded-lg pointer-events-none"
          style={{ background: "rgba(17,17,16,0.35)" }}
          aria-hidden
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin pointer-events-none"
            style={{ borderColor: "var(--color-amber)", borderTopColor: "transparent" }}
          />
        </div>
      )}
      {vods.map((vod) => (
        <VodCard key={vod.id} vod={vod} />
      ))}
    </div>
  );
}
