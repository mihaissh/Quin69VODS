'use client';

import { Reveal } from '@/components/Reveal';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { ComponentEmote } from '@/components/clown-theme';
import { CardHeader, LoadingState, NoSongState, OfflineState, PlayingState } from './';
import type { NowPlayingProps } from '@/types/music';

/**
 * Main NowPlaying component
 * Displays current song information with album art and search links
 */
export function NowPlaying({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
  showEasterEgg,
  onPlayButtonClick,
  clickMessage,
}: NowPlayingProps) {
  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isOffline) return <OfflineState />;
    if (currentSong) {
      return (
        <PlayingState
          currentSong={currentSong}
          albumArt={albumArt}
          showEasterEgg={showEasterEgg}
          onPlayButtonClick={onPlayButtonClick}
          clickMessage={clickMessage}
        />
      );
    }
    return <NoSongState />;
  };

  return (
    <Reveal>
      <div
        className="rounded-xl border overflow-hidden relative animate-shadow-pulse"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          borderColor: "var(--color-amber-line)",
        }}
      >
        <ComponentEmote position="bottom-right" size={56} />
        <CardHeader className="relative z-20" />

        {/* Visualizer as background - starts below header */}
        <div className="absolute left-0 right-0 bottom-0 rounded-b-xl" style={{ top: '40px' }}>
          <AudioVisualizer 
            isActive={!isLoading && !isOffline && currentSong !== null && !showEasterEgg} 
            className="w-full h-full" 
          />
        </div>

        <div className="p-3 relative z-10">
          {renderContent()}
        </div>
      </div>
    </Reveal>
  );
}

