import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import 'dotenv/config';

import { AURORA_CONFIG, IMAGE_URLS } from './config.js';
import { getSunriseSunsetTimes, isDark } from './utils/sunTimes.js';
import { hasImageChanged, checkImageColor } from './utils/imageUtils.js';
import {
	createLogger,
	sendAuroraImages,
	sendStartupMessage,
	scheduleChannelCleanup,
} from './services/discordService.js';

const auroraBot = new Client({ intents: [GatewayIntentBits.Guilds] });

auroraBot.login(process.env.DISCORD_TOKEN);

auroraBot.on(Events.ClientReady, () => {
	const startMessageChannel = auroraBot.channels.cache.get(
		AURORA_CONFIG.startMessageChannelID
	) as TextChannel;

	if (!startMessageChannel) {
		console.error('Start message channel not found!');
		return;
	}

	// Create logger
	const log = createLogger(startMessageChannel);

	// Send startup message and schedule cleanup
	sendStartupMessage(startMessageChannel);
	scheduleChannelCleanup(startMessageChannel);

	/**
	 * Main function to check for aurora activity and post images.
	 */
	const checkAndPostAurora = async (): Promise<void> => {
		const channel = auroraBot.channels.cache.get(AURORA_CONFIG.channelID) as TextChannel | undefined;

		if (!channel) {
			console.error('The aurora channel does not exist!');
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
				return;
			}

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
				return;
			}

			// Check if image has changed
			if (await hasImageChanged(IMAGE_URLS.metsahovi)) {
				log('Image has changed');
				await sendAuroraImages(channel);
				log(`Posting image to channel ${channel.name}...`);
			} else {
				log('Image has not changed, skipping image post.');
			}
		} catch (error) {
			console.error('Error checking aurora:', error);
		}
	};

	// Initial check
	if (process.env.RUN_ONCE === 'true') {
		console.log('Running in single-execution mode (RUN_ONCE=true)');
		checkAndPostAurora().then(() => {
			console.log('Single execution finished. Exiting.');
			process.exit(0);
		});
	} else {
		checkAndPostAurora();
		// Set up interval (random 1-10 minutes)
		const intervalInMilliseconds = (Math.floor(Math.random() * 10) + 1) * 60 * 1000;
		setInterval(checkAndPostAurora, intervalInMilliseconds);
		console.log(`Aurora watcher started. Checking every ${intervalInMilliseconds / 60000} minutes.`);
	}
});
