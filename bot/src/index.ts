import { Client, Events, GatewayIntentBits, Interaction, TextChannel } from 'discord.js';
import 'dotenv/config';

import { AURORA_CONFIG } from './config.js';
import { pingCommand } from './commands/ping.js';
import { statusCommand } from './commands/status.js';
import { forceCommand } from './commands/force.js';
import { checkAndPostAurora } from './services/auroraService.js';
import {
	createLogger,
	sendStartupMessage,
	scheduleChannelCleanup,
} from './services/discordService.js';

const auroraBot = new Client({ intents: [GatewayIntentBits.Guilds] });

// Command Collection could be attached to client, but for simplicity using a map here
const commands = new Map();
commands.set(pingCommand.data.name, pingCommand);
commands.set(statusCommand.data.name, statusCommand);
commands.set(forceCommand.data.name, forceCommand);

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

	// Initial check
	if (process.env.RUN_ONCE === 'true') {
		console.log('Running in single-execution mode (RUN_ONCE=true)');
		checkAndPostAurora(auroraBot, log).then(() => {
			console.log('Single execution finished. Exiting.');
			process.exit(0);
		});
	} else {
		checkAndPostAurora(auroraBot, log);
		// Set up interval (random 1-10 minutes)
		const intervalInMilliseconds = (Math.floor(Math.random() * 10) + 1) * 60 * 1000;
		setInterval(() => checkAndPostAurora(auroraBot, log), intervalInMilliseconds);
		console.log(`Aurora watcher started. Checking every ${intervalInMilliseconds / 60000} minutes.`);
	}
});

auroraBot.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
