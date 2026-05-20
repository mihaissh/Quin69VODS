"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";

const LS_DELAY  = "chatUserDelaySeconds";
const LS_ALT_BG = "chatAlternativeBg";

const DELAY_HINT_ID = "chat-settings-delay-hint";
const MAX_DELAY_SEC = 600;

export interface ChatSettingsState {
  userDelaySec:  number;
  alternativeBg: boolean;
}

interface ChatSettingsProps {
  onClose: () => void;
  value:   ChatSettingsState;
  onSave:  (next: ChatSettingsState) => void;
}

export function readChatSettings(): ChatSettingsState {
  if (typeof window === "undefined") {
    return {
      userDelaySec:  0,
      alternativeBg: true,
    };
  }
  const rawDelay = Number.parseInt(localStorage.getItem(LS_DELAY) ?? "0", 10);
  const delay = Number.isNaN(rawDelay) ? 0 : Math.min(MAX_DELAY_SEC, Math.max(0, rawDelay));
  return {
    userDelaySec:  delay,
    alternativeBg: localStorage.getItem(LS_ALT_BG) !== "false",
  };
}

export function persistChatSettings(s: ChatSettingsState) {
  localStorage.setItem(LS_DELAY, String(s.userDelaySec));
  localStorage.setItem(LS_ALT_BG, String(s.alternativeBg));
}

/** Mount only while visible so dialog state resets from `value` each time. */
export function ChatSettings({ onClose, value, onSave }: ChatSettingsProps) {
  const [draft, setDraft] = useState(value);
  const dialogRef     = useRef<HTMLDivElement>(null);
  const delayInputRef = useRef<HTMLInputElement>(null);

  useDialogAccessibility({
    open: true,
    containerRef: dialogRef,
    onRequestClose: onClose,
    initialFocusRef: delayInputRef,
  });

  function apply(next: ChatSettingsState) {
    persistChatSettings(next);
    onSave(next);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
        style={{
          background: "var(--color-bg-elevated)",
          border:       "1px solid var(--color-border)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-settings-title"
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h2 id="chat-settings-title" className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Chat settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Close chat settings"
          >
            <Icon icon="mdi:close" className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <label className="block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            Chat delay (seconds)
            <input
              ref={delayInputRef}
              type="number"
              min={0}
              max={MAX_DELAY_SEC}
              value={draft.userDelaySec}
              onChange={(e) => {
                const raw = Number.parseInt(e.target.value, 10);
                const n = Number.isNaN(raw) ? 0 : Math.min(MAX_DELAY_SEC, Math.max(0, raw));
                setDraft((d) => ({ ...d, userDelaySec: n }));
              }}
              aria-describedby={DELAY_HINT_ID}
              className="mt-1 w-full rounded-md px-3 py-2 text-sm"
              style={{
                background: "var(--color-bg-surface)",
                border:     "1px solid var(--color-border)",
                color:      "var(--color-text-primary)",
              }}
            />
          </label>
          <p id={DELAY_HINT_ID} className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Fix desync between video and chat. Range 0–{MAX_DELAY_SEC} seconds.
          </p>

          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color-text-primary)" }}>
            <input
              type="checkbox"
              checked={draft.alternativeBg}
              onChange={() => setDraft((d) => ({ ...d, alternativeBg: !d.alternativeBg }))}
              className="rounded"
            />
            Alternate message backgrounds
          </label>
        </div>

        <div
          className="flex justify-end gap-2 px-4 py-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => apply(draft)}
            className="px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ background: "var(--color-amber)", color: "#111110" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
