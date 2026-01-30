import * as crypto from 'crypto';
import { Jimp } from 'jimp';

let previousHash = '';

/**
 * Checks if the image at the specified URL has changed.
 * @param imageUrl - The URL of the image to check.
 * @returns A promise that resolves to true if the image has changed, false otherwise.
 */
export const hasImageChanged = async (imageUrl: string): Promise<boolean> => {
	const response = await fetch(imageUrl);
	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	const hash = crypto.createHash('sha1');
	hash.update(buffer);
	const currentHash = hash.digest('hex');

	if (previousHash !== currentHash) {
		previousHash = currentHash;
		return true;
	}
	return false;
};

/**
 * Resets the image hash (useful for testing).
 */
export const resetImageHash = (): void => {
	previousHash = '';
};

// Aurora activity color thresholds
const AURORA_COLORS = {
	high: { red: 238, green: 102, blue: 119 }, // #EE6677
	low: { red: 204, green: 187, blue: 68 },   // #CDBA44
} as const;

/**
 * Checks if an image contains specific aurora indicator colors.
 * @param imageUrl - URL of the image to check.
 * @param onHighDetected - Callback when high aurora activity is detected.
 * @param onLowDetected - Callback when low aurora activity is detected.
 * @returns A promise that resolves to a boolean indicating whether the image contains aurora colors.
 */
export const checkImageColor = async (
	imageUrl: string,
	onHighDetected?: () => void,
	onLowDetected?: () => void
): Promise<boolean> => {
	const image = await Jimp.read(imageUrl);

	let containsColor = false;
	let highMessageSent = false;
	let lowMessageSent = false;

	const { width, height, data } = image.bitmap;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const red = data[idx];
			const green = data[idx + 1];
			const blue = data[idx + 2];

			// Check for high aurora activity color (#EE6677)
			if (
				red === AURORA_COLORS.high.red &&
				green === AURORA_COLORS.high.green &&
				blue === AURORA_COLORS.high.blue
			) {
				containsColor = true;
				if (!highMessageSent) {
					onHighDetected?.();
					highMessageSent = true;
				}
			}
			// Check for low aurora activity color (#CDBA44)
			else if (
				red === AURORA_COLORS.low.red &&
				green === AURORA_COLORS.low.green &&
				blue === AURORA_COLORS.low.blue
			) {
				containsColor = true;
				if (!lowMessageSent) {
					onLowDetected?.();
					lowMessageSent = true;
				}
			}

			// Early exit if both colors found
			if (highMessageSent && lowMessageSent) {
				return true;
			}
		}
	}

	return containsColor;
};
