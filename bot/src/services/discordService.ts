import { TextChannel, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { IMAGE_URLS, LOCATIONS, AURORA_INFO_URL } from '../config.js';

/**
 * Creates a logger function that logs to both console and a Discord channel.
 * @param channel - The Discord channel to send log messages to.
 * @returns A function that logs messages.
 */
export const createLogger = (channel: TextChannel) => {
	return (message: string): void => {
		channel.send(message);
		console.log(message);
	};
};

/**
 * Sends all aurora observatory images to a Discord channel in a single message using Embeds.
 * @param textChannel - The Discord text channel to send messages to.
 */
export const sendAuroraImages = async (textChannel: TextChannel): Promise<void> => {
	const embeds: EmbedBuilder[] = [];
	const files: AttachmentBuilder[] = [];

	// Helper to add location to embeds and files
	const addLocation = (key: keyof typeof LOCATIONS, imageUrl: string, filename: string) => {
		const location = LOCATIONS[key];
		files.push(new AttachmentBuilder(imageUrl, { name: filename }));
		embeds.push(
			new EmbedBuilder()
				.setTitle(location.name)
				.setURL(location.mapUrl)
				.setImage(`attachment://${filename}`)
				.setColor(0x0099ff)
		);
	};

	// Add observatories
	addLocation('muonio', IMAGE_URLS.muonio, 'muonio.jpg');
	addLocation('nyrola', IMAGE_URLS.nyrola, 'nyrola.jpg');
	addLocation('hankasalmi', IMAGE_URLS.hankasalmi, 'hankasalmi.jpg');
	addLocation('metsahovi', IMAGE_URLS.metsahovi, 'metsahovi.jpg');

	// Add Aurora Data
	files.push(new AttachmentBuilder(IMAGE_URLS.auroraData, { name: 'aurora_data.png' }));
	embeds.push(
		new EmbedBuilder()
			.setTitle('Aurora Data')
			.setURL(AURORA_INFO_URL)
			.setImage('attachment://aurora_data.png')
			.setColor(0xff0000)
	);

	await textChannel.send({ embeds, files });
};

/**
 * Sends a startup message to the log channel.
 * @param channel - The Discord channel to send to.
 */
export const sendStartupMessage = async (channel: TextChannel): Promise<void> => {
	await channel.send('aurorawatcher.ts is now online! ' + new Date().toISOString());
};

/**
 * Cleans up old messages in a channel.
 * @param channel - The Discord channel to clean.
 * @param count - Number of messages to delete.
 * @param delayMs - Delay before cleanup in milliseconds.
 */
export const scheduleChannelCleanup = (
	channel: TextChannel,
	count: number = 50,
	delayMs: number = 20 * 60 * 1000
): void => {
	setTimeout(() => {
		channel.bulkDelete(count);
	}, delayMs);
};
