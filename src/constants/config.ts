/**
 * Application configuration constants
 */

/**
 * Playlist update interval (15 seconds)
 * Balanced for responsiveness while being respectful to the API
 */
export const UPDATE_INTERVAL_MS = 15000;

/**
 * Number of clicks required to trigger the easter egg
 */
export const EASTER_EGG_CLICKS = 5;

/**
 * Duration of the easter egg animation (3 seconds)
 */
export const EASTER_EGG_DURATION_MS = 3000;

/**
 * Maximum number of songs to show in history
 */
export const MAX_HISTORY_SONGS = 50;

/**
 * Easter egg cooldown period (5 minutes)
 */
export const EASTER_EGG_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Copy feedback duration (2 seconds)
 */
export const COPY_FEEDBACK_DURATION_MS = 2000;

/**
 * Album art defer delay (0ms for immediate next-tick)
 */
export const ALBUM_ART_DEFER_DELAY_MS = 0;

/**
 * iTunes image sizes
 */
export const ITUNES_IMAGE_SIZES = {
  DEFAULT: '100x100bb',
  HIGH_QUALITY: '600x600bb',
} as const;

/**
 * Asset paths
 */
export const ASSETS = {
  BASE_PATH: '',
  PROFILE_IMAGE: 'quin69.png',
  BEDGE_EMOTE: 'Bedge-2x.webp',
  EASTER_EGG_GIF: 'ABOBA.gif',
} as const;

