import { app, BrowserWindow } from 'electron';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';

// Define the downloads directory path
const DOWNLOADS_DIR = resolve(process.cwd(), 'downloads');

// Ensure the downloads directory exists
const ensureDownloadsDir = () => {
  if (!existsSync(DOWNLOADS_DIR)) {
    mkdirSync(DOWNLOADS_DIR, { recursive: true });
    console.log(`Created downloads directory at: ${DOWNLOADS_DIR}`);
  }
};

// Clean the downloads directory
const cleanDownloadsDir = () => {
  if (existsSync(DOWNLOADS_DIR)) {
    try {
      const files = readdirSync(DOWNLOADS_DIR);
      for (const file of files) {
        unlinkSync(join(DOWNLOADS_DIR, file));
        console.log(`Deleted file: ${file}`);
      }
      console.log('Downloads directory cleaned');
    } catch (error) {
      console.error('Error cleaning downloads directory:', error);
    }
  }
};

app.whenReady().then(() => {
  // Ensure downloads directory exists on startup
  ensureDownloadsDir();

  new BrowserWindow().loadURL(process.env.VITE_DEV_SERVER_URL!);
});

// Clean downloads directory when app is about to quit
app.on('will-quit', () => {
  console.log('Application is quitting, cleaning downloads directory...');
  cleanDownloadsDir();
});
