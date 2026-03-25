import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { IMAGE_URLS } from '../config.js';
import sharp from 'sharp';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to web/public/data
// ../../../web/public/data relative to bot/src/utils/historyUtils.ts
// bot/src/utils -> bot/src -> bot -> root -> web -> public -> data
const DATA_DIR = path.resolve(__dirname, '../../../web/public/data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const HISTORY_FILE = path.join(DATA_DIR, 'history_index.json');

// Interface for history data
export interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
  cloudScore?: number; // 0-100, higher means more clouds
}

export interface HistoryData {
  lastUpdated: number;
  entries: HistoryEntry[];
}

/**
 * Ensures the history directory and data file exist.
 */
export const initHistory = async (): Promise<void> => {
	try {
		await fs.mkdir(HISTORY_DIR, { recursive: true });

		try {
			await fs.access(HISTORY_FILE);
		} catch {
			// Create empty history file if it doesn't exist
			const initialData: HistoryData = { lastUpdated: Date.now(), entries: [] };
			await fs.writeFile(HISTORY_FILE, JSON.stringify(initialData, null, 2));
		}
	} catch (error) {
		console.error('Error initializing history:', error);
	}
};

/**
 * Detects cloud cover score based on image statistics.
 * Clouds at night are usually brighter than clear sky and have less contrast (lower variance).
 */
export const detectCloudScore = async (image: sharp.Sharp): Promise<number> => {
	try {
		const stats = await image.stats();
		const { channels } = stats;
		
		// Use luminance (approx from RGB)
		const mean = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
		const stdev = (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3;

		// A very dark image (mean < 10) is likely clear or at least not "cloud-glow" bright
		// A bright image (mean > 50) with low variance (stdev < 30) is likely cloudy
		// This is a heuristic that can be tuned.
		
		let score = 0;
		if (mean > 30) {
			// As mean increases and stdev decreases, cloud score goes up
			score = Math.min(100, (mean / (stdev + 1)) * 20);
		}
		
		return Math.round(score);
	} catch (error) {
		console.error('Error detecting cloud score:', error);
		return 0;
	}
};

/**
 * Downloads an image and saves it to the history directory.
 * Returns the relative path to the saved image or null if failed.
 */
export const saveImageToHistory = async (camId: string, url: string): Promise<string | null> => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`Failed to fetch image for ${camId}: ${response.statusText}`);
			return null;
		}

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Optimize image for storage while keeping dynamic range
		// Using high-quality WebP (lossy but high quality) or lossless WebP
		// WebP at 85 quality is usually much smaller than JPEG but looks identical
		const image = sharp(buffer);
		
		// Only calculate cloud score for camera images, not data maps
		let cloudScore = 0;
		if (camId !== 'auroraData') {
			cloudScore = await detectCloudScore(image);
		}

		// Compress and save
		const optimizedBuffer = await image
			.webp({ quality: 85, smartSubsample: true })
			.toBuffer();

		const now = new Date();
		// Round to nearest 15 minutes
		const minutes = now.getMinutes();
		const roundedMinutes = Math.round(minutes / 15) * 15;
		now.setMinutes(roundedMinutes);
		now.setSeconds(0);
		now.setMilliseconds(0);

		const year = now.getFullYear();
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const hours = now.getHours().toString().padStart(2, '0');
		const mins = now.getMinutes().toString().padStart(2, '0');

		// Use .webp extension
		const filename = `${camId}_${year}${month}${day}_${hours}${mins}.webp`;
		const filePath = path.join(HISTORY_DIR, filename);

		await fs.writeFile(filePath, optimizedBuffer);

		// Update history.json
		await updateHistoryIndex(camId, filename, now.getTime(), cloudScore);

		return filename;
	} catch (error) {
		console.error(`Error saving image for ${camId}:`, error);
		return null;
	}
};

/**
 * Updates the history.json index with a new entry.
 */
const updateHistoryIndex = async (camId: string, filename: string, timestamp: number, cloudScore?: number): Promise<void> => {
	try {
		let data: HistoryData;
		try {
			const fileContent = await fs.readFile(HISTORY_FILE, 'utf-8');
			data = JSON.parse(fileContent);
		} catch {
			data = { lastUpdated: Date.now(), entries: [] };
		}

		data.entries.push({
			timestamp,
			camId,
			filename: `history/${filename}`,
			cloudScore
		});

		data.lastUpdated = Date.now();

		await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error('Error updating history index:', error);
	}
};

/**
 * Removes history entries from the JSON index older than the retention period.
 * Also deletes the corresponding files from disk.
 */
export const pruneOldHistory = async (retentionHours = 720): Promise<void> => {
	try {
		const retentionMs = retentionHours * 60 * 60 * 1000;
		const cutoffTime = Date.now() - retentionMs;

		let data: HistoryData;
		try {
			const fileContent = await fs.readFile(HISTORY_FILE, 'utf-8');
			data = JSON.parse(fileContent);
		} catch {
			return; // Nothing to prune
		}

		const newEntries: HistoryEntry[] = [];
		const filesToDelete: string[] = [];

		for (const entry of data.entries) {
			if (entry.timestamp > cutoffTime) {
				newEntries.push(entry);
			} else {
				// Mark file for deletion
				// Entry filename is like 'history/cam_date_time.jpg', we need actual filename
				const actualFilename = path.basename(entry.filename);
				filesToDelete.push(actualFilename);
			}
		}

		// Delete files
		for (const file of filesToDelete) {
			try {
				const fullPath = path.join(HISTORY_DIR, file);
				await fs.unlink(fullPath);
			} catch (err) {
				// Ignore if file doesn't exist
			}
		}

		// Update JSON
		if (data.entries.length !== newEntries.length) {
            data.entries = newEntries;
            data.lastUpdated = Date.now();
            await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
            console.log(`Pruned ${filesToDelete.length} old images.`);
        }

	} catch (error) {
		console.error('Error pruning history:', error);
	}
};
