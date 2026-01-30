import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { pingCommand } from './commands/ping.js';
import { statusCommand } from './commands/status.js';
import { forceCommand } from './commands/force.js';

const commands = [
	pingCommand.data.toJSON(),
	statusCommand.data.toJSON(),
	forceCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		// Use applicationCommands for global commands (takes up to 1 hour to propagate)
		// Or applicationGuildCommands for instant guild-specific updates (better for dev)
		// Assuming global for now for simplicity, or we can add GUILD_ID to .env

		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID!),
			{ body: commands }
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
