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

		const timestamp = Date.now();
		const filename = `${camId}_${timestamp}.jpg`;
		const filePath = path.join(HISTORY_DIR, filename);

		await fs.writeFile(filePath, buffer);

		// Update history.json
		await updateHistoryIndex(camId, filename, timestamp);

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
 * Removes images and history entries older than the specified retention period (default 24 hours).
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
		const filesToDelete: string[] = [];

		for (const entry of data.entries) {
			if (entry.timestamp > cutoffTime) {
				newEntries.push(entry);
			} else {
				// Extract just the filename from the stored path (history/filename.jpg)
				const filename = path.basename(entry.filename);
				filesToDelete.push(path.join(HISTORY_DIR, filename));
			}
		}

		// Update JSON first
		data.entries = newEntries;
		data.lastUpdated = Date.now();
		await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));

		// delete files
		for (const filePath of filesToDelete) {
			try {
				await fs.unlink(filePath);
			} catch (err) {
				console.warn(`Failed to delete old file ${filePath}:`, err);
			}
		}

		console.log(`Pruned ${filesToDelete.length} old images.`);

	} catch (error) {
		console.error('Error pruning history:', error);
	}
};
