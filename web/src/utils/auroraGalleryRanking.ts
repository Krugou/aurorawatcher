export interface AuroraGalleryRankable {
  timestamp: number;
  camId: string;
  score: number;
  greenPixels: number;
  purplePixels: number;
  redPixels: number;
}

export const auroraColorCount = (entry: AuroraGalleryRankable) =>
  entry.greenPixels + entry.purplePixels + entry.redPixels;

export const compareAuroraColor = (a: AuroraGalleryRankable, b: AuroraGalleryRankable) =>
  auroraColorCount(b) - auroraColorCount(a) || b.score - a.score || b.timestamp - a.timestamp;

export const rankAuroraGallery = <T extends AuroraGalleryRankable>(
  entries: readonly T[],
  limit = Number.POSITIVE_INFINITY,
): T[] => [...entries].sort(compareAuroraColor).slice(0, limit);
