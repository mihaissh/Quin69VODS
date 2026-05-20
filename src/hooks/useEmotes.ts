"use client";

import { useState, useEffect } from "react";
import {
  fetchVodEmotes,
  fetchBTTVGlobal,
  fetchBTTVChannel,
  fetchFFZChannel,
  fetchSevenTVChannel,
  fetchSevenTVGlobal,
} from "@/lib/api";
import type { Emote, EmotesMaps, ThirdPartyEmote } from "@/types/vod";

const TWITCH_ID = process.env.NEXT_PUBLIC_TWITCH_ID ?? "";

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

/**
 * Tri-map of third-party emotes (quin69VOD `Chat.js` + `MessageRenderer.js`):
 * lowercase keys, 7TV → FFZ → BTTV resolution order in the renderer.
 */
export function useEmotesMaps(vodId: string): EmotesMaps {
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

      const vodData = await fetchVodEmotes(vodId);
      if (vodData) {
        for (const e of vodData.bttv_emotes ?? []) {
          if (!e.id || !e.code) continue;
          const row: ThirdPartyEmote = { id: e.id, name: e.code, code: e.code, source: "bttv" };
          register(next.bttv, e.code, row);
        }
        for (const e of vodData.ffz_emotes ?? []) {
          const idStr = String((e as { id?: number | string }).id ?? e.name);
          if (!e.name) continue;
          const row: ThirdPartyEmote = { id: idStr, name: e.name, code: e.name, source: "ffz" };
          register(next.ffz, e.name, row);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const e of (vodData["7tv_emotes"] as any[]) ?? []) {
          const code = (e.name ?? e.code ?? "") as string;
          const id   = (e.id ?? e.data?.id ?? "") as string;
          if (!code || !id) continue;
          const row: ThirdPartyEmote = { id, name: code, code, source: "7tv" };
          register(next["7tv"], code, row);
        }
      }

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
  }, [vodId]);

  return maps;
}
