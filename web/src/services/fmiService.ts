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
const WEATHER_QUERY_ID = 'fmi::observations::weather::multipointcoverage';

export const fetchMagneticData = async (lat: number, lon: number): Promise<MagneticData | null> => {
  try {
    const bbox = `${lat - 2},${lon - 2},${lat + 2},${lon + 2}`;
    const now = new Date();
    const startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // Last 1 hour is enough with correct BBOX
    const endTime = now.toISOString();

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'getFeature',
      storedquery_id: MAGNETOMETER_QUERY_ID,
      bbox: bbox,
      starttime: startTime,
      endtime: endTime,
    });

    const fetchUrl = `${FMI_WFS_URL}?${params.toString()}`;
    console.log('[FMI Mag] Fetching URL:', fetchUrl);
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FMI Mag] API failed with status:', response.status, errorText);
      throw new Error('FMI API failed');
    }

    const text = await response.text();
    console.log(
      `[FMI Mag] Response received. Length: ${text.length} chars. Snippet: ${text.substring(0, 200)}...`,
    );

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    const members = xml.getElementsByTagNameNS('http://www.opengis.net/wfs/2.0', 'member');
    console.log(`[FMI Mag] Found ${members.length} members in XML.`);

    if (members.length === 0) {
      console.warn('[FMI Mag] No members found! Check BBOX or Time window.');
      return null;
    }

    // Group measurements by time to find a complete set of X, Y, Z
    const measurements: Record<string, { x?: number; y?: number; z?: number; station: string }> =
      {};
    // Removed unused lastTime variable

    for (let i = 0; i < members.length; i++) {
      const element = members[i].children[0];
      if (!element) continue;

      const time = element.getElementsByTagNameNS('*', 'Time')[0]?.textContent;
      const paramName = element.getElementsByTagNameNS('*', 'ParameterName')[0]?.textContent;
      const paramValue = parseFloat(
        element.getElementsByTagNameNS('*', 'ParameterValue')[0]?.textContent || 'NaN',
      );
      const location =
        element.getElementsByTagNameNS('*', 'LocationName')[0]?.textContent || 'Unknown';

      if (time && paramName && !isNaN(paramValue)) {
        if (!measurements[time]) {
          measurements[time] = { station: location };
        }

        if (paramName.includes('MAGN_X') || paramName.includes('MAGNX'))
          measurements[time].x = paramValue;
        if (paramName.includes('MAGN_Y') || paramName.includes('MAGNY'))
          measurements[time].y = paramValue;
        if (paramName.includes('MAGN_Z') || paramName.includes('MAGNZ'))
          measurements[time].z = paramValue;
      }
    }

    // Find the latest complete reading
    // Sort timestamps descending
    const sortedTimes = Object.keys(measurements).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    let latest = null;
    let latestTime = '';

    for (const time of sortedTimes) {
      const m = measurements[time];
      if (m.x !== undefined && m.y !== undefined && m.z !== undefined) {
        latest = m;
        latestTime = time;
        break;
      }
    }

    if (!latest) {
      console.warn('[FMI Mag] No complete (X,Y,Z) measurement found in the fetched window.');
      return null;
    }

    // Try to find a better station name if it's "Unknown"
    let finalStation = latest.station;
    if (finalStation === 'Unknown') {
      // Look through ANY measurement to find a name
      for (const time of sortedTimes) {
        if (measurements[time].station !== 'Unknown') {
          finalStation = measurements[time].station;
          break;
        }
      }
    }

    // Calculate approx total intensity F = sqrt(x^2 + y^2 + z^2)
    const intensity = Math.sqrt(
      Math.pow(latest.x!, 2) + Math.pow(latest.y!, 2) + Math.pow(latest.z!, 2),
    );

    return {
      station: finalStation,
      timestamp: latestTime,
      fieldIntensity: Math.round(intensity * 10) / 10,
      components: { x: latest.x!, y: latest.y!, z: latest.z! },
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

export const fetchMagnetometerHistory = async (
  lat: number,
  lon: number,
  hours: number = 6,
): Promise<GraphDataPoint[]> => {
  try {
    const bbox = `${lat - 2},${lon - 2},${lat + 2},${lon + 2}`;
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'getFeature',
      storedquery_id: MAGNETOMETER_QUERY_ID,
      bbox: bbox,
      starttime: startTime.toISOString(),
      endtime: endTime.toISOString(),
    });

    const fetchUrl = `${FMI_WFS_URL}?${params.toString()}`;
    console.log('[FMI History] Fetching:', fetchUrl);
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        '[FMI History] Error:',
        response.status,
        response.statusText,
        'Body:',
        errorBody,
      );
      throw new Error('FMI History API failed');
    }

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
      const paramValue = parseFloat(
        element.getElementsByTagNameNS('*', 'ParameterValue')[0]?.textContent || 'NaN',
      );

      if (timeStr && paramName && !isNaN(paramValue)) {
        if (!measurements[timeStr]) measurements[timeStr] = {};

        if (paramName.includes('MAGN_X') || paramName.includes('MAGNX'))
          measurements[timeStr].x = paramValue;
        if (paramName.includes('MAGN_Y') || paramName.includes('MAGNY'))
          measurements[timeStr].y = paramValue;
        if (paramName.includes('MAGN_Z') || paramName.includes('MAGNZ'))
          measurements[timeStr].z = paramValue;
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
          z: vals.z,
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
    const now = new Date();
    const startTime = new Date(now.getTime() - 90 * 60 * 1000).toISOString(); // 1.5h to be safe
    const endTime = now.toISOString();

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'getFeature',
      storedquery_id: WEATHER_QUERY_ID,
      latlon: `${lat},${lon}`,
      starttime: startTime,
      endtime: endTime,
      parameters: 't2m,n_man,ws_10min',
    });

    const fetchUrl = `${FMI_WFS_URL}?${params.toString()}`;
    console.log('[FMI Weather] Fetching direct URL:', fetchUrl);
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error('[FMI Weather] Fetch failed with status:', response.status);
      throw new Error(`Status ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    // Parse Positions
    const posNode = xml.getElementsByTagNameNS('*', 'positions')[0];
    if (!posNode || !posNode.textContent) return null;
    const pArr = posNode.textContent.trim().split(/\s+/);

    // Parse Values
    const vNode = xml.getElementsByTagNameNS('*', 'doubleOrNilReasonTupleList')[0];
    if (!vNode || !vNode.textContent) return null;
    const vArr = vNode.textContent.trim().split(/\s+/);

    let latestValid = null;
    let maxTime = 0;

    // We have 3 values per point: t2m, n_man, ws_10min
    const entryCount = Math.floor(vArr.length / 3);
    for (let i = 0; i < entryCount; i++) {
      const time = parseInt(pArr[i * 3 + 2]) * 1000;
      const t2m = parseFloat(vArr[i * 3]);
      const n_man = parseFloat(vArr[i * 3 + 1]);
      const ws = parseFloat(vArr[i * 3 + 2]);

      // Accept Temp + Wind even if Clouds (n_man) is missing
      if (!isNaN(t2m) && !isNaN(ws)) {
        if (time > maxTime) {
          maxTime = time;
          latestValid = {
            temperature: t2m,
            cloudCover: isNaN(n_man) ? 0 : n_man,
            windSpeed: ws,
          };
        }
      }
    }

    if (!latestValid) return null;

    // Station name
    const nameNodes = xml.getElementsByTagNameNS('*', 'name');
    let station = 'Unknown';
    for (let i = 0; i < nameNodes.length; i++) {
      const n = nameNodes[i].textContent;
      // Find first name that isn't just a number
      if (n && n.length > 5 && isNaN(parseInt(n))) {
        station = n;
        break;
      }
    }

    return {
      station,
      ...latestValid,
    };
  } catch (error) {
    console.error('[FMI Weather] Fetch error:', error);
    return null;
  }
};
