import { Express } from 'express';
import fs from 'fs-extra';
import path from 'path';

interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
}

interface HistoryIndex {
  lastUpdated: number;
  entries: HistoryEntry[];
}

export function setupApi(app: Express, indexPath: string, historyDir: string) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      version: '1.0.0'
    });
  });

  // Get all history entries
  app.get('/api/history', async (req, res) => {
    try {
      if (!(await fs.pathExists(indexPath))) {
        return res.json({ lastUpdated: 0, entries: [] });
      }
      const data: HistoryIndex = await fs.readJson(indexPath);
      res.json(data);
    } catch (error) {
      console.error('Error reading history index:', error);
      res.status(500).json({ error: 'Failed to read history index' });
    }
  });

  // Delete a history entry
  app.delete('/api/history/:camId/:timestamp', async (req, res) => {
    try {
      const { camId, timestamp } = req.params;
      const ts = parseInt(timestamp);

      if (!(await fs.pathExists(indexPath))) {
        return res.status(404).json({ error: 'History index not found' });
      }

      const data: HistoryIndex = await fs.readJson(indexPath);
      const entryIndex = data.entries.findIndex(
        (e) => e.camId === camId && e.timestamp === ts
      );

      if (entryIndex === -1) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const entry = data.entries[entryIndex];
      const filePath = path.join(historyDir, entry.filename);

      // Delete the file
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`Deleted file: ${filePath}`);
      } else {
        console.warn(`File not found, but removing from index: ${filePath}`);
      }

      // Remove from index
      data.entries.splice(entryIndex, 1);
      data.lastUpdated = Date.now();

      // Save index
      await fs.writeJson(indexPath, data, { spaces: 2 });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting history entry:', error);
      res.status(500).json({ error: 'Failed to delete entry' });
    }
  });

  // Bulk delete by camera or timestamp range could be added here
}
