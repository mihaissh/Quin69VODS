"use client";

import { memo, useMemo } from "react";
import { getBadgeVersion } from "@/hooks/useBadges";
import { ensureAccessibleTextColor } from "@/lib/chatColor";
import { sortBadgesTwitchOrder } from "@/lib/twitchChat/badgeSort";
import { chatDisplayName, isChatAction, normalizeMessageFragments } from "@/lib/twitchChat/commentFields";
import type { ChatComment, EmotesMaps, BadgesPayload } from "@/types/vod";
import { MessageRenderer } from "./MessageRenderer";

interface ChatMessageProps {
  comment:   ChatComment;
  emotesMap: EmotesMaps;
  badges:    BadgesPayload | null;
  index:     number;
  altBg:     boolean;
}

export const ChatMessage = memo(function ChatMessage({
  comment, emotesMap, badges, index, altBg,
}: ChatMessageProps) {
  const color = ensureAccessibleTextColor(comment.user_color);

  const frags = useMemo(() => normalizeMessageFragments(comment), [comment]);

  const isAction = useMemo(() => isChatAction(comment), [comment]);
  const displayName = useMemo(() => chatDisplayName(comment), [comment]);

  const badgeEls = useMemo(() => sortBadgesTwitchOrder(comment.user_badges ?? []).flatMap((b, i) => {
    const setId = b.setID ?? b._id ?? b.id ?? "";
    const ver   = b.version ?? "";
    if (!setId || !ver) return [];
    const v = getBadgeVersion(badges, setId, ver);
    if (!v) return [];
    return [
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={`${setId}-${ver}-${i}`}
        crossOrigin="anonymous"
        loading="lazy"
        decoding="async"
        src={v.image_url_1x}
        srcSet={`${v.image_url_1x} 1x, ${v.image_url_2x} 2x, ${v.image_url_4x} 4x`}
        alt=""
        title={v.title ?? setId}
        width={18}
        height={18}
        className="inline-block align-middle"
      />,
    ];
  }), [comment.user_badges, badges]);

  const bodyColor = isAction ? color : "var(--color-text-primary)";

  return (
    <div
      className="px-3 py-1 text-sm leading-relaxed"
      style={{
        background:    altBg && index % 2 === 0 ? "var(--color-bg-elevated)" : "transparent",
        wordBreak:     "break-word",
        overflowWrap:  "break-word",
      }}
    >
      {badgeEls.length > 0 && (
        <span className="mr-1 inline-flex items-center gap-0.5 align-middle">{badgeEls}</span>
      )}
      {isAction ? (
        <span className="align-middle italic" style={{ color }}>
          <span className="font-semibold not-italic" style={{ color, textShadow: "0 1px 1px rgba(0,0,0,0.8)" }}>
            {displayName}
          </span>
          <span aria-hidden> </span>
          <MessageRenderer fragments={frags} emotesMap={emotesMap} />
        </span>
      ) : (
        <>
          <span className="font-semibold align-middle" style={{ color, textShadow: "0 1px 1px rgba(0,0,0,0.8)" }}>
            {displayName}
          </span>
          <span style={{ color: "var(--color-text-muted)" }} className="align-middle">: </span>
          <span className="align-middle" style={{ color: bodyColor }}>
            <MessageRenderer fragments={frags} emotesMap={emotesMap} />
          </span>
        </>
      )}
    </div>
  );
});
