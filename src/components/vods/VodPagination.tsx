"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { vodsTotalPages } from "@/lib/vodsPagination";

interface VodPaginationProps {
  page: number;
  total: number;
  loading: boolean;
  onPageChange: (nextPage: number) => void;
}

const inputStyle: React.CSSProperties = {
  width: "3.25rem",
  textAlign: "center",
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
  borderRadius: "var(--radius-md)",
  padding: "6px 4px",
  fontSize: "0.8125rem",
  fontFamily: "var(--font-mono)",
  MozAppearance: "textfield",
};

export function VodPagination({ page, total, loading, onPageChange }: VodPaginationProps) {
  const totalPages = vodsTotalPages(total);
  const safePage = Math.min(Math.max(1, page), totalPages);

  const [draft, setDraft] = useState(String(safePage));

  useEffect(() => {
    setDraft(String(safePage));
  }, [safePage]);

  const commitDraft = useCallback(() => {
    if (total === 0 || totalPages < 1) {
      setDraft("1");
      return;
    }
    const n = Number.parseInt(draft.trim(), 10);
    if (!Number.isFinite(n)) {
      setDraft(String(safePage));
      return;
    }
    const clamped = Math.min(Math.max(1, n), totalPages);
    setDraft(String(clamped));
    if (clamped !== safePage) onPageChange(clamped);
  }, [draft, onPageChange, safePage, total, totalPages]);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-3 py-8"
      aria-label="VOD archive pages"
    >
      <button
        type="button"
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage <= 1 || loading}
        aria-label="Previous page"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-bg-elevated)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <Icon icon="mdi:chevron-left" className="w-4 h-4" aria-hidden />
        Prev
      </button>

      <label className="flex items-center gap-2 text-xs font-semibold tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>Page</span>
        <input
          type="number"
          min={1}
          max={Math.max(1, totalPages)}
          value={draft}
          disabled={loading || total === 0}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label="Go to page"
          className="tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={inputStyle}
        />
        <span style={{ fontFamily: "var(--font-mono)" }}>
          / {Math.max(1, totalPages)}
        </span>
      </label>

      <button
        type="button"
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage >= totalPages || loading || total === 0}
        aria-label="Next page"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-bg-elevated)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        Next
        <Icon icon="mdi:chevron-right" className="w-4 h-4" aria-hidden />
      </button>
    </nav>
  );
}
