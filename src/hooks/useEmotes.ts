"use client";

import { useState, useEffect } from "react";
import {
  fetchBTTVGlobal,
  fetchBTTVChannel,
  fetchFFZChannel,
  fetchSevenTVChannel,
  fetchSevenTVGlobal,
} from "@/lib/api";
import type { Emote, EmotesMaps, ThirdPartyEmote } from "@/types/vod";

const TWITCH_ID = process.env.NEXT_PUBLIC_TWITCH_ID || "56649026";

function register(map: Map<string, ThirdPartyEmote>, key: string, emote: ThirdPartyEmote) {
  if (!key) return;
  map.set(key.toLowerCase(), emote);
}

function fromEmoteList(list: Emote[], maps: EmotesMaps) {
  for (const e of list) {
    if (!e.id || !e.code) continue;
    const row: ThirdPartyEmote = {
      id:   e.id,
      name: e.code,
      code: e.code,
      source: e.source ?? "bttv",
    };
    if (e.source === "7tv") {
      register(maps["7tv"], e.code, { ...row, source: "7tv" });
    } else if (e.source === "ffz") {
      register(maps.ffz, e.code, { ...row, source: "ffz" });
    } else {
      register(maps.bttv, e.code, { ...row, source: "bttv" });
    }
  }
}

/** Loads BTTV, FFZ, and 7TV emotes for chat rendering. */
export function useEmotesMaps(): EmotesMaps {
  const [maps, setMaps] = useState<EmotesMaps>(() => ({
    "7tv": new Map(),
    bttv: new Map(),
    ffz:  new Map(),
  }));

  useEffect(() => {
    let mounted = true;

    async function load() {
      const next: EmotesMaps = {
        "7tv": new Map(),
        bttv: new Map(),
        ffz:  new Map(),
      };

      const results = await Promise.allSettled([
        fetchBTTVGlobal(),
        fetchBTTVChannel(TWITCH_ID),
        fetchFFZChannel(TWITCH_ID),
        fetchSevenTVChannel(TWITCH_ID),
        fetchSevenTVGlobal(),
      ]);
      for (const r of results) {
        if (r.status === "fulfilled") fromEmoteList(r.value, next);
      }

      if (!mounted) return;
      setMaps(next);
    }

    load();
    return () => { mounted = false; };
  }, []);

  return maps;
}
