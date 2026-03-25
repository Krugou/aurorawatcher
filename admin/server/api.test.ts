import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { setupApi } from './api';
import fs from 'fs-extra';
import path from 'path';

vi.mock('fs-extra');

describe('Admin API', () => {
  let app: express.Express;
  const mockIndexPath = '/mock/index.json';
  const mockHistoryDir = '/mock/history';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    setupApi(app, mockIndexPath, mockHistoryDir);
    vi.clearAllMocks();
  });

  it('GET /api/health returns status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      version: '1.0.0'
    });
    expect(response.body.uptime).toBeTypeOf('number');
    expect(response.body.timestamp).toBeTypeOf('number');
  });

  it('GET /api/history returns data', async () => {
    const mockData = {
      lastUpdated: 123,
      entries: [{ timestamp: 456, camId: 'test', filename: 'test.jpg' }]
    };
    (fs.pathExists as any).mockResolvedValue(true);
    (fs.readJson as any).mockResolvedValue(mockData);

    const response = await request(app).get('/api/history');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData);
  });

  it('DELETE /api/history/:camId/:timestamp deletes entry and file', async () => {
    const mockData = {
      lastUpdated: 123,
      entries: [{ timestamp: 456, camId: 'test', filename: 'test.jpg' }]
    };
    (fs.pathExists as any).mockResolvedValue(true);
    (fs.readJson as any).mockResolvedValue(mockData);
    (fs.writeJson as any).mockResolvedValue(undefined);
    (fs.remove as any).mockResolvedValue(undefined);

    const response = await request(app).delete('/api/history/test/456');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    expect(fs.remove).toHaveBeenCalled();
    expect(fs.writeJson).toHaveBeenCalledWith(mockIndexPath, expect.objectContaining({
      entries: []
    }), expect.any(Object));
  });
});
