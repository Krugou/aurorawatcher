export const AURORA_COLORS = {
  high: { red: 238, green: 102, blue: 119 }, // #EE6677 (Red/Pink)
  low: { red: 204, green: 187, blue: 68 }, // #CDBA44 (Yellowish)
};

export interface StationStatus {
  name: string;
  color: string;
  status: 'HIGH' | 'MODERATE' | 'LOW' | 'QUIET' | 'UNKNOWN';
}

// Normalized coordinates (0-1) based on map-latest-fi.png + GPS
interface Coords {
  x: number;
  y: number;
  lat: number;
  lon: number;
}

export const STATION_COORDINATES: Record<string, Coords> = {
  Kevo: { x: 0.6, y: 0.12, lat: 69.76, lon: 27.01 },
  Kilpisjärvi: { x: 0.28, y: 0.18, lat: 69.02, lon: 20.79 },
  Ivalo: { x: 0.62, y: 0.2, lat: 68.56, lon: 27.29 },
  Muonio: { x: 0.38, y: 0.26, lat: 67.96, lon: 23.68 },
  Sodankylä: { x: 0.61, y: 0.3, lat: 67.37, lon: 26.63 },
  Pello: { x: 0.4, y: 0.36, lat: 66.77, lon: 23.97 },
  Ranua: { x: 0.61, y: 0.42, lat: 65.93, lon: 26.5 },
  Oulujärvi: { x: 0.65, y: 0.52, lat: 64.3, lon: 27.1 },
  Mekrijärvi: { x: 0.88, y: 0.63, lat: 62.77, lon: 30.97 },
  Hankasalmi: { x: 0.65, y: 0.68, lat: 62.3, lon: 26.65 },
  Nurmijärvi: { x: 0.58, y: 0.82, lat: 60.51, lon: 24.65 },
  Tartto: { x: 0.68, y: 0.95, lat: 58.26, lon: 26.46 },
};

// FMI Map Colors to Meaning
const STATUS_COLORS = [
  { r: 215, g: 215, b: 215, status: 'QUIET', color: '#D7D7D7' }, // Grey
  { r: 102, g: 204, b: 238, status: 'LOW', color: '#66CCEE' }, // Light Blue
  { r: 34, g: 136, b: 51, status: 'MODERATE', color: '#228833' }, // Green
  { r: 204, g: 187, b: 68, status: 'MODERATE', color: '#CCBB44' }, // Yellow
  { r: 238, g: 102, b: 119, status: 'HIGH', color: '#EE6677' }, // Red
];

const getColorDistance = (
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
) => {
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
};

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearestStation = (userLat: number, userLon: number): string | null => {
  let nearestStation = null;
  let minDistance = Infinity;

  Object.entries(STATION_COORDINATES).forEach(([name, coords]) => {
    const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = name;
    }
  });

  return nearestStation;
};

export const scanStationStatuses = (img: HTMLImageElement): StationStatus[] => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return [];

  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);

  // Safely get image data
  let imageData;
  try {
    imageData = context.getImageData(0, 0, img.width, img.height).data;
  } catch (e) {
    console.warn('Unable to read canvas data (CORS?)', e);
    return [];
  }

  const results: StationStatus[] = [];

  Object.entries(STATION_COORDINATES).forEach(([name, coords]) => {
    // Sample a 3x3 area to find the colored dot
    const cx = Math.floor(coords.x * img.width);
    const cy = Math.floor(coords.y * img.height);
    const boxSize = 10;

    let foundStatus = null;
    let minDistance = 50; // Distance threshold for color matching

    // Search around the expected coordinate
    for (let y = cy - boxSize; y <= cy + boxSize; y++) {
      for (let x = cx - boxSize; x <= cx + boxSize; x++) {
        if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

        const i = (y * img.width + x) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        // Compare against known status colors
        for (const statusColor of STATUS_COLORS) {
          const dist = getColorDistance(r, g, b, statusColor.r, statusColor.g, statusColor.b);
          if (dist < minDistance) {
            minDistance = dist;
            foundStatus = statusColor;
          }
        }
      }
    }

    if (foundStatus) {
      results.push({
        name,
        color: foundStatus.color,
        status: foundStatus.status as StationStatus['status'],
      });
    } else {
      results.push({
        name,
        color: '#333',
        status: 'UNKNOWN',
      });
    }
  });

  return results;
};

// Deprecated but kept for backward compatibility if needed, though we should migrate away
export const checkImageColor = (img: HTMLImageElement): { hasHigh: boolean; hasLow: boolean } => {
  const statuses = scanStationStatuses(img);
  const hasHigh = statuses.some((s) => s.status === 'HIGH');
  const hasLow = statuses.some((s) => s.status === 'LOW' || s.status === 'MODERATE');
  return { hasHigh, hasLow };
};
