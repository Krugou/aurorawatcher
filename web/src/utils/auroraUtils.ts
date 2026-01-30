export const AURORA_COLORS = {
  high: { red: 238, green: 102, blue: 119 }, // #EE6677
  low: { red: 204, green: 187, blue: 68 }, // #CDBA44
};

export const checkImageColor = (img: HTMLImageElement): { hasHigh: boolean; hasLow: boolean } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return { hasHigh: false, hasLow: false };
  }

  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);

  const { data } = context.getImageData(0, 0, img.width, img.height);
  let hasHigh = false;
  let hasLow = false;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (
      r === AURORA_COLORS.high.red &&
      g === AURORA_COLORS.high.green &&
      b === AURORA_COLORS.high.blue
    ) {
      hasHigh = true;
    } else if (
      r === AURORA_COLORS.low.red &&
      g === AURORA_COLORS.low.green &&
      b === AURORA_COLORS.low.blue
    ) {
      hasLow = true;
    }

    if (hasHigh && hasLow) break;
  }

  return { hasHigh, hasLow };
};
