import { SlashCommandBuilder, TextChannel } from 'discord.js';
import { Command } from '../types.js';
import { checkAndPostAurora } from '../services/auroraService.js';
import { createLogger } from '../services/discordService.js';
import { AURORA_CONFIG } from '../config.js';

export const forceCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('force')
		.setDescription('Forces an immediate check for aurora activity.'),
	execute: async (interaction) => {
		await interaction.deferReply();

		const startMessageChannel = interaction.client.channels.cache.get(
			AURORA_CONFIG.startMessageChannelID
		) as TextChannel;

		const log = createLogger(startMessageChannel);

		try {
			await checkAndPostAurora(interaction.client, log);
			await interaction.editReply('Forced check completed.');
		} catch (error) {
			console.error(error);
			await interaction.editReply('Error occurred while forcing check.');
		}
	},
};
