export interface AuroraColorAnalysis {
  auroraPixels: number;
  greenPixels: number;
  purplePixels: number;
  redPixels: number;
  sampledPixels: number;
  auroraRatio: number;
  score: number;
  hasAurora: boolean;
}

const MIN_AURORA_PIXELS = 24;
const MIN_AURORA_RATIO = 0.012;

const getHueAndSaturation = (red: number, green: number, blue: number) => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }

  return {
    hue: (hue + 360) % 360,
    saturation: max === 0 ? 0 : delta / max,
    brightness: max,
  };
};

/** Counts saturated green, purple, and red pixels that are commonly seen in aurora photos. */
export const analyzeAuroraPixels = (rgba: Uint8ClampedArray): AuroraColorAnalysis => {
  const sampledPixels = Math.floor(rgba.length / 4);
  let greenPixels = 0;
  let purplePixels = 0;
  let redPixels = 0;
  let opaquePixels = 0;

  for (let index = 0; index < sampledPixels; index += 1) {
    const offset = index * 4;
    const red = rgba[offset];
    const green = rgba[offset + 1];
    const blue = rgba[offset + 2];
    const alpha = rgba[offset + 3];

    if (alpha < 128) continue;
    opaquePixels += 1;
    const { hue, saturation, brightness } = getHueAndSaturation(red, green, blue);
    if (brightness < 0.12 || brightness > 0.98 || saturation < 0.38) continue;

    if (hue >= 70 && hue <= 170 && green > red * 1.08 && green > blue * 1.08) {
      greenPixels += 1;
    } else if (hue >= 255 && hue <= 340 && blue > green * 1.08 && red > green * 1.08) {
      purplePixels += 1;
    } else if ((hue <= 18 || hue >= 345) && saturation >= 0.58 && brightness >= 0.3) {
      redPixels += 1;
    }
  }

  const auroraPixels = greenPixels + purplePixels + redPixels;
  const auroraRatio = opaquePixels === 0 ? 0 : auroraPixels / opaquePixels;

  return {
    auroraPixels,
    greenPixels,
    purplePixels,
    redPixels,
    sampledPixels,
    auroraRatio,
    score: Math.round(auroraRatio * 100),
    hasAurora: auroraPixels >= MIN_AURORA_PIXELS && auroraRatio >= MIN_AURORA_RATIO,
  };
};

export const analyzeAuroraImage = (image: HTMLImageElement): AuroraColorAnalysis => {
  const canvas = document.createElement('canvas');
  const sampleWidth = 96;
  const sampleHeight = 64;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return analyzeAuroraPixels(new Uint8ClampedArray());
  }

  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  context.drawImage(image, 0, 0, sampleWidth, sampleHeight);

  try {
    return analyzeAuroraPixels(context.getImageData(0, 0, sampleWidth, sampleHeight).data);
  } catch {
    // A camera host without CORS headers cannot be inspected through canvas.
    return analyzeAuroraPixels(new Uint8ClampedArray());
  }
};
