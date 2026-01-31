import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { IMAGE_URLS } from '../config.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to web/public/data
// ../../../web/public/data relative to bot/src/utils/historyUtils.ts
// bot/src/utils -> bot/src -> bot -> root -> web -> public -> data
const DATA_DIR = path.resolve(__dirname, '../../../web/public/data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Interface for history data
export interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
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
 * Downloads an image and saves it to the history directory.
 * Returns the relative path to the saved image or null if failed.
 * Uses cyclic naming (HHmm) to overwrite images from previous days.
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

		const now = new Date();
		// Round to nearest 15 minutes
		const minutes = now.getMinutes();
		const roundedMinutes = Math.round(minutes / 15) * 15;
		now.setMinutes(roundedMinutes);
		now.setSeconds(0);
		now.setMilliseconds(0);

		const hours = now.getHours().toString().padStart(2, '0');
		const mins = now.getMinutes().toString().padStart(2, '0');
		const timeSlot = `${hours}${mins}`;

		const filename = `${camId}_${timeSlot}.jpg`;
		const filePath = path.join(HISTORY_DIR, filename);

		await fs.writeFile(filePath, buffer);

		// Update history.json
		await updateHistoryIndex(camId, filename, now.getTime());

		return filename;
	} catch (error) {
		console.error(`Error saving image for ${camId}:`, error);
		return null;
	}
};

/**
 * Updates the history.json index with a new entry.
 */
const updateHistoryIndex = async (camId: string, filename: string, timestamp: number): Promise<void> => {
	try {
		let data: HistoryData;
		try {
			const fileContent = await fs.readFile(HISTORY_FILE, 'utf-8');
			data = JSON.parse(fileContent);
		} catch {
			data = { lastUpdated: Date.now(), entries: [] };
		}

		// Remove existing entry for this specific timestamp/slot if checking for exact duplicates,
        // but since we want history to show valid past points, we just add.
        // Pruning handles the cleanup of the JSON list.
		data.entries.push({
			timestamp,
			camId,
			filename: `history/${filename}` // Store relative path for web consumption
		});

		data.lastUpdated = Date.now();

		await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error('Error updating history index:', error);
	}
};

/**
 * Removes history entries from the JSON index older than the retention period.
 * Does NOT delete files, as they are part of a cyclic set (0000-2345).
 */
export const pruneOldHistory = async (retentionHours = 24): Promise<void> => {
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

		for (const entry of data.entries) {
			if (entry.timestamp > cutoffTime) {
				newEntries.push(entry);
			}
            // Logic to delete files is removed to support cyclic overwriting
		}

		// Update JSON
		if (data.entries.length !== newEntries.length) {
            data.entries = newEntries;
            data.lastUpdated = Date.now();
            await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
            console.log(`Pruned ${data.entries.length - newEntries.length} old entries from history.json.`);
        }

	} catch (error) {
		console.error('Error pruning history:', error);
	}
};
