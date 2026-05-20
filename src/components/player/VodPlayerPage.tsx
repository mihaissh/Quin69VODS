"use client";

import Navbar from "@/components/layout/Navbar";
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
      className="flex flex-col"
      style={{ height: "100dvh", background: "var(--color-bg-base)", overflow: "hidden" }}
    >
      <Navbar />
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
