import type { EmotesMaps, ThirdPartyEmote } from "@/types/vod";

export type RichToken =
  | { kind: "text"; text: string }
  | { kind: "emote"; emote: ThirdPartyEmote };

function isWordChar(c: string): boolean {
  return /[A-Za-z0-9_]/.test(c);
}

function needsWordBoundary(code: string): boolean {
  return /^[\w]+$/.test(code);
}

/**
 * Build unique emote codes for greedy scan: 7TV → FFZ → BTTV precedence (first wins for same code).
 */
export function buildThirdPartyCandidates(maps: EmotesMaps): ThirdPartyEmote[] {
  const byKey = new Map<string, ThirdPartyEmote>();
  const order: ThirdPartyEmote[] = [];
  const pushMap = (m: Map<string, ThirdPartyEmote>) => {
    for (const emote of m.values()) {
      const code = emote.code ?? emote.name;
      if (!code) continue;
      const key = code.toLowerCase();
      if (byKey.has(key)) continue;
      byKey.set(key, emote);
      order.push(emote);
    }
  };
  pushMap(maps["7tv"]);
  pushMap(maps.ffz);
  pushMap(maps.bttv);
  return order.sort((a, b) => (b.code ?? b.name).length - (a.code ?? a.name).length);
}

/**
 * Twitch-client-style third‑party parsing: longest match at each offset, word boundaries
 * for purely alphanumeric/underscore codes (BTTV/FFZ/7TV convention).
 */
export function tokenizeThirdPartyText(text: string, maps: EmotesMaps): RichToken[] {
  if (!text) return [];
  const candidates = buildThirdPartyCandidates(maps);
  if (candidates.length === 0) return [{ kind: "text", text }];

  const out: RichToken[] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    let matched: ThirdPartyEmote | null = null;
    let matchLen = 0;

    for (const emote of candidates) {
      const code = emote.code ?? emote.name;
      if (!code || code.length === 0) continue;
      if (i + code.length > n) continue;
      if (text.slice(i, i + code.length) !== code) continue;

      if (needsWordBoundary(code)) {
        const prev = i > 0 ? text[i - 1]! : "";
        const next = i + code.length < n ? text[i + code.length]! : "";
        if (i > 0 && isWordChar(prev)) continue;
        if (i + code.length < n && isWordChar(next)) continue;
      }

      if (code.length > matchLen) {
        matchLen = code.length;
        matched = emote;
      }
    }

    if (matched && matchLen > 0) {
      out.push({ kind: "emote", emote: matched });
      i += matchLen;
    } else {
      out.push({ kind: "text", text: text[i]! });
      i += 1;
    }
  }

  return coalesceTextTokens(out);
}

function coalesceTextTokens(tokens: RichToken[]): RichToken[] {
  const merged: RichToken[] = [];
  for (const t of tokens) {
    const last = merged[merged.length - 1];
    if (t.kind === "text" && last?.kind === "text") {
      last.text += t.text;
    } else {
      merged.push(t);
    }
  }
  return merged;
}
