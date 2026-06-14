'use client';

import { parseSongInfo } from '@/utils/songParser';
import { AlbumArtwork } from './AlbumArtwork';
import { EasterEggDisplay } from './EasterEggDisplay';
import { InfoField } from './InfoField';
import { PlayButton } from './PlayButton';
import { SearchLinks, CopyButton } from '@/components/shared';
import type { PlayingStateProps, SongInfo } from '@/types/music';

/**
 * Get text size class based on text length
 */
const getTextSizeClass = (text1: string, text2: string): string => {
  const maxLength = Math.max(text1.length, text2.length);
  
  if (maxLength > 50) return 'text-xs sm:text-xs';
  if (maxLength > 30) return 'text-sm sm:text-sm';
  return 'text-base sm:text-base';
};

/**
 * Playing state component - displays current song information
 */
export function PlayingState({ 
  currentSong, 
  albumArt, 
  showEasterEgg, 
  onPlayButtonClick, 
  clickMessage 
}: PlayingStateProps) {
  const parsed = parseSongInfo(currentSong);
  const songInfo: SongInfo = {
    artist: parsed.artist,
    title: parsed.title,
  };
  const textSizeClass = getTextSizeClass(songInfo.artist, songInfo.title);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Album Artwork or Easter Egg */}
      <div className="flex-shrink-0 mx-auto sm:mx-0 h-auto sm:h-auto">
        {showEasterEgg ? (
          <EasterEggDisplay />
        ) : (
          <AlbumArtwork src={albumArt} />
        )}
      </div>
      
      {/* Right Side: Song Info */}
      <div className="flex-1 relative">
        {/* Song Info and Controls */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Play Button - Hidden on mobile */}
          <div className="hidden sm:block mb-2">
            <PlayButton 
              onClick={onPlayButtonClick}
              disabled={showEasterEgg}
              message={clickMessage}
            />
          </div>
          
          {/* Song Info */}
          <div className="space-y-3 text-center sm:text-left mb-4">
            <InfoField 
              label="Artist" 
              value={songInfo.artist}
              textSize={textSizeClass}
            />
            <InfoField 
              label="Song" 
              value={songInfo.title}
              textSize={textSizeClass}
            />
          </div>
          
          {/* Search Links and Copy Button - At bottom */}
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <SearchLinks songQuery={currentSong} />
              <CopyButton songText={currentSong} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

