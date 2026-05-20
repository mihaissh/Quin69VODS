/**
 * Split plain text into URL vs non-URL runs (Twitch auto-linkify style, conservative).
 */
const URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/[^\s]*)?$/;

/** Twitch @mention color (approximate web client). */
const MENTION_CLASS =
  "font-medium text-[#a970ff] hover:text-[#bf94ff] hover:underline decoration-[#a970ff]/60";

const MENTION_RE = /@([a-zA-Z0-9_]{2,25})\b/g;

export type TextPiece =
  | { kind: "text"; text: string }
  | { kind: "url"; href: string; label: string }
  | { kind: "mention"; login: string };

/**
 * First split on whitespace tokens that look like URLs, then @mentions inside text runs.
 */
export function splitTextIntoRichPieces(line: string): TextPiece[] {
  const parts: TextPiece[] = [];
  const words = line.split(/(\s+)/);
  for (const chunk of words) {
    if (!chunk) continue;
    if (/^\s+$/.test(chunk)) {
      parts.push({ kind: "text", text: chunk });
      continue;
    }
    if (URL_REGEX.test(chunk)) {
      const href = chunk.startsWith("http") ? chunk : `https://${chunk}`;
      parts.push({ kind: "url", href, label: chunk });
      continue;
    }
    let last = 0;
    MENTION_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MENTION_RE.exec(chunk)) !== null) {
      if (m.index > last) {
        parts.push({ kind: "text", text: chunk.slice(last, m.index) });
      }
      parts.push({ kind: "mention", login: m[1]! });
      last = m.index + m[0].length;
    }
    if (last < chunk.length) {
      parts.push({ kind: "text", text: chunk.slice(last) });
    }
  }
  return coalesceTextPieces(parts);
}

function coalesceTextPieces(pieces: TextPiece[]): TextPiece[] {
  const out: TextPiece[] = [];
  for (const p of pieces) {
    const last = out[out.length - 1];
    if (p.kind === "text" && last?.kind === "text") {
      last.text += p.text;
    } else {
      out.push(p);
    }
  }
  return out;
}

export { URL_REGEX, MENTION_CLASS };
