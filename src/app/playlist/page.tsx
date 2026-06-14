"use client";

import { lazy, Suspense } from "react";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/Header";
import { NowPlaying } from "@/components/NowPlaying";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import { FloatingEmotes } from "@/components/clown-theme";
import { useStreamStatus } from "@/hooks/useStreamStatus";
import { useAlbumArt } from "@/hooks/useAlbumArt";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useEasterEgg } from "@/hooks/useEasterEgg";

const RecentlyPlayed = lazy(() =>
  import("@/components/RecentlyPlayed").then((mod) => ({
    default: mod.RecentlyPlayed,
  }))
);

function PlaylistDashboard() {
  const { isStreamLive, checkStreamStatus } =
    useStreamStatus();
  const { albumArt, fetchAlbumArt } = useAlbumArt();
  const { playlist, loading, error, initialLoadComplete } = usePlaylist({
    checkStreamStatus,
    fetchAlbumArt,
  });
  const { showEasterEgg, clickMessage, handlePlayButtonClick } =
    useEasterEgg();

  return (
    <div
      className="min-h-screen pt-12 flex flex-col overflow-hidden relative animate-fade-in"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Waterfall emotes */}
      <FloatingEmotes />

      {/* Header Container (Wide, matching VODs page header alignment) */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
        <Header isOffline={!isStreamLive} hasError={error} />
      </div>

      {/* Main Container (Centered, narrow tracker cards) */}
      <div className="w-full max-w-3xl mx-auto px-6 pb-8 flex-grow flex flex-col relative z-10">
        {/* Vertical Card Layout */}
        <div className="space-y-6 flex-grow mb-8">
          {/* Card 1: Now Playing */}
          <NowPlaying
            isLoading={loading && !initialLoadComplete}
            isOffline={playlist.isOffline}
            currentSong={playlist.currentSongTitle}
            albumArt={albumArt}
            showEasterEgg={showEasterEgg}
            onPlayButtonClick={handlePlayButtonClick}
            clickMessage={clickMessage}
          />

          {/* Card 2: Recently Played */}
          <Suspense
            fallback={
              <div
                className="rounded-xl border overflow-hidden animate-pulse-slow"
                style={{
                  background: "var(--color-bg-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div
                  className="px-5 py-3 border-b bg-opacity-30"
                  style={{
                    background: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h3 className="text-sm font-medium text-zinc-400">
                    Recently Played
                  </h3>
                </div>
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-zinc-600">Loading...</p>
                </div>
              </div>
            }
          >
            <Reveal delay={0.15}>
              <RecentlyPlayed historySongs={playlist.historySongs} />
            </Reveal>
          </Suspense>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <ThemeProvider>
      <PlaylistDashboard />
    </ThemeProvider>
  );
}
