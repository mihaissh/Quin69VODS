/**
 * Application messages and text content
 */

import type { OfflineMessage } from '@/types/music';

/**
 * Funny rotating offline messages about Quin69
 * These messages rotate every minute based on timestamp
 */
export const OFFLINE_MESSAGES: readonly OfflineMessage[] = [
  {
    title: "Quin is offline right now",
    subtitle: "Probably checking Mathil's builds"
  },
  {
    title: "Stream is offline",
    subtitle: "Reinventing the meta with some potent build"
  },
  {
    title: "Quin69 is not live",
    subtitle: "Currently theorycrafting the next 0.01% build"
  },
  {
    title: "Stream unavailable",
    subtitle: "Eating all the burgers in New Zealand"
  },
  {
    title: "Not streaming right now",
    subtitle: "Searching for some bespoke builds"
  },
  {
    title: "Stream is offline",
    subtitle: "Hunting benny vaders in chat"
  }
] as const;

/**
 * Easter egg click messages
 */
export const EASTER_EGG_MESSAGES = {
  COOLDOWN: "ok lil bro stop it",
  CLICK_MORE: (count: number) => {
    const clickText = count === 1 ? 'time' : 'times';
    return `click ${count} more ${clickText}`;
  }
} as const;

/**
 * Empty state messages
 */
export const EMPTY_STATE_MESSAGES = {
  NO_SONG_PLAYING: "No song playing",
  NO_RECENT_SONGS: "No recently played songs",
  LOADING: "Loading"
} as const;

