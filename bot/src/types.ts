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
