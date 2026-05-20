import type { ChatComment, ChatFragment } from "@/types/vod";

/** Twitch IRC / Helix-style action ( /me message ). */
export function isChatAction(comment: ChatComment): boolean {
  const c = comment as ChatComment & {
    message_type?: string;
    comment_type?: string;
    is_action?: boolean;
  };
  if (c.is_action === true) return true;
  const mt = (c.message_type ?? c.comment_type ?? "").toLowerCase();
  if (mt === "action" || mt === "useraction") return true;
  const body = typeof c.message === "string" ? c.message : "";
  if (body.startsWith("\u0001ACTION ") && body.endsWith("\u0001")) return true;
  return false;
}

/** Normalize API payload to a fragment array (Twitch / Helix-style). */
export function normalizeMessageFragments(comment: ChatComment): ChatFragment[] {
  const c = comment as ChatComment & { fragments?: ChatFragment[] };
  if (Array.isArray(c.fragments) && c.fragments.length > 0) return c.fragments;
  const message = comment.message;
  if (Array.isArray(message)) return message;
  if (typeof message === "string" && message.length > 0) {
    return [{ text: message, emote: null, cheermote: null }];
  }
  return [];
}

export function chatDisplayName(comment: ChatComment): string {
  const c = comment as ChatComment & { user_login?: string; user_name?: string };
  const name = (comment.display_name ?? "").trim();
  if (name.length > 0) return name;
  const login = (c.user_login ?? c.user_name ?? "").trim();
  if (login.length > 0) return login;
  return "Anonymous";
}
