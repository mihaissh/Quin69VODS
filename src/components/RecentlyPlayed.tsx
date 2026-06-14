'use client';

import { useState } from 'react';
import { SpotifyIcon, YouTubeIcon, ExternalLinkIcon } from './icons';

import { CopyButton } from './shared';
import { ClockIcon, ChevronDownIcon } from './shared/icons';
import { formatTimestamp } from '@/utils/timestamp';
import type { RecentlyPlayedProps } from '@/types/playlist';
import { EMPTY_STATE_MESSAGES } from '@/constants';

export function RecentlyPlayed({ historySongs }: RecentlyPlayedProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const hasHistory = historySongs.length > 0;

  return (
    <div
      className="rounded-xl border overflow-hidden relative"
      style={{
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.6)',
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border)',
      }}
    >

      <div
        className="px-5 py-3 border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-elevated)',
        }}
      >
        <h3 className="text-sm font-medium flex items-center gap-2 text-[var(--color-text-secondary)]">
          <ClockIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
          Recently Played
          {hasHistory && (
            <span
              className="ml-auto px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {historySongs.length}
            </span>
          )}
        </h3>
      </div>
      <div className="divide-y divide-[var(--color-border)]/50 max-h-[350px] overflow-y-auto minimal-scrollbar">
        {hasHistory ? (
          historySongs.map((songData, index) => {
            const song = songData.title;
            const timestamp = formatTimestamp(songData.timestamp);
            const isSkipped = song.toLowerCase().includes('skipped');
            
            return (
              <div key={index}>
                {isSkipped ? (
                  // Skipped songs - no dropdown
                  <div className="w-full text-left px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-500 italic flex-1 truncate">
                        {song}
                      </span>
                      {timestamp && (
                        <span className="text-xs text-zinc-600 flex-shrink-0">
                          {timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  // Normal songs with dropdown
                  <>
                    <button
                      onClick={() => setSelectedSong(selectedSong === song ? null : song)}
                      className="group w-full text-left px-5 py-3.5 hover:bg-[var(--color-bg-elevated)] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-amber)] transition-colors flex-1 truncate">
                          {song}
                        </span>
                        {timestamp && (
                          <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors flex-shrink-0">
                            {timestamp}
                          </span>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                          <CopyButton songText={song} variant="div" />
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-zinc-600 group-hover:text-[var(--color-amber)] transition-all flex-shrink-0 ml-2 ${selectedSong === song ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {/* Inline Dropdown */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        selectedSong === song
                          ? 'max-h-32 opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div
                        className="px-5 py-4 border-t"
                        style={{
                          backgroundColor: 'var(--color-bg-base)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div className="flex gap-2.5">
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-spotify-dim)] hover:bg-[rgba(29,185,84,0.2)] rounded-lg border border-[var(--color-spotify-line)] hover:border-[var(--color-spotify)] transition-all group"
                          >
                            <SpotifyIcon className="w-5 h-5 text-[var(--color-spotify)]" />
                            <span className="text-sm font-medium text-[var(--color-spotify)] group-hover:text-[#1ed760]">
                              Spotify
                            </span>
                            <ExternalLinkIcon className="w-4 h-4 text-[var(--color-spotify)]" />
                          </a>

                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-live-dim)] hover:bg-[rgba(239,68,68,0.25)] rounded-lg transition-all group"
                          >
                            <YouTubeIcon className="w-5 h-5 text-[var(--color-live)]" />
                            <span className="text-sm font-medium text-[var(--color-live)] group-hover:text-[var(--color-text-primary)]">
                              YouTube
                            </span>
                            <ExternalLinkIcon className="w-4 h-4 text-[var(--color-live)]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">{EMPTY_STATE_MESSAGES.NO_RECENT_SONGS}</p>
          </div>
        )}
      </div>
    </div>
  );
}

