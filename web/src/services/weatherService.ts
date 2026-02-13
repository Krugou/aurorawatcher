/**
 * Custom error for weather operations
 */
export class WeatherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherError';
  }
}

export interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  icon: string;
}

/**
 * Fetches current weather for given coordinates using the Norwegian Meteorological Institute API (MET Norway)
 * @param lat Latitude
 * @param lon Longitude
 * @returns WeatherData object
 * @throws WeatherError on failure
 */
export const fetchNorwayWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    throw new WeatherError('Invalid coordinates for weather fetch');
  }
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'socials-app/1.0 aleksi.nokelainen@gmail.com',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new WeatherError(`Weather API error: ${response.status}`);
    }
    const data = await response.json();
    // Defensive: Validate structure
    const timeseries = data?.properties?.timeseries;
    if (!Array.isArray(timeseries) || timeseries.length === 0) {
      throw new WeatherError('No weather data available');
    }
    const now = timeseries[0];
    const details = now?.data?.instant?.details;
    const summary = now?.data?.next_1_hours?.summary;
    if (!details || typeof details.air_temperature !== 'number') {
      throw new WeatherError('Weather details missing');
    }
    return {
      temperature: details.air_temperature,
      description: summary?.symbol_code?.replace(/_/g, ' ') ?? 'Unknown',
      location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      icon: summary?.symbol_code ?? '',
    };
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    throw new WeatherError(
      'Failed to fetch weather: ' + (error instanceof Error ? error.message : 'Unknown error'),
    );
  }
};
