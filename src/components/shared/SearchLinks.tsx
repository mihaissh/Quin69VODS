'use client';

import { SpotifyIcon, YouTubeIcon } from '@/components/icons';
import type { SearchLinksProps } from '@/types/music';

/**
 * Reusable search links component for Spotify and YouTube
 */
export function SearchLinks({ songQuery }: SearchLinksProps) {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-2">
      <a
        href={`https://open.spotify.com/search/${encodeURIComponent(songQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 backdrop-blur-sm rounded-md transition-all text-xs font-medium text-white border shadow-lg bg-[var(--color-spotify-dim)] hover:bg-[rgba(29,185,84,0.2)] border-[var(--color-spotify-line)] hover:border-[var(--color-spotify)]"
        aria-label={`Search "${songQuery}" on Spotify`}
      >
        <SpotifyIcon className="w-4 h-4 text-[var(--color-spotify)]" />
        Spotify
      </a>
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 backdrop-blur-sm rounded-md transition-all text-xs font-medium text-white border shadow-lg bg-[var(--color-live-dim)] hover:bg-[rgba(239,68,68,0.25)] border-[rgba(239,68,68,0.25)] hover:border-[var(--color-live)]"
        aria-label={`Search "${songQuery}" on YouTube`}
      >
        <YouTubeIcon className="w-4 h-4 text-[var(--color-live)]" />
        YouTube
      </a>
    </div>
  );
}
