import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

import { analyzeAuroraPixels } from '../web/src/utils/auroraColorDetection';
import {
  AuroraGalleryRankable,
  rankAuroraGallery,
} from '../web/src/utils/auroraGalleryRanking';

interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
  cloudScore?: number;
}

interface GalleryEntry extends HistoryEntry, AuroraGalleryRankable {}

const dataDirectory = path.resolve('web/public/data');
const historyPath = path.join(dataDirectory, 'history_index.json');
const galleryPath = path.join(dataDirectory, 'aurora_gallery.json');
const allowedCameras = new Set(['muonio', 'nyrola', 'hankasalmi', 'metsahovi']);
const archiveImagePath = /^history\/[\w.-]+\.(?:webp|jpe?g|png)$/i;
const scanLimit = 80;
const galleryLimit = 30;

const imageToPixels = async (
  page: import('@playwright/test').Page,
  filePath: string,
): Promise<Uint8ClampedArray> => {
  const image = await fs.readFile(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === '.webp' ? 'image/webp' : extension === '.png' ? 'image/png' : 'image/jpeg';
  const source = `data:${mime};base64,${image.toString('base64')}`;
  const pixels = await page.evaluate(async (dataUrl) => {
    const imageElement = new Image();
    imageElement.src = dataUrl;
    await imageElement.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 64;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not create an image analysis canvas');
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    return Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data);
  }, source);
  return new Uint8ClampedArray(pixels);
};

const readExistingGallery = async (): Promise<GalleryEntry[]> => {
  try {
    const data = JSON.parse(await fs.readFile(galleryPath, 'utf8')) as { entries?: unknown };
    if (!Array.isArray(data.entries)) throw new Error('Existing gallery data is invalid');
    return data.entries as GalleryEntry[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};

const main = async () => {
  const history = JSON.parse(await fs.readFile(historyPath, 'utf8')) as {
    entries: HistoryEntry[];
  };
  const candidates = history.entries
    .filter(
      (entry) =>
        allowedCameras.has(entry.camId) &&
        archiveImagePath.test(entry.filename) &&
        Number.isFinite(entry.timestamp),
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, scanLimit);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const matches: GalleryEntry[] = [];
  try {
    await page.setContent('<!doctype html><html><body></body></html>');
    for (const [index, entry] of candidates.entries()) {
      try {
        const pixels = await imageToPixels(page, path.join(dataDirectory, entry.filename));
        const analysis = analyzeAuroraPixels(pixels);
        if (analysis.hasAurora) {
          matches.push({
            ...entry,
            score: analysis.score,
            greenPixels: analysis.greenPixels,
            purplePixels: analysis.purplePixels,
            redPixels: analysis.redPixels,
          });
        }
      } catch (error) {
        console.warn(`Skipping unreadable image ${entry.filename}: ${String(error)}`);
      }
      if ((index + 1) % 10 === 0 || index + 1 === candidates.length) {
        console.log(`Scanned ${index + 1}/${candidates.length}; found ${matches.length} matches.`);
      }
    }
  } finally {
    await browser.close();
  }

  const merged = new Map(
    (await readExistingGallery()).map((entry) => [`${entry.camId}:${entry.timestamp}`, entry]),
  );
  for (const entry of matches) merged.set(`${entry.camId}:${entry.timestamp}`, entry);
  const entries = rankAuroraGallery([...merged.values()], galleryLimit);
  await fs.writeFile(galleryPath, `${JSON.stringify({ entries }, null, 2)}\n`);
  console.log(
    `Saved ${entries.length} ranked gallery images from ${candidates.length} recent archive images (${matches.length} new matches).`,
  );
};

main().catch((error: unknown) => {
  console.error('Aurora gallery scan failed:', error);
  process.exitCode = 1;
});
