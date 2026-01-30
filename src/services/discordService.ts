import { TextChannel } from 'discord.js';
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
 * Sends all aurora observatory images to a Discord channel.
 * @param textChannel - The Discord text channel to send messages to.
 */
export const sendAuroraImages = async (textChannel: TextChannel): Promise<void> => {
	// Muonio
	await textChannel.send({ files: [IMAGE_URLS.muonio] });
	await textChannel.send(LOCATIONS.muonio.name);
	await textChannel.send(LOCATIONS.muonio.mapUrl);

	// Nyrölä
	await textChannel.send({ files: [IMAGE_URLS.nyrola] });
	await textChannel.send(LOCATIONS.nyrola.name);
	await textChannel.send(LOCATIONS.nyrola.mapUrl);

	// Hankasalmi
	await textChannel.send({ files: [IMAGE_URLS.hankasalmi] });
	await textChannel.send(LOCATIONS.hankasalmi.name);
	await textChannel.send(LOCATIONS.hankasalmi.mapUrl);

	// Metsähovi
	await textChannel.send({ files: [IMAGE_URLS.metsahovi] });
	await textChannel.send(LOCATIONS.metsahovi.name);
	await textChannel.send(LOCATIONS.metsahovi.mapUrl);

	// Aurora data
	await textChannel.send({ files: [IMAGE_URLS.auroraData] });
	await textChannel.send(AURORA_INFO_URL);
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
