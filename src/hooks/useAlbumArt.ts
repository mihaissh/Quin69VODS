/**
 * Custom hook for fetching album artwork from iTunes
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { API_ENDPOINTS, ITUNES_IMAGE_SIZES } from '@/constants';
import { logger } from '@/utils/logger';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

/**
 * Fetch album artwork from iTunes Search API
 * Free API, no authentication required, works great for static sites
 */
async function fetchAlbumArtFromItunes(artist: string, track: string): Promise<string | null> {
  try {
    const searchTerm = artist ? `${artist} ${track}` : track;
    const url = `${API_ENDPOINTS.ITUNES_SEARCH}?${new URLSearchParams({
      term: searchTerm,
      media: 'music',
      entity: 'song',
      limit: '1',
    })}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const artworkUrl = data.results[0].artworkUrl100;
      if (artworkUrl) {
        // Get the highest quality artwork
        return artworkUrl.replace(ITUNES_IMAGE_SIZES.DEFAULT, ITUNES_IMAGE_SIZES.HIGH_QUALITY);
      }
    }

    return null;
  } catch (error) {
    logger.error('Error fetching from iTunes API:', error);
    return null;
  }
}

const CACHE_KEY = 'quin69_album_art_cache';

function getArtCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setArtCache(songTitle: string, url: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const cache = getArtCache();
    if (url) {
      cache[songTitle] = url;
    } else {
      delete cache[songTitle];
    }
    // Limit cache size to 100 entries to prevent bloat
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      delete cache[keys[0]];
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

/**
 * Hook to manage album artwork fetching
 * Handles abort controllers and cleanup automatically
 */
export function useAlbumArt(): UseAlbumArtReturn {
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const albumArtAbortControllerRef = useRef<AbortController | null>(null);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) {
      setAlbumArt(null);
      return;
    }

    // Check cache first
    const cache = getArtCache();
    if (cache[songTitle]) {
      setAlbumArt(cache[songTitle]);
      return;
    }

    // Cancel previous fetch if still in progress
    if (albumArtAbortControllerRef.current) {
      albumArtAbortControllerRef.current.abort();
    }

    albumArtAbortControllerRef.current = new AbortController();
    const signal = albumArtAbortControllerRef.current.signal;

    try {
      const parsed = parseSongInfo(songTitle);
      
      if (!parsed.title) {
        setAlbumArt(null);
        return;
      }

      if (signal.aborted) return;

      // Fetch album artwork from iTunes
      const artworkUrl = await fetchAlbumArtFromItunes(parsed.artist, parsed.title);

      if (signal.aborted) return;

      setAlbumArt(artworkUrl);
      
      // Store in cache
      setArtCache(songTitle, artworkUrl);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      logger.error('Error fetching album art:', error);
      setAlbumArt(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (albumArtAbortControllerRef.current) {
        albumArtAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    albumArt,
    fetchAlbumArt,
  };
}

