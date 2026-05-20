"use client";

import { useState, useEffect } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Icon } from "@iconify/react";
import { useChatReplay } from "@/hooks/useChatReplay";
import { useEmotesMaps } from "@/hooks/useEmotes";
import { useBadgeMap } from "@/hooks/useBadges";
import { ChatMessage } from "./ChatMessage";
import { ChatSettings, readChatSettings, type ChatSettingsState } from "./ChatSettings";

interface ChatPanelProps {
  vodId:       string;
  currentTime: number;
  isPlaying:   boolean;
}

const DEFAULT_SETTINGS: ChatSettingsState = {
  userDelaySec:  0,
  alternativeBg: true,
};

export function ChatPanel({ vodId, currentTime, isPlaying }: ChatPanelProps) {
  const [settings, setSettings] = useState<ChatSettingsState>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    /* Persisted settings are read after mount (localStorage is absent during SSR). */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration sync
    setSettings(readChatSettings());
  }, []);

  const { shown, status, simplebarRef, autoScroll, setAutoScroll, handleScroll } =
    useChatReplay(vodId, currentTime, isPlaying, settings.userDelaySec);

  const emotesMap = useEmotesMaps();
  const badges    = useBadgeMap();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-bg-surface)" }}>

      <div
        className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-2 flex-shrink-0 gap-1"
        style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-elevated)" }}
      >
        <div className="w-8" aria-hidden />
        <div className="flex items-center justify-center gap-2 min-w-0">
          <Icon icon="mdi:chat-outline" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-amber)" }} />
          <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
            Chat Replay
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded-md transition-colors flex-shrink-0"
          style={{ color: "var(--color-text-muted)" }}
          title="Chat settings"
          aria-label="Chat settings"
        >
          <Icon icon="mdi:cog" className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative min-h-0">
        {status === "loading" && (
          <div className="flex items-center justify-center h-full gap-2">
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--color-amber)", borderTopColor: "transparent" }}
            />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Loading chat…</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center h-full px-4 text-center">
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Chat replay unavailable.
            </p>
          </div>
        )}

        {status === "ready" && (
          <SimpleBar
            ref={simplebarRef}
            autoHide={false}
            style={{ height: "100%", maxHeight: "100%", overflowX: "hidden" }}
            onScrollCapture={handleScroll}
          >
            <div
              className="py-2 flex flex-col justify-end min-h-full"
              role="region"
              aria-label="Chat replay messages"
            >
              {!isPlaying && shown.length === 0 && (
                <p className="px-3 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
                  Press play to start chat replay
                </p>
              )}
              {shown.map((c, i) => (
                <ChatMessage
                  key={c.id}
                  comment={c}
                  emotesMap={emotesMap}
                  badges={badges}
                  index={i}
                  altBg={settings.alternativeBg}
                />
              ))}
              <div className="h-2 flex-shrink-0" aria-hidden />
            </div>
          </SimpleBar>
        )}
      </div>

      {!autoScroll && isPlaying && (
        <button
          type="button"
          onClick={() => setAutoScroll(true)}
          aria-label="Resume chat auto-scroll"
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium flex-shrink-0"
          style={{
            background: "var(--color-amber-dim)",
            color:      "var(--color-amber)",
            borderTop:  "1px solid var(--color-border)",
          }}
        >
          <Icon icon="mdi:pause" className="w-3.5 h-3.5" aria-hidden />
          Chat paused — tap to resume
        </button>
      )}

      {settingsOpen && (
        <ChatSettings
          onClose={() => setSettingsOpen(false)}
          value={settings}
          onSave={setSettings}
        />
      )}
    </div>
  );
}
