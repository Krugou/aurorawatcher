const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'web', 'src');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  }
}

const results = [];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Simple regex to find strings in single or double quotes
    // This will find A LOT of noise (CSS classes, URLs, etc.)
    // We try to filter out the noise.
    const stringPattern = /(['"])(?:(?=(\\?))\2.)*?\1/g;
    let match;
    while ((match = stringPattern.exec(content)) !== null) {
      const text = match[0].slice(1, -1).trim();

      // Filter out common technical strings
      const noise = [
         'use strict', 'utf8', 'utf-8', 'production', 'development', 'minimal', 'default', 'fullscreen',
         'top-right', 'top-left', 'bottom-right', 'bottom-left', 'none', 'currentColor', 'square', 'miter',
         'transparent', 'absolute', 'relative', 'fixed', 'hidden', 'block', 'flex', 'grid', 'inline-block',
         'white', 'black', 'granted', 'denied', 'default', 'unsupported', 'auto', 'module', 'true', 'false',
         'numeric', '2-digit', 'short', 'long', 'narrow', 'timestamp', 'intensity', 'speed', 'bz', 'kp',
         'latitude', 'longitude', 'Enter', ' ', 'nT', 'km/s', 'p/cm³', 't=', 'aurora-check', 'CHECK_AURORA',
         'section_', 'aurora_saved_station', '6H', '24H', '3D', '7D', '30D', 'NFD'
      ];

      const isClassName = text.includes(' ') && (text.includes('bg-') || text.includes('text-') || text.includes('p-') || text.includes('m-'));
      const isUrl = text.startsWith('http') || text.includes('://') || text.endsWith('.jpg') || text.endsWith('.png') || text.endsWith('.json') || text.endsWith('.css');
      const isI18nKey = text.includes('.') && text.match(/^[a-z0-9_]+\.[a-z0-9_]+$/);
      const isHexColor = text.match(/^#?[a-f0-9]{3,6}$/i);
      const isSvgPath = text.match(/[MLHVCSQTA][\d\s,.-]+/i);
      const isShort = text.length <= 1;

      if (!noise.includes(text) && !isClassName && !isUrl && !isI18nKey && !isHexColor && !isSvgPath && !isShort) {
          // If it looks like English/Finnish word (capitalized or common words)
          if (text.match(/[a-zA-Z]/)) {
            results.push(`${path.relative(__dirname, filePath)}: "${text}"`);
          }
      }
    }
  }
});

console.log('--- POTENTIALLY HARDCODED STRINGS ---');
console.log([...new Set(results)].sort().join('\n'));
