/**
 * Shared utility for parsing song information from strings
 */

export interface ParsedSongInfo {
  artist: string;
  title: string;
}

/**
 * Parse a song string into artist and title
 * Format: "Artist - Title" or just "Title"
 */
export function parseSongInfo(songString: string): ParsedSongInfo {
  const parts = songString.split(' - ');
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }
  
  return {
    artist: 'Unknown Artist',
    title: songString.trim()
  };
}

