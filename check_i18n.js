const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'web', 'src', 'locales', 'en.json');
const srcDir = path.join(__dirname, 'web', 'src');

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
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const tPattern = /t\(['"]([^'"]+)['"]/g;
const missingKeys = new Set();
const foundKeys = new Set();

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = tPattern.exec(content)) !== null) {
      const key = match[1];
      foundKeys.add(key);
      if (!enKeys.has(key)) {
        missingKeys.add(`${key} (in ${path.relative(__dirname, filePath)})`);
      }
    }
  }
});

console.log('--- FOUND KEYS IN CODE ---');
console.log([...foundKeys].sort());

console.log('\n--- MISSING IN en.json ---');
if (missingKeys.size === 0) {
  console.log('No missing keys found! 🎉');
} else {
  missingKeys.forEach(k => console.log(k));
}

const unusedKeys = [...enKeys].filter(k => !foundKeys.has(k));
console.log('\n--- UNUSED IN en.json ---');
if (unusedKeys.length === 0) {
  console.log('No unused keys found! 🎉');
} else {
  unusedKeys.forEach(k => console.log(k));
}
