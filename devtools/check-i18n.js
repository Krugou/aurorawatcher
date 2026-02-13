const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'web', 'src', 'locales', 'en.json');
const srcDir = path.join(__dirname, '..', 'web', 'src');

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

const en = JSON.parse(fs.readFileSync(localesPath, 'utf8'));
const flattenedEn = flattenObject(en);
const enKeys = new Set(Object.keys(flattenedEn));

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

const tPattern = /t\(['"]([^'"]+)['"]/g;
const foundKeys = new Set();
const missingKeys = new Set();

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = tPattern.exec(content)) !== null) {
      const key = match[1];
      // Only check keys that look like i18n keys (e.g. common.save)
      // and aren't obviously non-i18n strings (like '2d', 'Last-Modified')
      if (key.includes('.')) {
        foundKeys.add(key);
        if (!enKeys.has(key)) {
          missingKeys.add(`${key} (in ${path.relative(__dirname, filePath)})`);
        }
      }
    }
  }
});

console.log('JSON Keys Count:', enKeys.size);
console.log('Keys used in Code Count:', foundKeys.size);

console.log('\n--- MISSING KEYS (Used in code but not in en.json) ---');
if (missingKeys.size === 0) {
  console.log('None! 🎉');
} else {
  [...missingKeys].sort().forEach(k => console.log(k));
}

const unusedKeys = [...enKeys].filter(k => !foundKeys.has(k));
console.log('\n--- UNUSED KEYS (In en.json but not used in code) ---');
if (unusedKeys.length === 0) {
  console.log('None! 🎉');
} else {
  unusedKeys.sort().forEach(k => console.log(k));
}
