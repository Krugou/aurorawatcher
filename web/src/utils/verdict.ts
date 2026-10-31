import * as SunCalc from 'suncalc';

export type FieldStatus = 'HIGH' | 'MODERATE' | 'LOW' | 'QUIET' | 'UNKNOWN';
export type VerdictLevel = 'go' | 'maybe' | 'wait' | 'nogo' | 'daylight';
export type LimitingFactor = 'darkness' | 'cloud' | 'moon' | 'activity' | 'none';

export interface VerdictInput {
  lat: number;
  lon: number;
  date: Date;
  /** Cloud cover in percent (0-100). */
  cloudCover: number;
  fieldStatus: FieldStatus;
  kp: number;
  bz: number;
}

export interface Verdict {
  level: VerdictLevel;
  /** 0-100 chance that aurora is both active and actually visible. */
  score: number;
  /** 0-1, how well the sky lets any aurora through (darkness x cloud x moon). */
  visibility: number;
  /** 0-1, how active the aurora is expected to be. */
  activity: number;
  factors: { darkness: number; cloud: number; moon: number };
  sunAltitude: number;
  moonAltitude: number;
  moonIllumination: number;
  limiting: LimitingFactor;
}

const DEG = 180 / Math.PI;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const FIELD_ACTIVITY: Record<FieldStatus, number> = {
  HIGH: 1,
  MODERATE: 0.7,
  LOW: 0.4,
  QUIET: 0.1,
  UNKNOWN: 0.1,
};

export const getActivity = (fieldStatus: FieldStatus, kp: number, bz: number, lat: number) => {
  const solar = clamp((kp * 10 + (bz < 0 ? Math.abs(bz) * 5 : 0)) / 100);
  const activity = Math.max(FIELD_ACTIVITY[fieldStatus], solar * 0.8);
  // Below 62°N the oval rarely reaches overhead unless a storm is under way.
  return lat < 62 && kp < 5 ? activity * 0.6 : activity;
};

/** The one verdict the Local section shows: Go means the sky and the aurora both cooperate. */
export const computeVerdict = (input: VerdictInput): Verdict => {
  const { lat, lon, date, cloudCover, fieldStatus, kp, bz } = input;
  const sunAltitude = SunCalc.getPosition(date, lat, lon).altitude * DEG;
  const moonPosition = SunCalc.getMoonPosition(date, lat, lon);
  const moonAltitude = moonPosition.altitude * DEG;
  const moonIllumination = SunCalc.getMoonIllumination(date).fraction;

  // 0 in daylight/civil twilight (sun above -6°), full dark at -18°.
  const darkness = sunAltitude >= -6 ? 0 : 0.4 + 0.6 * clamp((-sunAltitude - 6) / 12);
  const cloud = clamp(1 - cloudCover / 100);
  const moon = moonAltitude > 0 ? 1 - 0.45 * moonIllumination * clamp(moonAltitude / 30) : 1;
  const visibility = darkness * cloud * moon;
  const activity = getActivity(fieldStatus, kp, bz, lat);
  const score = Math.round(visibility * activity * 100);

  let level: VerdictLevel;
  if (darkness === 0) level = 'daylight';
  else if (cloudCover > 70) level = 'nogo';
  else if (visibility >= 0.5 && activity >= 0.5) level = 'go';
  else if (visibility >= 0.35 && activity >= 0.25) level = 'maybe';
  else level = 'wait';

  let limiting: LimitingFactor = 'none';
  if (level !== 'go') {
    const candidates: [LimitingFactor, number][] = [
      ['darkness', darkness],
      ['cloud', cloud],
      ['moon', moon],
      ['activity', activity],
    ];
    limiting = candidates.reduce((lowest, next) => (next[1] < lowest[1] ? next : lowest))[0];
  }

  return {
    level,
    score,
    visibility,
    activity,
    factors: { darkness, cloud, moon },
    sunAltitude,
    moonAltitude,
    moonIllumination,
    limiting,
  };
};

export interface TimelineSlot {
  time: number;
  verdict: Verdict;
}

export interface NightTimeline {
  slots: TimelineSlot[];
  /** Best contiguous window, or null when no hour is worth going out for. */
  best: { start: number; end: number; score: number } | null;
}

const HOUR = 60 * 60 * 1000;

/**
 * Scores each of the next hours using the forecast cloud cover (current observation where the
 * forecast has no data) while assuming tonight's activity stays as it is now.
 */
export const buildNightTimeline = (
  base: Omit<VerdictInput, 'date' | 'cloudCover'>,
  currentCloudCover: number,
  forecast: { time: number; cloudCover: number }[],
  now: Date,
  hours = 18,
): NightTimeline => {
  const start = Math.floor(now.getTime() / HOUR) * HOUR + HOUR;
  const slots: TimelineSlot[] = [];

  for (let i = 0; i < hours; i++) {
    const time = start + i * HOUR;
    const nearest = forecast.reduce<{ time: number; cloudCover: number } | null>(
      (best, point) =>
        !best || Math.abs(point.time - time) < Math.abs(best.time - time) ? point : best,
      null,
    );
    const cloudCover =
      nearest && Math.abs(nearest.time - time) <= 90 * 60 * 1000
        ? nearest.cloudCover
        : currentCloudCover;
    slots.push({ time, verdict: computeVerdict({ ...base, date: new Date(time), cloudCover }) });
  }

  const top = Math.max(...slots.map((s) => s.verdict.score));
  if (top < 15) return { slots, best: null };

  const peak = slots.findIndex((s) => s.verdict.score === top);
  const floor = top * 0.8;
  let first = peak;
  let last = peak;
  while (first > 0 && slots[first - 1].verdict.score >= floor) first--;
  while (last < slots.length - 1 && slots[last + 1].verdict.score >= floor) last++;

  return { slots, best: { start: slots[first].time, end: slots[last].time + HOUR, score: top } };
};
