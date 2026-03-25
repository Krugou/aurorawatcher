import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { setupApi } from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Path to the history data in the web project
const historyIndexPath = path.resolve(__dirname, '../../web/public/data/history_index.json');
const historyDir = path.resolve(__dirname, '../../web/public/data');

setupApi(app, historyIndexPath, historyDir);

// Serve images from the web project
app.use('/images', express.static(historyDir));

// For production build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Admin server running at http://localhost:${port}`);
});
