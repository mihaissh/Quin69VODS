import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// ── Duration helpers ──────────────────────────────────────────────────────────

/**
 * Parse "HH:MM:SS" or "MM:SS" string → total seconds.
 * Also handles plain numbers (already seconds).
 */
export function hmsToSeconds(value: string | number): number {
  if (typeof value === "number") return value;
  const parts = value.split(":").map(Number);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  return Number(value) || 0;
}

/** Seconds → "H:MM:SS" or "M:SS" */
export function toHMS(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Format duration for display: "6h 54m" */
export function formatDuration(value: string | number): string {
  const s = hmsToSeconds(value);
  if (s <= 0) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function formatDate(date: string): string {
  return dayjs(date).format("MMM D, YYYY");
}

// ── Class names ───────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Chapter colors ────────────────────────────────────────────────────────────

export const CHAPTER_COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#ec4899",
  "#8b5cf6", "#f97316", "#06b6d4", "#84cc16",
];
export function chapterColor(index: number): string {
  return CHAPTER_COLORS[index % CHAPTER_COLORS.length] ?? "#f59e0b";
}

