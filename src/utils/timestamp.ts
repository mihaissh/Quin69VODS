/**
 * Timestamp formatting utilities
 */

/**
 * Format timestamp to a readable relative time format
 * @param timestamp - Timestamp in format "YYYY-MM-DD HH:MM:SS" (assumed UTC)
 * @returns Formatted relative time string
 */
export function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '';

  try {
    // Parse timestamp in format "YYYY-MM-DD HH:MM:SS"
    const date = new Date(timestamp.replace(' ', 'T') + 'Z'); // Assume UTC
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    // Return relative time
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    // Return formatted time for older songs (using UTC to match timestamp parsing)
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const mins = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '';
  }
}

