export interface SolarData {
  bz: number; // Interplanetary Magnetic Field (nT)
  speed: number; // Solar wind speed (km/s)
  density: number; // Proton density (p/cm^3)
  kp: number; // Planetary K-index
  timestamp: string;
}

const URLS = {
  mag: 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json',
  plasma: 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json',
  kp: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
};

export const fetchSolarData = async (): Promise<SolarData | null> => {
  try {
    const [magRes, plasmaRes, kpRes] = await Promise.all([
      fetch(URLS.mag),
      fetch(URLS.plasma),
      fetch(URLS.kp),
    ]);

    if (!magRes.ok || !plasmaRes.ok || !kpRes.ok) {
      throw new Error('One or more NOAA endpoints failed');
    }

    const magData = await magRes.json();
    const plasmaData = await plasmaRes.json();
    const kpData = await kpRes.json();

    // Helper to get latest valid row from 2D array [header, row1, row2...]
    const getLatest = (data: any[]) => {
      // Start from end, lookup until valid
      // Row format depends on file.
      // Mag: [time_tag, bz_gsm, bt, ...]
      // Plasma: [time_tag, density, speed, temp]
      // Kp: [time_tag, kp, ...] - actually Kp is object array or similar? No, usually array of arrays for products.
      // Let's check format assumptions.
      // mag-1-day.json: [["time_tag","bx_gsm","by_gsm","bz_gsm","lon_gsm","lat_gsm","bt"],["2023-...",...]]
      // plasma-1-day.json: [["time_tag","density","speed","temperature"],["2023-...",...]]
      // noaa-planetary-k-index.json: [["time_tag","kp_index","a_index"],["2023-...",...]]

      if (!Array.isArray(data) || data.length < 2) return null;
      return data[data.length - 1];
    };

    const latestMag = getLatest(magData);
    const latestPlasma = getLatest(plasmaData);
    const latestKp = getLatest(kpData);

    if (!latestMag || !latestPlasma || !latestKp) return null;

    // Parse values (indices based on header)
    // Mag: time(0), bx(1), by(2), bz(3), ...
    const bz = parseFloat(latestMag[3]);

    // Plasma: time(0), density(1), speed(2), ...
    const density = parseFloat(latestPlasma[1]);
    const speed = parseFloat(latestPlasma[2]);

    // Kp: time(0), kp(1), ...
    const kp = parseFloat(latestKp[1]);

    return {
      bz,
      speed,
      density,
      kp,
      timestamp: latestMag[0], // Use Mag time as primary reference
    };

  } catch (error) {
    console.error('Error fetching solar data:', error);
    return null;
  }
};

export interface SolarHistoryPoint {
    timestamp: number;
    bz: number;
    speed: number;
    density: number;
    kp?: number;
}

export const fetchSolarHistory = async (): Promise<SolarHistoryPoint[]> => {
    try {
        const [magRes, plasmaRes] = await Promise.all([
          fetch(URLS.mag),
          fetch(URLS.plasma),
        ]);

        if (!magRes.ok || !plasmaRes.ok) return [];

        const magData = await magRes.json();
        const plasmaData = await plasmaRes.json();

        // Convert to maps for easy joining by timestamp
        // Data format: [header, row1, row2...]
        // Mag: time(0), ... bz(3)
        // Plasma: time(0), density(1), speed(2)

        const map = new Map<string, Partial<SolarHistoryPoint>>();

        // Process Mag
        if (Array.isArray(magData)) {
            magData.slice(1).forEach(row => {
                const timeStr = row[0];
                const bz = parseFloat(row[3]);
                if (!map.has(timeStr)) map.set(timeStr, { timestamp: new Date(timeStr).getTime() });
                const entry = map.get(timeStr)!;
                entry.bz = bz;
            });
        }

        // Process Plasma
        if (Array.isArray(plasmaData)) {
            plasmaData.slice(1).forEach(row => {
                const timeStr = row[0];
                const density = parseFloat(row[1]);
                const speed = parseFloat(row[2]);

                // Plasma times might not match Mag times exactly (1 min resolution vs 1 min)
                // But usually they are aligned by SWPC. If not, we might drop some points or need closest match.
                // For simplicity, we assume exact string match or we rely on 'mag' being the master

                if (map.has(timeStr)) {
                     const entry = map.get(timeStr)!;
                     entry.density = density;
                     entry.speed = speed;
                }
            });
        }

        // Convert map to array and filter incomplete
        const result: SolarHistoryPoint[] = [];
        for (const val of map.values()) {
            if (val.timestamp && val.bz !== undefined && val.speed !== undefined && val.density !== undefined) {
                result.push(val as SolarHistoryPoint);
            }
        }

        return result.sort((a,b) => a.timestamp - b.timestamp);

    } catch (e) {
        console.error("Error fetching solar history", e);
        return [];
    }
};
