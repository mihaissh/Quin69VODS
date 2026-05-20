/**
 * Chat row backgrounds from design tokens (`globals.css` @theme).
 * Usernames must meet 4.5:1 on both alternating row surfaces.
 */
const CHAT_BG_SURFACE   = "#1c1a18"; /* --color-bg-surface */
const CHAT_BG_ELEVATED  = "#252220"; /* --color-bg-elevated */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized.split("").map((c) => c + c).join("")
      : normalized;
  const bigint = parseInt(full, 16);
  if (Number.isNaN(bigint)) return null;
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const srgb = [r, g, b].map((v) => v / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 21;
  const L1 = relativeLuminance(rgbA) + 0.05;
  const L2 = relativeLuminance(rgbB) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

/** Twitch-style hex colors that fail on either chat row surface get a readable fallback. */
export function ensureAccessibleTextColor(userHex: string | undefined): string {
  if (!userHex || typeof userHex !== "string" || !userHex.startsWith("#")) return "#e5e7eb";
  try {
    const onSurface  = contrastRatio(userHex, CHAT_BG_SURFACE);
    const onElevated = contrastRatio(userHex, CHAT_BG_ELEVATED);
    if (onSurface < 4.5 || onElevated < 4.5) return "#e5e7eb";
    return userHex;
  } catch {
    return "#e5e7eb";
  }
}
