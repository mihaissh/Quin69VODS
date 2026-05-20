"use client";

import type { BadgesPayload, BadgeSet, BadgeVersion } from "@/types/vod";

/** Badge metadata is not loaded from the archive API; helpers stay for chat payloads. */
export function useBadgeMap(): BadgesPayload | null {
  return null;
}

function findBadgeVersion(
  badges: BadgesPayload | null,
  setId: string,
  version: string,
): BadgeVersion | null {
  if (!badges || !setId) return null;
  const pick = (sets?: BadgeSet[]) =>
    sets?.find((s) => s.set_id === setId)?.versions?.find((v) => v.id === version) ?? null;
  return pick(badges.channel) ?? pick(badges.global);
}

export function getBadgeUrl(
  badges: BadgesPayload | null,
  setId: string,
  version: string,
): string | null {
  return findBadgeVersion(badges, setId, version)?.image_url_2x ?? null;
}

export function getBadgeVersion(
  badges: BadgesPayload | null,
  setId: string,
  version: string,
): BadgeVersion | null {
  return findBadgeVersion(badges, setId, version);
}
