"use client";


import { VodPlayer } from "./VodPlayer";
import type { Vod } from "@/types/vod";

interface Props {
  vod: Vod;
  initialTimestamp?: number;
  initialGameIdx?: number;
}

export function VodPlayerPage({ vod, initialTimestamp, initialGameIdx }: Props) {
  return (
    <div
      className="flex flex-col animate-fade-in"
      style={{ height: "100dvh", background: "var(--color-bg-base)", overflow: "hidden" }}
    >
      <div className="flex-1 min-h-0 pt-12">
        <VodPlayer
          vod={vod}
          initialTimestamp={initialTimestamp}
          initialGameIdx={initialGameIdx}
        />
      </div>
    </div>
  );
}
