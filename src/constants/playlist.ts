/**
 * Playlist parsing constants
 */

export const PLAYLIST_FILTERS = {
  SPEAKER_EMOJI: '🔊',
  EXCLUDE_VIBE: 'VIBE',
  EXCLUDE_OFFLINE: 'offline',
  EXCLUDE_CLEARING: 'Clearing the spotify',
} as const;

export const STREAM_STATUS_INDICATORS = {
  OFFLINE: 'offline',
  ERROR: 'error',
} as const;

export const SPEAKER_EMOJI_LENGTH = 2; // '🔊' + space

