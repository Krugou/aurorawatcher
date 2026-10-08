export interface SolarData {
  bz: number;
  speed: number;
  density: number;
  kp: number;
  timestamp: string;
}

export interface SolarHistoryPoint {
  timestamp: number;
  bz: number;
  speed: number;
  density: number;
  kp?: number;
}

const URLS = {
  current: 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
  history: 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind.json',
  kp: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
};

type NOAARecord = Record<string, unknown>;

const fetchJSON = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NOAA request failed (${response.status})`);
  return response.json() as Promise<unknown>;
};

const getLatestRecord = (records: unknown): NOAARecord | null => {
  if (!Array.isArray(records)) return null;
  return (
    [...records]
      .filter((row): row is NOAARecord => !!row && typeof row === 'object' && !Array.isArray(row))
      .sort((a, b) => Date.parse(String(b.time_tag)) - Date.parse(String(a.time_tag)))[0] ?? null
  );
};

const getProductRows = (product: unknown): NOAARecord[] => {
  if (!Array.isArray(product) || !Array.isArray(product[0])) return [];
  const headers = product[0] as string[];
  return product.slice(1).flatMap((values) => {
    if (!Array.isArray(values)) return [];
    return [Object.fromEntries(headers.map((header, index) => [header, values[index]]))];
  });
};

const numeric = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const fetchSolarData = async (): Promise<SolarData | null> => {
  const [solarProduct, kpProduct] = await Promise.all([
    fetchJSON(URLS.current),
    fetchJSON(URLS.kp),
  ]);
  const solar = getLatestRecord(getProductRows(solarProduct));
  const kp = getLatestRecord(kpProduct);
  if (!solar || !kp) return null;

  const bz = numeric(solar.bz);
  const speed = numeric(solar.speed);
  const density = numeric(solar.density);
  const kpValue = numeric(kp.estimated_kp ?? kp.kp_index);
  if (bz === null || speed === null || density === null || kpValue === null) return null;

  return { bz, speed, density, kp: kpValue, timestamp: String(solar.time_tag) };
};

export const fetchSolarHistory = async (): Promise<SolarHistoryPoint[]> => {
  const product = await fetchJSON(URLS.history);
  return getProductRows(product)
    .flatMap((row) => {
      const timestamp = Date.parse(String(row.time_tag));
      const bz = numeric(row.bz);
      const speed = numeric(row.speed);
      const density = numeric(row.density);
      if (!Number.isFinite(timestamp) || bz === null || speed === null || density === null)
        return [];
      return [{ timestamp, bz, speed, density }];
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};
