import type { SunriseSunsetResponse, SunTimes } from '../types.js';

/**
 * Converts a time string to 24-hour format.
 * @param time - The time string in the format "HH:MM:SS AM/PM".
 * @returns The converted time in 24-hour format as a Date object.
 */
export const convertTimeTo24HourFormat = (time: string): Date => {
	const [hours, minutes, seconds, period] = time.split(/[:\s]/);
	const date = new Date();
	date.setUTCHours(
		period.toLowerCase() === 'pm' ? parseInt(hours) + 12 : parseInt(hours),
		parseInt(minutes),
		parseInt(seconds)
	);
	return date;
};

/**
 * Retrieves the sunrise and sunset times for a given latitude and longitude.
 * @param latitude - The latitude of the location.
 * @param longitude - The longitude of the location.
 * @returns The sunrise and sunset hours in UTC format.
 */
export const getSunriseSunsetTimes = async (
	latitude: number,
	longitude: number
): Promise<SunTimes> => {
	const urlSunriseSunset = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}`;

	const response = await fetch(urlSunriseSunset);
	const data: SunriseSunsetResponse = await response.json();

	const { sunrise, sunset } = data.results;

	const sunriseDate = convertTimeTo24HourFormat(sunrise);
	const sunsetDate = convertTimeTo24HourFormat(sunset);

	return {
		sunriseHours: sunriseDate.getUTCHours(),
		sunsetHours: sunsetDate.getUTCHours(),
	};
};

/**
 * Checks if it's currently dark (outside sunrise-sunset hours).
 * @param sunriseHours - The sunrise hour in UTC.
 * @param sunsetHours - The sunset hour in UTC.
 * @returns True if it's dark, false otherwise.
 */
export const isDark = (sunriseHours: number, sunsetHours: number): boolean => {
	const utcHours = new Date().getUTCHours();
	return utcHours < sunriseHours || utcHours > sunsetHours;
};
