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

interface AuroraGalleryEntry extends HistoryEntry {
  score: number;
  greenPixels: number;
  purplePixels: number;
  redPixels: number;
}

interface AuroraGallery {
  entries: AuroraGalleryEntry[];
}

const CAMERA_IDS = new Set(['muonio', 'nyrola', 'hankasalmi', 'metsahovi']);

const isGalleryEntry = (entry: unknown): entry is AuroraGalleryEntry => {
  if (!entry || typeof entry !== 'object') return false;
  const value = entry as Partial<AuroraGalleryEntry>;
  return (
    typeof value.camId === 'string' &&
    CAMERA_IDS.has(value.camId) &&
    typeof value.filename === 'string' &&
    /^history\/[\w.-]+\.(?:webp|jpe?g|png)$/i.test(value.filename) &&
    typeof value.timestamp === 'number' &&
    Number.isFinite(value.timestamp) &&
    ['score', 'greenPixels', 'purplePixels', 'redPixels'].every(
      (key) => typeof value[key as keyof AuroraGalleryEntry] === 'number' &&
        Number.isFinite(value[key as keyof AuroraGalleryEntry]),
    )
  );
};

export function setupApi(
  app: Express,
  indexPath: string,
  historyDir: string,
  galleryPath = path.join(historyDir, 'aurora_gallery.json'),
) {
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

  // Shared gallery managed from the admin UI and displayed by the public site.
  app.get('/api/gallery', async (req, res) => {
    try {
      if (!(await fs.pathExists(galleryPath))) return res.json({ entries: [] });
      const gallery: unknown = await fs.readJson(galleryPath);
      if (!gallery || typeof gallery !== 'object' || !Array.isArray((gallery as AuroraGallery).entries)) {
        return res.status(500).json({ error: 'Gallery data is invalid' });
      }
      res.json(gallery);
    } catch (error) {
      console.error('Error reading aurora gallery:', error);
      res.status(500).json({ error: 'Failed to read aurora gallery' });
    }
  });

  app.put('/api/gallery', async (req, res) => {
    try {
      const entries: unknown = req.body?.entries;
      if (!Array.isArray(entries) || entries.length > 5000 || !entries.every(isGalleryEntry)) {
        return res.status(400).json({ error: 'Gallery entries are invalid' });
      }
      await fs.ensureDir(path.dirname(galleryPath));
      const gallery: AuroraGallery = { entries };
      await fs.writeJson(galleryPath, gallery, { spaces: 2 });
      res.json(gallery);
    } catch (error) {
      console.error('Error saving aurora gallery:', error);
      res.status(500).json({ error: 'Failed to save aurora gallery' });
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
