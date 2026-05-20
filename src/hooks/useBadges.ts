"use client";

import { useState, useEffect } from "react";
import { fetchBadges } from "@/lib/api";
import type { BadgesPayload, BadgeSet, BadgeVersion } from "@/types/vod";

/** Fetches global + channel badge sets once on mount. */
export function useBadgeMap(): BadgesPayload | null {
  const [badges, setBadges] = useState<BadgesPayload | null>(null);
  useEffect(() => { fetchBadges().then(setBadges); }, []);
  return badges;
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

/** Resolves a badge image URL from set ID + version string. */
export function getBadgeUrl(
  badges: BadgesPayload | null,
  setId: string,
  version: string,
): string | null {
  return findBadgeVersion(badges, setId, version)?.image_url_2x ?? null;
}

/** Full version row for srcSet / tooltips (quin69VOD BadgeRenderer). */
export function getBadgeVersion(
  badges: BadgesPayload | null,
  setId: string,
  version: string,
): BadgeVersion | null {
  return findBadgeVersion(badges, setId, version);
}
