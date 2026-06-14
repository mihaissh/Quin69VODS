/**
 * Music and Song-related type definitions
 */

export interface SongInfo {
  artist: string;
  title: string;
}

export interface OfflineMessage {
  title: string;
  subtitle: string;
}

/**
 * Component Props
 */

export interface NowPlayingProps {
  isLoading: boolean;
  isOffline: boolean;
  currentSong: string | null;
  albumArt: string | null;
  showEasterEgg: boolean;
  onPlayButtonClick: () => void;
  clickMessage: string | null;
}

export interface PlayingStateProps {
  currentSong: string;
  albumArt: string | null;
  showEasterEgg: boolean;
  onPlayButtonClick: () => void;
  clickMessage: string | null;
}

/**
 * UI Component Props
 */

export interface InfoFieldProps {
  label: string;
  value: string;
  labelColor?: string;
  textSize?: string;
}

export interface AlbumArtworkProps {
  src: string | null;
  alt?: string;
}

export interface PlayButtonProps {
  onClick: () => void;
  disabled: boolean;
  message: string | null;
}

export interface SearchLinksProps {
  songQuery: string;
}

