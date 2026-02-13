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

// Matches text between > and < in TSX files
const hardcodedPattern = />([^<>{}\n]+)</g;
const results = [];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = hardcodedPattern.exec(content)) !== null) {
      const text = match[1].trim();
      // Filter out: short text, only numbers, only whitespace, common symbols, or text inside curly braces
      if (text.length > 1 && !text.match(/^[\d\s\W]+$/) && !text.includes('{') && !text.includes('}')) {
        results.push(`${path.relative(__dirname, filePath)} [text]: ${text}`);
      }
    }

    // Check for common attributes like title, placeholder, alt, aria-label
    // Also include text within quotes that isn't a known i18n key pattern
    const attrPattern = /\s(title|placeholder|alt|aria-label)=["']([^"']+)["']/g;
    while ((match = attrPattern.exec(content)) !== null) {
        const text = match[2].trim();
        // Skip text that already looks like an i18n key or is very short
        if (text.length > 1 && !text.match(/^[a-z0-9_\-]+\.[a-z0-9_\-]+$/)) {
            results.push(`${path.relative(__dirname, filePath)} [attr]: ${text}`);
        }
    }

    // Check for hardcoded strings in props that likely need translation but aren't attributes
    // e.g., badge={<Badge>TEXT</Badge>} or similar (handled by hardcodedPattern)
    // but also values like title="Hardcoded Title"
    const propPattern = /\s([a-z]+)=["']([^"']+)["']/gi;
    while ((match = propPattern.exec(content)) !== null) {
        const propName = match[1];
        const text = match[2].trim();
        // Filter out props that are usually NOT translated (id, className, src, href, etc.)
        const nonTranslatableProps = ['id', 'className', 'src', 'href', 'target', 'rel', 'key', 'type', 'name', 'value', 'method', 'action', 'loading', 'crossOrigin', 'storageKey', 'headerColorClass', 'role', 'tabIndex'];
        if (!nonTranslatableProps.includes(propName) && text.length > 1 && !text.match(/^[a-z0-9_\-]+\.[a-z0-9_\-]+$/)) {
             results.push(`${path.relative(__dirname, filePath)} [prop ${propName}]: ${text}`);
        }
    }
  }
});

if (results.length === 0) {
    console.log('No hardcoded strings found! 🎉');
} else {
    console.log('--- POTENTIALLY HARDCODED STRINGS ---');
    console.log(results.join('\n'));
}
