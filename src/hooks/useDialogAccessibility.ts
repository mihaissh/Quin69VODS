"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function listFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Modal dialog a11y: Escape to close, Tab cycle inside container, optional initial
 * focus ref, restore focus on close, body scroll lock while open.
 */
export function useDialogAccessibility(options: {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onRequestClose: () => void;
  /** If set, focused on open; otherwise first tabbable in `containerRef`. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}): void {
  const { open, containerRef, onRequestClose, initialFocusRef } = options;
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onRequestClose);

  useEffect(() => {
    onCloseRef.current = onRequestClose;
  }, [onRequestClose]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      const root = containerRef.current;
      if (!root) return;
      const initial = initialFocusRef?.current;
      if (initial && root.contains(initial)) {
        initial.focus();
        return;
      }
      const list = listFocusable(root);
      list[0]?.focus();
    };
    const id = requestAnimationFrame(focusInitial);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const root = containerRef.current;
      if (!root) return;
      const list = listFocusable(root);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!root.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    };
  }, [open, containerRef, initialFocusRef]);
}
