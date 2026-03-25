import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { detectCloudScore, HistoryData } from '../utils/historyUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../web/public/data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const HISTORY_FILE = path.join(DATA_DIR, 'history_index.json');

async function migrate() {
    console.log('Starting migration to WebP and cloud score detection...');
    
    try {
        const fileContent = await fs.readFile(HISTORY_FILE, 'utf-8');
        const data: HistoryData = JSON.parse(fileContent);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < data.entries.length; i++) {
            const entry = data.entries[i];
            
            // Only process .jpg files
            if (entry.filename.endsWith('.jpg')) {
                const oldFilePath = path.join(DATA_DIR, entry.filename);
                const newFilename = entry.filename.replace('.jpg', '.webp');
                const newFilePath = path.join(DATA_DIR, newFilename);
                
                try {
                    await fs.access(oldFilePath);
                    
                    const imageBuffer = await fs.readFile(oldFilePath);
                    const image = sharp(imageBuffer);
                    
                    // Detect cloud score
                    let cloudScore = 0;
                    if (entry.camId !== 'auroraData') {
                        cloudScore = await detectCloudScore(image);
                    }
                    
                    // Convert to WebP
                    await image
                        .webp({ quality: 85, smartSubsample: true })
                        .toFile(newFilePath);
                    
                    // Update entry
                    entry.filename = newFilename;
                    entry.cloudScore = cloudScore;
                    
                    // Delete old file
                    await fs.unlink(oldFilePath);
                    
                    migratedCount++;
                    if (migratedCount % 10 === 0) {
                        console.log(`Migrated ${migratedCount} images...`);
                    }
                } catch (err) {
                    // console.error(`Failed to migrate ${entry.filename}:`, err);
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        }
        
        data.lastUpdated = Date.now();
        await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
        
        console.log('Migration finished!');
        console.log(`Total migrated: ${migratedCount}`);
        console.log(`Total skipped/already webp: ${skippedCount}`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
