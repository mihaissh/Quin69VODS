// All emotes available (original + new numbered + new variants)
const ALL_EMOTES = [
  // Original size variants
  'clown-tiny.avif',
  'clown-small.avif',
  'clown-medium-1.avif',
  'clown-medium-2.avif',
  'clown-large-1.avif',
  'clown-large-2.avif',
  'clown-large-3.avif',
  'clown-huge.avif',
  // New numbered emotes
  'clown 1.avif',
  'clown 2.avif',
  'clown 3.avif',
  'clown 4.avif',
  'clown 5.avif',
  'clown 6.avif',
  'clown 7.avif',
  'clown 8.avif',
  'clown 9.avif',
  'clown 10.avif',
  'clown 11.avif',
  'clown 12.avif',
  'clown 13.avif',
  // New variant emotes
  'clown-new-1.avif',
  'clown-new-2.avif',
  'clown-new-3.avif',
  'clown-new-4.avif',
  'clown-new-5.avif',
] as const;

export const EMOTES = {
  ALL: ALL_EMOTES,
  SCATTERED: ALL_EMOTES,
  FLOATING: ALL_EMOTES,
  COMPONENT: ALL_EMOTES,
  HERO: 'clown-huge.avif',
} as const;

// Dynamically determine the base path based on environment
const EMOTE_BASE_PATH = process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker/7tv' : '/7tv';

export const getEmotePath = (emote: string): string => {
  return `${EMOTE_BASE_PATH}/${emote}`;
};
