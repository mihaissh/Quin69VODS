"use client";

import { memo, useMemo, type ReactNode } from "react";
import type { ChatFragment, EmotesMaps, ThirdPartyEmote } from "@/types/vod";
import {
  TWITCH_EMOTE_CDN,
  FFZ_EMOTE_CDN,
  BTTV_EMOTE_CDN,
  SEVEN_TV_CDN,
} from "@/lib/emoteCdns";
import { tokenizeThirdPartyText } from "@/lib/twitchChat/thirdPartyTokenize";
import { MENTION_CLASS, splitTextIntoRichPieces } from "@/lib/twitchChat/richTextPieces";

function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  const t = document.createTextNode((img.alt || "") + " ");
  img.parentNode?.insertBefore(t, img);
  img.remove();
}

const TwitchEmoteImg = memo(function TwitchEmoteImg({
  emoteId,
  label,
}: {
  emoteId: string;
  label:   string;
}) {
  const base = `${TWITCH_EMOTE_CDN}/emoticons/v2/${emoteId}/default/dark`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}/1.0`}
      srcSet={`${base}/1.0 1x, ${base}/2.0 2x, ${base}/3.0 4x`}
      alt={label}
      title={label}
      className="chat-emote mx-0.5 inline-block align-middle"
      style={{ maxHeight: 28, maxWidth: 100, verticalAlign: "middle" }}
      onError={onImgError}
    />
  );
});

const ThirdPartyEmoteImg = memo(function ThirdPartyEmoteImg({ emote }: { emote: ThirdPartyEmote }) {
  const label = emote.name || emote.code;
  if (emote.source === "7tv") {
    const base = `${SEVEN_TV_CDN}/${emote.id}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${base}/1x.webp`}
        srcSet={`${base}/1x.webp 1x, ${base}/2x.webp 2x, ${base}/3x.webp 3x, ${base}/4x.webp 4x`}
        alt={label}
        title={label}
        className="chat-emote mx-0.5 inline-block align-middle"
        style={{ maxHeight: 28, maxWidth: 100, verticalAlign: "middle" }}
        onError={onImgError}
      />
    );
  }
  if (emote.source === "ffz") {
    const base = `${FFZ_EMOTE_CDN}/${emote.id}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        loading="lazy"
        decoding="async"
        src={`${base}/1`}
        srcSet={`${base}/1 1x, ${base}/2 2x, ${base}/4 4x`}
        alt={label}
        title={label}
        className="chat-emote mx-0.5 inline-block align-middle"
        style={{ maxHeight: 28, maxWidth: 100, verticalAlign: "middle" }}
        onError={onImgError}
      />
    );
  }
  const base = `${BTTV_EMOTE_CDN}/${emote.id}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      loading="lazy"
      decoding="async"
      src={`${base}/1x`}
      srcSet={`${base}/1x 1x, ${base}/2x 2x, ${base}/3x 3x`}
      alt={label}
      title={label}
      className="chat-emote mx-0.5 inline-block align-middle"
      style={{ maxHeight: 28, maxWidth: 100, verticalAlign: "middle" }}
      onError={onImgError}
    />
  );
});

function CheerBlock({ bits, prefix }: { bits: number; prefix: string }) {
  const p = (prefix || "cheer").toLowerCase();
  return (
    <span
      className="inline-flex items-baseline gap-0.5 font-semibold align-middle"
      style={{ color: "#9146ff" }}
      title={`${bits} Bits`}
    >
      <span className="uppercase">{p}</span>
      <span style={{ color: "#9146ff" }}>{bits}</span>
    </span>
  );
}

function renderCheermote(fragment: ChatFragment, key: number): ReactNode {
  const ch = fragment.cheermote;
  let bits = ch?.bits ?? 0;
  if (!bits && fragment.text) {
    bits = Number.parseInt(fragment.text.replace(/\D/g, ""), 10) || 0;
  }
  const prefix = ch?.prefix ?? "cheer";
  return <CheerBlock key={key} bits={bits} prefix={prefix} />;
}

function renderTextRun(text: string, emotesMap: EmotesMaps, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const rich = tokenizeThirdPartyText(text, emotesMap);
  let k = 0;
  for (const tok of rich) {
    if (tok.kind === "emote") {
      out.push(<ThirdPartyEmoteImg key={`${keyBase}-e-${k++}`} emote={tok.emote} />);
      continue;
    }
    const pieces = splitTextIntoRichPieces(tok.text);
    for (const piece of pieces) {
      if (piece.kind === "text") {
        out.push(<span key={`${keyBase}-t-${k++}`}>{piece.text}</span>);
      } else if (piece.kind === "url") {
        out.push(
          <a
            key={`${keyBase}-u-${k++}`}
            href={piece.href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-[#bf94ff] underline decoration-[#bf94ff]/70 hover:text-[#d8b4ff]"
          >
            {piece.label}
          </a>,
        );
      } else {
        const login = piece.login;
        out.push(
          <a
            key={`${keyBase}-m-${k++}`}
            href={`https://www.twitch.tv/${login}`}
            target="_blank"
            rel="noopener noreferrer"
            className={MENTION_CLASS}
          >
            @{login}
          </a>,
        );
      }
    }
  }
  return out;
}

export const MessageRenderer = memo(function MessageRenderer({
  fragments,
  emotesMap,
}: {
  fragments: ChatFragment[];
  emotesMap: EmotesMaps;
}) {
  const nodes = useMemo(() => {
    const out: React.ReactNode[] = [];
    let k = 0;

    for (const fragment of fragments) {
      if (fragment.cheermote) {
        out.push(renderCheermote(fragment, k++));
        continue;
      }

      const emoteId = fragment.emote?.emoteID ?? fragment.emote?.id;
      if (emoteId) {
        out.push(
          <TwitchEmoteImg key={k++} emoteId={emoteId} label={fragment.text ?? ""} />,
        );
        continue;
      }
      if (fragment.emoticon?.emoticon_id) {
        out.push(
          <TwitchEmoteImg
            key={k++}
            emoteId={fragment.emoticon.emoticon_id}
            label={fragment.text ?? ""}
          />,
        );
        continue;
      }

      const raw = fragment.text ?? "";
      out.push(...renderTextRun(raw, emotesMap, `f${k++}`));
    }
    return out;
  }, [fragments, emotesMap]);

  return <span className="inline align-middle">{nodes}</span>;
});
