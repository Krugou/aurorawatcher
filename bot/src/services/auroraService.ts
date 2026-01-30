import { Client, TextChannel, ActivityType } from 'discord.js';
import { AURORA_CONFIG, IMAGE_URLS } from '../config.js';
import { getSunriseSunsetTimes, isDark } from '../utils/sunTimes.js';
import { hasImageChanged, checkImageColor } from '../utils/imageUtils.js';
import { createLogger, sendAuroraImages } from './discordService.js';

export const checkAndPostAurora = async (client: Client, log: (msg: string) => void): Promise<void> => {
	const channel = client.channels.cache.get(AURORA_CONFIG.channelID) as TextChannel | undefined;
	const startMessageChannel = client.channels.cache.get(AURORA_CONFIG.startMessageChannelID) as TextChannel | undefined;

	if (!channel || !startMessageChannel) {
		console.error('Aurora channel or Start message channel does not exist!');
		return;
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
			return;
		}

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
			return;
		}

		// Check if image has changed
		if (await hasImageChanged(IMAGE_URLS.metsahovi)) {
			log('Image has changed');
			client.user?.setActivity('Aurora Active! 🟢', { type: ActivityType.Watching });
			await sendAuroraImages(channel);
			log(`Posting image to channel ${channel.name}...`);
		} else {
			log('Image has not changed, skipping image post.');
		}
	} catch (error) {
		console.error('Error checking aurora:', error);
		client.user?.setActivity('Error ⚠️', { type: ActivityType.Watching });
	}
};
