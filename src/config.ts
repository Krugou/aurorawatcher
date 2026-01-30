import type { AuroraConfig } from './types.js';

// Image URLs
export const IMAGE_URLS = {
	muonio: 'https://space.fmi.fi/MIRACLE/RWC/latest_MUO.jpg',
	nyrola: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR.jpg',
	hankasalmi: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg',
	metsahovi: 'https://space.fmi.fi/MIRACLE/RWC/latest_HOV.jpg',
	auroraData: 'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png',
} as const;

// Location info for each observatory
export const LOCATIONS = {
	muonio: {
		name: 'Muonio, Finland',
		mapUrl: 'https://maps.app.goo.gl/rmr9YMBuR66GCB2X8',
	},
	nyrola: {
		name: 'Nyrölä Observatory, Finland',
		mapUrl: 'https://maps.app.goo.gl/m9AHq8wxAhJyBVUMA',
	},
	hankasalmi: {
		name: 'Hankasalmi observatory Jyväskylän Sirius ry',
		mapUrl: 'https://maps.app.goo.gl/sDCpGgSkcMKgDojh6',
	},
	metsahovi: {
		name: 'Metsähovin radiotutkimusasema(Aalto yliopisto)',
		mapUrl: 'https://maps.app.goo.gl/BG3JC7uHLLcdi5C1A',
	},
} as const;

// Aurora activity reference URL
export const AURORA_INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

// Discord channel configuration
export const AURORA_CONFIG: AuroraConfig = {
	channelID: '1020376168496627742',
	startMessageChannelID: '1090689756553293885',
	latitude: 60.218393049680394,
	longitude: 24.39386623193809,
};

// Color thresholds for aurora detection
export const AURORA_COLORS = {
	high: { red: 238, green: 102, blue: 119 }, // #EE6677
	low: { red: 204, green: 187, blue: 68 },   // #CDBA44
} as const;

// Command prefix
export const PREFIX = '!';
