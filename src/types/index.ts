/**
 * Central export point for all type definitions
 * Import types from here for convenience: import type { ... } from '@/types'
 */

// Common types
export type { IconProps } from './common';

// Header types
export type { HeaderProps } from './header';

// Music/NowPlaying types
export type {
  SongInfo,
  OfflineMessage,
  NowPlayingProps,
  PlayingStateProps,
  InfoFieldProps,
  AlbumArtworkProps,
  PlayButtonProps,
  SearchLinksProps,
} from './music';

// Playlist/History types
export type {
  SongWithTimestamp,
  RecentlyPlayedProps,
  PlaylistData,
} from './playlist';

// Spinner types
export type {
  SpinnerProps,
  LoadingSpinnerProps,
} from './spinner';

