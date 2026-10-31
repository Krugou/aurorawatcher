import { STATION_COORDINATES } from '../utils/auroraUtils';
import { classifyDisturbance, DisturbanceStatus } from '../utils/disturbance';

const FMI_WFS_URL = 'https://opendata.fmi.fi/wfs';
const FEED_BBOX = '57,19,71,32';
const FEED_PARAMETERS = 'MAGNX_PT1M_AVG,MAGNY_PT1M_AVG';
const FEED_TIMESTEP_MINUTES = 10;
// The feed identifies stations by position only, so a sample is matched to the nearest known
// station within this radius.
const MATCH_RADIUS_KM = 25;

export interface StationSample {
  timestamp: number;
  x: number;
  y: number;
  /** Deviation (nT) of the horizontal field from the station's own median over the window. */
  disturbance: number;
}

export interface StationSeries {
  name: string;
  samples: StationSample[];
  latest: StationSample | null;
  peak: number;
  status: DisturbanceStatus;
}

interface RawSample {
  lat: number;
  lon: number;
  time: number;
  parameter: string;
  value: number;
}

const MEMBER_PATTERN =
  /<gml:pos>\s*([-\d.]+)\s+([-\d.]+)\s*<\/gml:pos>[\s\S]*?<BsWfs:Time>([^<]+)<\/BsWfs:Time>\s*<BsWfs:ParameterName>([^<]+)<\/BsWfs:ParameterName>\s*<BsWfs:ParameterValue>([^<]+)<\/BsWfs:ParameterValue>/g;

/** Parses the WFS "simple" feature XML with a regex so it also works in a service worker. */
export const parseFeedXml = (xml: string): RawSample[] => {
  const samples: RawSample[] = [];
  for (const match of xml.matchAll(MEMBER_PATTERN)) {
    const value = Number.parseFloat(match[5]);
    const time = Date.parse(match[3]);
    if (!Number.isFinite(value) || !Number.isFinite(time)) continue;
    samples.push({
      lat: Number.parseFloat(match[1]),
      lon: Number.parseFloat(match[2]),
      time,
      parameter: match[4],
      value,
    });
  }
  return samples;
};

const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const matchStation = (lat: number, lon: number): string | null => {
  let best: string | null = null;
  let bestDistance = MATCH_RADIUS_KM;
  for (const [name, coords] of Object.entries(STATION_COORDINATES)) {
    const distance = distanceKm(lat, lon, coords.lat, coords.lon);
    if (distance < bestDistance) {
      best = name;
      bestDistance = distance;
    }
  }
  return best;
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** Groups raw feed rows into one disturbance series per known station. */
export const buildStationSeries = (rows: RawSample[]): StationSeries[] => {
  const byStation = new Map<string, Map<number, { x?: number; y?: number }>>();

  for (const row of rows) {
    const name = matchStation(row.lat, row.lon);
    if (!name) continue;
    const isX = row.parameter.startsWith('MAGNX');
    const isY = row.parameter.startsWith('MAGNY');
    if (!isX && !isY) continue;
    const times = byStation.get(name) ?? new Map();
    const entry = times.get(row.time) ?? {};
    if (isX) entry.x = row.value;
    else entry.y = row.value;
    times.set(row.time, entry);
    byStation.set(name, times);
  }

  const result: StationSeries[] = [];
  for (const [name, times] of byStation) {
    const complete = [...times.entries()]
      .filter((entry): entry is [number, { x: number; y: number }] => {
        return entry[1].x !== undefined && entry[1].y !== undefined;
      })
      .sort((a, b) => a[0] - b[0]);
    if (complete.length === 0) continue;

    const baseX = median(complete.map(([, v]) => v.x));
    const baseY = median(complete.map(([, v]) => v.y));
    const samples = complete.map(([timestamp, v]) => ({
      timestamp,
      x: v.x,
      y: v.y,
      disturbance: Math.round(Math.hypot(v.x - baseX, v.y - baseY) * 10) / 10,
    }));
    const latest = samples[samples.length - 1];
    result.push({
      name,
      samples,
      latest,
      peak: Math.max(...samples.map((s) => s.disturbance)),
      status: classifyDisturbance(latest.disturbance),
    });
  }
  return result.sort((a, b) => STATION_ORDER.indexOf(a.name) - STATION_ORDER.indexOf(b.name));
};

const STATION_ORDER = Object.keys(STATION_COORDINATES);

/** Stations that never appear in the open feed and must still be read from the map image. */
export const getStationsMissingFromFeed = (series: StationSeries[]): string[] => {
  const covered = new Set(series.map((s) => s.name));
  return STATION_ORDER.filter((name) => !covered.has(name));
};

/** Closest station that actually has live feed data, with its distance. */
export const findNearestFeedStation = (
  series: StationSeries[],
  lat: number,
  lon: number,
): { station: StationSeries; distanceKm: number } | null => {
  let best: { station: StationSeries; distanceKm: number } | null = null;
  for (const station of series) {
    const coords = STATION_COORDINATES[station.name];
    if (!coords) continue;
    const distance = distanceKm(lat, lon, coords.lat, coords.lon);
    if (!best || distance < best.distanceKm) best = { station, distanceKm: distance };
  }
  return best;
};

export const fetchStationFeed = async (
  hours = 24,
  fetchImpl: typeof fetch = fetch,
): Promise<StationSeries[]> => {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'getFeature',
    storedquery_id: 'fmi::observations::magnetometer::simple',
    bbox: FEED_BBOX,
    starttime: start.toISOString(),
    endtime: end.toISOString(),
    timestep: String(FEED_TIMESTEP_MINUTES),
    parameters: FEED_PARAMETERS,
  });
  const response = await fetchImpl(`${FMI_WFS_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`FMI magnetometer feed failed (${response.status})`);
  return buildStationSeries(parseFeedXml(await response.text()));
};

const CACHE_TTL = 5 * 60 * 1000;
let cached: { at: number; promise: Promise<StationSeries[]> } | null = null;

/** Shares one 24h request between every component that needs the feed. */
export const getStationFeed = (): Promise<StationSeries[]> => {
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.promise;
  const promise = fetchStationFeed();
  cached = { at: Date.now(), promise };
  promise.catch(() => {
    if (cached?.promise === promise) cached = null;
  });
  return promise;
};

export const resetStationFeedCache = () => {
  cached = null;
};
