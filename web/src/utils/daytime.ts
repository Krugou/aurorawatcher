import SunCalc from 'suncalc';

export const isDaytime = (lat: number, lon: number): boolean => {
  const now = new Date();
  const times = SunCalc.getTimes(now, lat, lon);

  // Simple logic: If current time is between sunrise and sunset
  // Note: In polar regions, sunrise might be undefined (polar night) or sunset undefined (midnight sun)

  // Handling polar edge cases
  if (!times.sunrise || !times.sunset) {
    // If no sunrise/sunset, check solar altitude
    const position = SunCalc.getPosition(now, lat, lon);
    // If sun is > -6 degrees (civil twilight), it's too bright for auroras
    return position.altitude > -0.1; // roughly -6 degrees in radians is -0.1
  }

  // Normal day
  return now > times.sunrise && now < times.sunset;
};
