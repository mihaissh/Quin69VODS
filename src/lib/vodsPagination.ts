/** VODs listed per archive page (API $limit / $skip). */
export const VODS_PAGE_SIZE = 16;

export function vodsTotalPages(total: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / VODS_PAGE_SIZE));
}
