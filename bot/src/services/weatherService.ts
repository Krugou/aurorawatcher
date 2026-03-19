/**
 * Fetches current cloud cover (%) for given coordinates using the MET Norway API.
 * @param lat Latitude
 * @param lon Longitude
 * @returns Cloud cover percentage (0-100)
 */
export const getCloudCover = async (lat: number, lon: number): Promise<number> => {
	try {
		const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'aurora-watcher-bot/1.0 aleksi.nokelainen@gmail.com',
				Accept: 'application/json',
			},
		});
		if (!response.ok) {
			console.warn(`Weather API error: ${response.status}`);
			return 0;
		}
		const data = await response.json();
		const now = data?.properties?.timeseries?.[0];
		const cloudCover = now?.data?.instant?.details?.cloud_area_fraction;
		return typeof cloudCover === 'number' ? cloudCover : 0;
	} catch (error) {
		console.error('Failed to fetch cloud cover:', error);
		return 0;
	}
};
