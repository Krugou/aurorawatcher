import fs from 'fs';
import path from 'path';

// Adjust path related to where we run this script from
const DATA_DIR = path.resolve('./web/public/data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const HISTORY_FILE = path.join(DATA_DIR, 'history_index.json');

const rebuildHistory = () => {
  try {
    const files = fs.readdirSync(HISTORY_DIR);
    const entries = [];

    for (const file of files) {
      if (!file.endsWith('.jpg')) continue;

      // Extract details from filename: camId_YYYYMMDD_HHmm.jpg
      const parts = file.split('_');
      // Format: [camId, date, time.jpg] OR [camId, timestamp.jpg] (legacy?)

      let timestamp = 0;
      let camId = '';

      if (parts.length === 3) {
        // Standard format: camId_YYYYMMDD_HHmm.jpg
        camId = parts[0];
        const dateStr = parts[1];
        const timeStr = parts[2].replace('.jpg', '');

        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-based
        const day = parseInt(dateStr.substring(6, 8));
        const hour = parseInt(timeStr.substring(0, 2));
        const minute = parseInt(timeStr.substring(2, 4));

        const date = new Date(Date.UTC(year, month, day, hour, minute));
        timestamp = date.getTime();
      } else if (parts.length === 2) {
        // Legacy timestamp format: camId_timestamp.jpg (saw some in list like 1769816285588)
        camId = parts[0];
        const tsPart = parts[1].replace('.jpg', '');
        timestamp = parseInt(tsPart);
      } else {
        console.warn(`Skipping unknown file format: ${file}`);
        continue;
      }

      if (timestamp && camId) {
        entries.push({
          timestamp,
          camId,
          filename: `history/${file}`
        });
      }
    }

    // Sort by timestamp
    entries.sort((a, b) => a.timestamp - b.timestamp);

    const historyData = {
      lastUpdated: Date.now(),
      entries
    };

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2));
    console.log(`Rebuilt history.json with ${entries.length} entries.`);

  } catch (error) {
    console.error('Error rebuilding history:', error);
  }
};

rebuildHistory();
