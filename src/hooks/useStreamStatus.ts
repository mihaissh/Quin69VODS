/**
 * Custom hook for checking Twitch stream status
 */

import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, STREAM_STATUS_INDICATORS } from '@/constants';
import { logger } from '@/utils/logger';

interface UseStreamStatusReturn {
  isStreamLive: boolean;
  streamStatusChecked: boolean;
  checkStreamStatus: (signal?: AbortSignal, useCache?: boolean) => Promise<boolean>;
}

/**
 * Hook to manage stream status checking
 * Performs initial check and provides function for subsequent checks
 */
export function useStreamStatus(): UseStreamStatusReturn {
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [streamStatusChecked, setStreamStatusChecked] = useState(false);

  const checkStreamStatus = useCallback(async (signal?: AbortSignal, useCache: boolean = true): Promise<boolean> => {
    try {
      // Create an abort controller with a 5-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_ENDPOINTS.TWITCH_UPTIME, {
        signal: signal || controller.signal,
        cache: useCache ? 'default' : 'no-cache',
      });
      clearTimeout(timeoutId);

      const text = await response.text();

      const isLive = !text.toLowerCase().includes(STREAM_STATUS_INDICATORS.OFFLINE) &&
                     !text.toLowerCase().includes(STREAM_STATUS_INDICATORS.ERROR) &&
                     text.trim() !== '';

      setIsStreamLive(isLive);
      return isLive;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return false; // Return false if aborted since we couldn't verify
      }
      logger.error('Error checking stream status:', err);
      setIsStreamLive(false);
      return false;
    }
  }, []);

  // Fast initial stream status check - runs before first render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkStreamStatus(undefined, false).then(() => {
      setStreamStatusChecked(true);
    });
  }, [checkStreamStatus]);

  return {
    isStreamLive,
    streamStatusChecked,
    checkStreamStatus,
  };
}

