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
  if (filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Text between tags: >TEXT<
    const textPattern = />([^<>{}\n]+)</g;
    let match;
    while ((match = textPattern.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length > 1 && !text.match(/^[\d\s\W]+$/)) {
        results.push(`${path.relative(__dirname, filePath)} [text]: ${text}`);
      }
    }

    // 2. Attributes with static strings: title="TEXT"
    const staticAttrPattern = /\s(title|placeholder|alt|aria-label)=["']([^"']+)["']/g;
    while ((match = staticAttrPattern.exec(content)) !== null) {
      const text = match[2].trim();
      if (text.length > 1 && !text.match(/^[a-z0-9_\-]+\.[a-z0-9_\-]+$/)) {
        results.push(`${path.relative(__dirname, filePath)} [static-attr]: ${text}`);
      }
    }

    // 3. Dynamic expressions with strings: prop={... 'TEXT' ...}
    // This looks for strings inside curly braces
    const dynamicPattern = /\{[^}]*['"]([^'"]+)['"][^}]*\}/g;
    while ((match = dynamicPattern.exec(content)) !== null) {
        const text = match[1].trim();
        // Skip common non-translatable strings like 'main', 'true', 'false', 'none', colors, etc.
        const skip = ['main', 'true', 'false', 'none', 'currentColor', 'top-right', 'dark', 'light', 'linear', 'linear-to-br', 'Slate-950', 'bg-neo-pink', 'Enter', ' ', 'auto', 'timestamp', 'intensity', 'speed', 'bz', '#000', '#fff', '2d', 'Last-Modified', 'anonymous', 'numeric', '2-digit', 'magnetic_data', 'local_data', 'observatory_status', 'space_weather', 'graphs', 'map', 'data_info', 'section_', 'aurora_saved_station', 't=', '6H', '24H', '3D', '7D', '30D'];
        if (text.length > 1 && !skip.includes(text) && !text.match(/^[a-z0-9_\-]+\.[a-z0-9_\-]+$/) && !text.match(/^#?[a-f0-9]{3,6}$/i) && !text.includes('/') && !text.startsWith('http')) {
             // Avoid matching things like '2-digit' from Intl options
             if (!['numeric', '2-digit', 'short', 'long', 'narrow'].includes(text)) {
                results.push(`${path.relative(__dirname, filePath)} [dynamic-expr]: ${text}`);
             }
        }
    }
  }
});

if (results.length === 0) {
    console.log('No hardcoded strings found! 🎉');
} else {
    console.log('--- POTENTIALLY HARDCODED STRINGS ---');
    console.log([...new Set(results)].join('\n'));
}
