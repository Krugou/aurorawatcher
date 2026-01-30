import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../types.js';

export const pingCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	execute: async (interaction) => {
		await interaction.reply('Pong!');
	},
};
