import { VerdictLevel } from './verdict';

export interface ShareCardContent {
  level: VerdictLevel;
  heading: string;
  verdict: string;
  odds: string;
  reason: string;
  /** Short place label, e.g. the nearest station. Never exact coordinates. */
  place: string;
  factors: { label: string; value: number }[];
  footer: string;
}

const ACCENTS: Record<VerdictLevel, string> = {
  go: '#00d4aa',
  maybe: '#3b82f6',
  wait: '#a78bfa',
  nogo: '#9ca3af',
  daylight: '#fbbf24',
};

const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/** Draws the 1080x1080 verdict card. */
export const drawShareCard = (canvas: HTMLCanvasElement, content: ShareCardContent) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const accent = ACCENTS[content.level];

  const background = ctx.createLinearGradient(0, 0, size, size);
  background.addColorStop(0, '#0a0a0f');
  background.addColorStop(1, '#10141f');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size * 0.3, 0, 40, size * 0.3, 0, size * 0.9);
  glow.addColorStop(0, `${accent}55`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 34px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText(content.heading.toUpperCase(), 80, 120);

  ctx.fillStyle = accent;
  ctx.font = '800 92px system-ui, -apple-system, Segoe UI, sans-serif';
  wrapLines(ctx, content.verdict, size - 160)
    .slice(0, 3)
    .forEach((line, i) => ctx.fillText(line, 80, 270 + i * 106));

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 150px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(content.odds, 80, 640);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '400 38px system-ui, -apple-system, Segoe UI, sans-serif';
  wrapLines(ctx, content.reason, size - 160)
    .slice(0, 2)
    .forEach((line, i) => ctx.fillText(line, 80, 720 + i * 52));

  const barWidth = (size - 160 - 3 * 24) / 4;
  content.factors.slice(0, 4).forEach((factor, i) => {
    const x = 80 + i * (barWidth + 24);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, 850, barWidth, 14);
    ctx.fillStyle = accent;
    ctx.fillRect(x, 850, barWidth * Math.min(1, Math.max(0, factor.value)), 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '500 26px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText(factor.label, x, 902);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 28px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText(content.place, 80, 990);
  ctx.textAlign = 'right';
  ctx.fillText(content.footer, size - 80, 990);
  ctx.textAlign = 'left';
};

export const renderShareCardBlob = (content: ShareCardContent): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  drawShareCard(canvas, content);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Card export failed'))),
      'image/png',
    );
  });
};

/** Shares the card through the native sheet when it can take files, otherwise downloads it. */
export const shareOrDownloadCard = async (
  blob: Blob,
  text: string,
): Promise<'shared' | 'downloaded' | 'cancelled'> => {
  const file = new File([blob], 'aurora-verdict.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
};
