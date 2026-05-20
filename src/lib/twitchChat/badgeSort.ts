import type { UserBadge } from "@/types/vod";

/**
 * Twitch web approximate badge order (higher authority / identity first).
 * Unknown sets sort last, stable tie-break by original index.
 */
const ORDER: readonly string[] = [
  "staff",
  "admin",
  "global_mod",
  "broadcaster",
  "moderator",
  "vip",
  "partner",
  "ambassador",
  "premium",
  "turbo",
  "bits",
  "subscriber",
  "founder",
  "no_audio",
  "no_video",
  "predictions",
  "hype-train",
];

function badgeSetId(b: UserBadge): string {
  return (b.setID ?? b._id ?? b.id ?? "").toLowerCase();
}

function orderIndex(setId: string): number {
  const i = ORDER.indexOf(setId);
  return i === -1 ? 1000 + setId.charCodeAt(0) % 100 : i;
}

export function sortBadgesTwitchOrder(badges: readonly UserBadge[]): UserBadge[] {
  return [...badges]
    .map((b, originalIndex) => ({ b, originalIndex }))
    .sort((a, b) => {
      const d = orderIndex(badgeSetId(a.b)) - orderIndex(badgeSetId(b.b));
      if (d !== 0) return d;
      return a.originalIndex - b.originalIndex;
    })
    .map((x) => x.b);
}
