import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../types.js';

export const statusCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Shows the current status of the aurora watcher.'),
	execute: async (interaction) => {
		await interaction.reply('Aurora Watcher is currently **active** and monitoring.');
	},
};
