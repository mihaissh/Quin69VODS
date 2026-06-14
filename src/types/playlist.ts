/**
 * Playlist and history-related type definitions
 */

export interface SongWithTimestamp {
  title: string;
  timestamp: string; // ISO format: "YYYY-MM-DD HH:MM:SS"
}

export interface RecentlyPlayedProps {
  historySongs: SongWithTimestamp[];
}

/**
 * Main playlist data structure used in the app
 */
export interface PlaylistData {
  currentSongTitle: string | null;
  historyTitles: string[];
  historySongs: SongWithTimestamp[];
  isOffline: boolean;
}

/**
 * Queue song with requester information
 */
export interface QueueSong {
  title: string;
  requester: string;
  timestamp: string;
}

/**
 * Component props for UpcomingQueue
 */
export interface UpcomingQueueProps {
  queueSongs: QueueSong[];
  isConnected: boolean;
  onClearQueue: () => void;
}
