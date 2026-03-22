import SunCalc from 'suncalc';

export enum VisibilityStatus {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  DAYLIGHT = 'DAYLIGHT',
  OPTIMAL = 'OPTIMAL',
}

export interface DaylightReport {
  isTooBright: boolean;
  statusMessage: string;
  probability: number; // 0-100%
  status: VisibilityStatus;
}

/**
 * Calculates the probability of viewing auroras based on Sun position, Cloud cover, and Magnetic activity.
 * @param lat Latitude
 * @param lon Longitude
 * @param cloudCover Cloud cover percentage (0-100)
 * @param magneticActivity Magnetic activity level ('HIGH' | 'MODERATE' | 'LOW' | 'QUIET' | 'UNKNOWN')
 * @returns DaylightReport
 */
export const getViewingProbability = (
  lat: number,
  lon: number,
  cloudCover: number,
  magneticActivity: 'HIGH' | 'MODERATE' | 'LOW' | 'QUIET' | 'UNKNOWN',
): DaylightReport => {
  const now = new Date();
  const sunPos = SunCalc.getPosition(now, lat, lon);

  // Convert -6 degrees to radians: -6 * (Math.PI / 180) ~= -0.1047
  // Civil twilight is when the sun is between 0 and -6 degrees.
  // Auroras are visible when the sun is below -6 degrees.
  const CIVIL_TWILIGHT_HEIGHT = -6 * (Math.PI / 180);

  const isTooBright = sunPos.altitude > CIVIL_TWILIGHT_HEIGHT;

  if (isTooBright) {
    return {
      isTooBright: true,
      statusMessage: 'common.daylight.too_bright',
      probability: 0,
      status: VisibilityStatus.DAYLIGHT,
    };
  }

  // Calculate base score from clouds
  // 100% cloudy -> 0% viewability, 0% cloudy -> 100% viewability
  const cloudScore = Math.max(0, 100 - cloudCover);

  // Magnetic activity multiplier
  let activityMultiplier = 0.1; // Default/QUIET
  switch (magneticActivity) {
    case 'HIGH':
      activityMultiplier = 1.0;
      break;
    case 'MODERATE':
      activityMultiplier = 0.7;
      break;
    case 'LOW':
      activityMultiplier = 0.4;
      break;
    case 'QUIET':
      activityMultiplier = 0.1;
      break;
    default:
      activityMultiplier = 0.1;
  }

  // Final probability is a weighted combination
  // Even if it's clear, if there's no activity, probability is low.
  // Even if there's high activity, if it's 100% cloudy, probability is 0.
  const probability = Math.round(cloudScore * activityMultiplier);

  let status = VisibilityStatus.CLEAR;
  let statusMessage = 'common.daylight.clear_sky';

  if (cloudCover > 70) {
    status = VisibilityStatus.CLOUDY;
    statusMessage = 'common.daylight.too_cloudy';
  } else if (probability > 70) {
    status = VisibilityStatus.OPTIMAL;
    statusMessage = 'common.daylight.optimal';
  } else if (cloudCover <= 30) {
    status = VisibilityStatus.CLEAR;
    statusMessage = 'common.daylight.clear_sky';
  } else {
    status = VisibilityStatus.CLEAR;
    statusMessage = 'common.daylight.partly_cloudy';
  }

  return {
    isTooBright: false,
    statusMessage,
    probability,
    status,
  };
};
