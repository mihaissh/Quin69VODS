'use client';

import { LoadingSpinner } from '@/components/Spinner';
import { NoMusicIcon } from '@/components/shared';
import { EMPTY_STATE_MESSAGES } from '@/constants';

/**
 * Loading state component
 */
export function LoadingState() {
  return <LoadingSpinner text={EMPTY_STATE_MESSAGES.LOADING} />;
}

/**
 * No song state component
 */
export function NoSongState() {
  return (
    <div className="text-center py-12">
      <div
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <NoMusicIcon />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {EMPTY_STATE_MESSAGES.NO_SONG_PLAYING}
      </p>
    </div>
  );
}

