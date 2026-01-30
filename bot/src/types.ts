export interface SunriseSunsetResponse {
	results: {
		sunrise: string;
		sunset: string;
	};
	status: string;
}

export interface SunTimes {
	sunriseHours: number;
	sunsetHours: number;
}

export interface AuroraConfig {
	channelID: string;
	startMessageChannelID: string;
	latitude: number;
	longitude: number;
}

export interface Command {
	data: any; // specific builder type could be imported but 'any' is safe for now to keep it simple or import SlashCommandBuilder
	execute: (interaction: any) => Promise<void>;
}
