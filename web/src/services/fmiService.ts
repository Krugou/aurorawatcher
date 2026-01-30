interface MagneticData {
  station: string;
  timestamp: string;
  fieldIntensity: number; // Total field roughly or largest component
  components: {
    x: number;
    y: number;
    z: number;
  };
}

interface WeatherData {
  station: string;
  temperature: number;
  cloudCover: number; // 0-8 (octas)
  windSpeed: number;
}

const FMI_WFS_URL = 'https://opendata.fmi.fi/wfs';
const MAGNETOMETER_QUERY_ID = 'fmi::observations::magnetometer::simple';
const WEATHER_QUERY_ID = 'fmi::observations::weather::simple';

export const fetchMagneticData = async (lat: number, lon: number): Promise<MagneticData | null> => {
  try {
    const bbox = `${lon - 2},${lat - 2},${lon + 2},${lat + 2}`;
    const startTime = new Date(Date.now() - 20 * 60 * 1000).toISOString(); // Last 20 mins

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'getFeature',
      storedquery_id: MAGNETOMETER_QUERY_ID,
      bbox: bbox,
      startTime: startTime,
      parameters: 'MAGN_X,MAGN_Y,MAGN_Z'
    });

    const response = await fetch(`${FMI_WFS_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('FMI API failed');

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    const members = xml.getElementsByTagNameNS('http://www.opengis.net/wfs/2.0', 'member');
    if (members.length === 0) return null;

    // Group measurements by time to find a complete set of X, Y, Z
    const measurements: Record<string, { x?: number; y?: number; z?: number; station: string }> = {};
    let lastTime = '';

    for (let i = 0; i < members.length; i++) {
      const element = members[i].children[0];
      if (!element) continue;

      const time = element.getElementsByTagNameNS('*', 'Time')[0]?.textContent;
      const paramName = element.getElementsByTagNameNS('*', 'ParameterName')[0]?.textContent;
      const paramValue = parseFloat(element.getElementsByTagNameNS('*', 'ParameterValue')[0]?.textContent || 'NaN');
      const location = element.getElementsByTagNameNS('*', 'LocationName')[0]?.textContent || 'Unknown';

      if (time && paramName && !isNaN(paramValue)) {
        if (!measurements[time]) {
          measurements[time] = { station: location };
        }

        if (paramName === 'MAGN_X') measurements[time].x = paramValue;
        if (paramName === 'MAGN_Y') measurements[time].y = paramValue;
        if (paramName === 'MAGN_Z') measurements[time].z = paramValue;

        lastTime = time;
      }
    }

    // Get the latest complete reading
    const latest = measurements[lastTime];
    if (!latest || latest.x === undefined || latest.y === undefined || latest.z === undefined) {
      return null;
    }

    // Calculate approx total intensity F = sqrt(x^2 + y^2 + z^2)
    const intensity = Math.sqrt(
      Math.pow(latest.x, 2) +
      Math.pow(latest.y, 2) +
      Math.pow(latest.z, 2)
    );

    return {
      station: latest.station,
      timestamp: lastTime,
      fieldIntensity: Math.round(intensity * 10) / 10,
      components: { x: latest.x, y: latest.y, z: latest.z }
    };

  } catch (error) {
    console.error('FMI Fetch error:', error);
    return null;
  }
};

export interface GraphDataPoint {
    timestamp: number; // Unix timestamp for easy graphing
    intensity: number;
    x: number;
    y: number;
    z: number;
}

export const fetchMagnetometerHistory = async (lat: number, lon: number, hours: number = 6): Promise<GraphDataPoint[]> => {
    try {
        const bbox = `${lon - 2},${lat - 2},${lon + 2},${lat + 2}`;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        const params = new URLSearchParams({
            service: 'WFS',
            version: '2.0.0',
            request: 'getFeature',
            storedquery_id: MAGNETOMETER_QUERY_ID,
            bbox: bbox,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            parameters: 'MAGN_X,MAGN_Y,MAGN_Z'
        });

        const response = await fetch(`${FMI_WFS_URL}?${params.toString()}`);
        if (!response.ok) throw new Error('FMI History API failed');

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const members = xml.getElementsByTagNameNS('http://www.opengis.net/wfs/2.0', 'member');

        const measurements: Record<string, { x?: number; y?: number; z?: number }> = {};

        // Parse all members
        for (let i = 0; i < members.length; i++) {
             const element = members[i].children[0];
            if (!element) continue;

             const timeStr = element.getElementsByTagNameNS('*', 'Time')[0]?.textContent;
             const paramName = element.getElementsByTagNameNS('*', 'ParameterName')[0]?.textContent;
             const paramValue = parseFloat(element.getElementsByTagNameNS('*', 'ParameterValue')[0]?.textContent || 'NaN');

             if (timeStr && paramName && !isNaN(paramValue)) {
                 if (!measurements[timeStr]) measurements[timeStr] = {};

                 if (paramName === 'MAGN_X') measurements[timeStr].x = paramValue;
                 if (paramName === 'MAGN_Y') measurements[timeStr].y = paramValue;
                 if (paramName === 'MAGN_Z') measurements[timeStr].z = paramValue;
             }
        }

        const data: GraphDataPoint[] = [];

        Object.entries(measurements).forEach(([timeStr, vals]) => {
            if (vals.x !== undefined && vals.y !== undefined && vals.z !== undefined) {
                const intensity = Math.sqrt(vals.x ** 2 + vals.y ** 2 + vals.z ** 2);
                data.push({
                    timestamp: new Date(timeStr).getTime(),
                    intensity: Math.round(intensity * 10) / 10,
                    x: vals.x,
                    y: vals.y,
                    z: vals.z
                });
            }
        });

        return data.sort((a, b) => a.timestamp - b.timestamp);

    } catch (error) {
        console.error('FMI History Fetch error:', error);
        return [];
    }
};

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const bbox = `${lon - 0.5},${lat - 0.5},${lon + 0.5},${lat + 0.5}`;
    const startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // Last 1 hour

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'getFeature',
      storedquery_id: WEATHER_QUERY_ID,
      bbox: bbox,
      startTime: startTime,
      parameters: 't2m,n_man,ws_10min'
    });

    const response = await fetch(`${FMI_WFS_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('FMI Weather API failed');

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    const members = xml.getElementsByTagNameNS('http://www.opengis.net/wfs/2.0', 'member');
    if (members.length === 0) return null;

    // Group by time
    const measurements: Record<string, { t2m?: number; n_man?: number; ws_10min?: number; station: string }> = {};
    let lastTime = '';

    for (let i = 0; i < members.length; i++) {
      const element = members[i].children[0];
      if (!element) continue;

      const time = element.getElementsByTagNameNS('*', 'Time')[0]?.textContent;
      const paramName = element.getElementsByTagNameNS('*', 'ParameterName')[0]?.textContent;
      const paramValue = parseFloat(element.getElementsByTagNameNS('*', 'ParameterValue')[0]?.textContent || 'NaN');
      const location = element.getElementsByTagNameNS('*', 'LocationName')[0]?.textContent || 'Unknown';

      if (time && paramName && !isNaN(paramValue)) {
        if (!measurements[time]) measurements[time] = { station: location };

        if (paramName === 't2m') measurements[time].t2m = paramValue;
        if (paramName === 'n_man') measurements[time].n_man = paramValue;
        if (paramName === 'ws_10min') measurements[time].ws_10min = paramValue;

        lastTime = time;
      }
    }

    const latest = measurements[lastTime];
    if (!latest) return null;

    return {
      station: latest.station,
      temperature: latest.t2m ?? 0,
      cloudCover: latest.n_man ?? 0,
      windSpeed: latest.ws_10min ?? 0
    };

  } catch (error) {
    console.error('FMI Weather fetch error:', error);
    return null;
  }
};
