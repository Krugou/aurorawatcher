import { Client, TextChannel, ActivityType } from 'discord.js';
import { AURORA_CONFIG, IMAGE_URLS } from '../config.js';
import { getSunriseSunsetTimes, isDark } from '../utils/sunTimes.js';
import { hasImageChanged, checkImageColor } from '../utils/imageUtils.js';
import { createLogger, sendAuroraImages } from './discordService.js';
import { initHistory, saveImageToHistory, pruneOldHistory } from '../utils/historyUtils.js';

export interface ExecutionSummary {
	isDark: boolean;
	auroraActivityDetected: boolean;
	imagesSaved: number;
	imageChanged: boolean;
	outcome: string;
}

export const checkAndPostAurora = async (client: Client, log: (msg: string) => void): Promise<ExecutionSummary> => {
	const summary: ExecutionSummary = {
		isDark: false,
		auroraActivityDetected: false,
		imagesSaved: 0,
		imageChanged: false,
		outcome: 'Unknown',
	};

	const channel = client.channels.cache.get(AURORA_CONFIG.channelID) as TextChannel | undefined;
	const startMessageChannel = client.channels.cache.get(AURORA_CONFIG.startMessageChannelID) as TextChannel | undefined;

	if (!channel || !startMessageChannel) {
		console.error('Aurora channel or Start message channel does not exist!');
		summary.outcome = 'Error: Missing Channels';
		return summary;
	}


	try {
		// Get sunrise/sunset times
		const { sunriseHours, sunsetHours } = await getSunriseSunsetTimes(
			AURORA_CONFIG.latitude,
			AURORA_CONFIG.longitude
		);

		// Only check during dark hours
		if (!isDark(sunriseHours, sunsetHours)) {
			log(`Sun is out (it's between sunrise and sunset), skipping image post.`);
			client.user?.setActivity('Sun Up ☀️', { type: ActivityType.Watching });
			summary.isDark = false;
			summary.outcome = 'Skipped (Daytime)';
			return summary;
		}

		summary.isDark = true;

		// Initialize history directory
		await initHistory();

		// Save images to history (fire and forget/await parallel)
		const cameras = [
			{ id: 'muonio', url: IMAGE_URLS.muonio },
			{ id: 'nyrola', url: IMAGE_URLS.nyrola },
			{ id: 'hankasalmi', url: IMAGE_URLS.hankasalmi },
			{ id: 'metsahovi', url: IMAGE_URLS.metsahovi },
			{ id: 'auroraData', url: IMAGE_URLS.auroraData }
		];

		// Save all images sequentially to prevent race conditions on history.json
		for (const cam of cameras) {
			await saveImageToHistory(cam.id, cam.url);
		}
		summary.imagesSaved = cameras.length;

		// Prune old history entries
		await pruneOldHistory();

		client.user?.setActivity('Night Sky 🌌', { type: ActivityType.Watching });

		// Post current image to log channel
		await startMessageChannel.send({ files: [IMAGE_URLS.metsahovi] });

		// Check aurora data image for activity colors
		const containsColor = await checkImageColor(
			IMAGE_URLS.auroraData,
			() => log('Aurora change high'),
			() => log('Aurora change low')
		);

		if (!containsColor) {
			log(`Image doesn't contain #EE6677 or #CDBA44, skipping image post.`);
			// Keep 'Night Sky' or set to 'Low Activity'
			summary.auroraActivityDetected = false;
			summary.outcome = 'No Aurora Activity';
			return summary;
		}

		summary.auroraActivityDetected = true;

		// Check if image has changed
		if (await hasImageChanged(IMAGE_URLS.metsahovi)) {
			log('Image has changed');
			client.user?.setActivity('Aurora Active! 🟢', { type: ActivityType.Watching });
			await sendAuroraImages(channel);
			log(`Posting image to channel ${channel.name}...`);
			summary.imageChanged = true;
			summary.outcome = 'Posted Aurora Update';
		} else {
			log('Image has not changed, skipping image post.');
			summary.imageChanged = false;
			summary.outcome = 'Aurora Active (No Image Change)';
		}
	} catch (error) {
		console.error('Error checking aurora:', error);
		client.user?.setActivity('Error ⚠️', { type: ActivityType.Watching });
		summary.outcome = `Error: ${error instanceof Error ? error.message : String(error)}`;
	}

	return summary;
};
