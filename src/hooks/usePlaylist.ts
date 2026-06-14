/**
 * Custom hook for fetching and managing playlist data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlaylistData } from '@/types/playlist';
import { UPDATE_INTERVAL_MS, API_ENDPOINTS } from '@/constants';
import { parsePlaylist } from '@/utils/playlist';
import { logger } from '@/utils/logger';

interface UsePlaylistProps {
  checkStreamStatus: (signal?: AbortSignal) => Promise<boolean>;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

interface UsePlaylistReturn {
  playlist: PlaylistData;
  loading: boolean;
  error: boolean;
  initialLoadComplete: boolean;
}

/**
 * Hook to manage playlist fetching and updates
 */
export function usePlaylist({
  checkStreamStatus,
  fetchAlbumArt,
}: UsePlaylistProps): UsePlaylistReturn {
  const [playlist, setPlaylist] = useState<PlaylistData>({
    currentSongTitle: null,
    historyTitles: [],
    historySongs: [],
    isOffline: false,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(false);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const previousSongTitleRef = useRef<string | null>(null);

  const updatePlaylist = useCallback(async () => {
    // Cancel previous fetch if still in progress
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    
    fetchAbortControllerRef.current = new AbortController();
    const signal = fetchAbortControllerRef.current.signal;
    
    try {
      setError(false);
      
      // Check if stream is live on Twitch
      const streamIsLive = await checkStreamStatus(signal);
      
      // Fetch WITH reverse to get newest messages first with optimized caching
      const response = await fetch(API_ENDPOINTS.PLAYLIST_LOG, {
        signal,
        cache: 'no-cache', // Always get fresh data for playlist
      });
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = parsePlaylist(lines, streamIsLive);
      
      // Fetch album art if song changed (defer to not block UI)
      if (parsedData.currentSongTitle && parsedData.currentSongTitle !== previousSongTitleRef.current) {
        // Defer album art fetch to next tick to prioritize playlist update
        const currentSong = parsedData.currentSongTitle;
        queueMicrotask(() => {
          fetchAlbumArt(currentSong);
        });
        previousSongTitleRef.current = currentSong;
      }
      
      setPlaylist(parsedData);
      try {
        localStorage.setItem('quin69_cached_playlist', JSON.stringify(parsedData));
      } catch {
        // ignore
      }
      
      // Mark initial load as complete after first successful fetch
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      logger.error('Error fetching playlist:', err);
      setError(true);
      
      // Still mark as complete even on error to prevent infinite loading
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(false);
    }
  }, [fetchAlbumArt, checkStreamStatus, initialLoadComplete]);

  // Restore from localStorage cache on client-side mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('quin69_cached_playlist');
      if (cached) {
        const parsed = JSON.parse(cached);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlaylist(parsed);
        setInitialLoadComplete(true);
        setLoading(false);
        
        // Restore album art if we had a current song
        if (parsed.currentSongTitle) {
          previousSongTitleRef.current = parsed.currentSongTitle;
          fetchAlbumArt(parsed.currentSongTitle);
        }
      }
    } catch (err) {
      logger.error('Failed to load cached playlist', err);
    }
  }, [fetchAlbumArt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updatePlaylist();
    const interval = setInterval(updatePlaylist, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updatePlaylist]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    playlist,
    loading,
    error,
    initialLoadComplete,
  };
}

