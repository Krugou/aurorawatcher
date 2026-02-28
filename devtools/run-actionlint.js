const fs = require('fs');
const { createLinter } = require('actionlint');

async function main() {
  let files = process.argv.slice(2);
  if (files.length === 0) {
    console.log('No files to lint.');
    return;
  }

  // Expand wildcard manually for Windows cmd
  if (files.length === 1 && files[0].includes('*')) {
    const dir = require('path').dirname(files[0]);
    if (fs.existsSync(dir)) {
      files = fs.readdirSync(dir)
               .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
               .map(f => require('path').join(dir, f));
    }
  }

  const runActionlint = await createLinter();
  let hasErrors = false;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const results = runActionlint(content, file);

      if (results.length > 0) {
        hasErrors = true;
        for (const res of results) {
          console.error(`${res.file}:${res.line}:${res.column}: ${res.message} [${res.kind}]`);
        }
      }
    } catch (err) {
      console.error(`Error reading or linting ${file}:`, err);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
