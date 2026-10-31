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
  cloudCover: number; // 0-100%
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
      cloudCover: details.cloud_area_fraction ?? 0,
    };
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    throw new WeatherError(
      'Failed to fetch weather: ' + (error instanceof Error ? error.message : 'Unknown error'),
    );
  }
};

export interface CloudForecastPoint {
  time: number; // unix ms
  cloudCover: number; // 0-100%
}

/** Hourly cloud-cover forecast (MET Norway locationforecast, global coverage). */
export const fetchCloudForecast = async (
  lat: number,
  lon: number,
): Promise<CloudForecastPoint[]> => {
  const response = await fetch(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) throw new WeatherError(`Forecast API error: ${response.status}`);
  const data = (await response.json()) as {
    properties?: {
      timeseries?: {
        time: string;
        data?: { instant?: { details?: { cloud_area_fraction?: number } } };
      }[];
    };
  };
  return (data.properties?.timeseries ?? []).flatMap((entry) => {
    const cloudCover = entry.data?.instant?.details?.cloud_area_fraction;
    const time = Date.parse(entry.time);
    return typeof cloudCover === 'number' && Number.isFinite(time) ? [{ time, cloudCover }] : [];
  });
};
