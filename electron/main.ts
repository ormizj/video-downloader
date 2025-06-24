import { app, BrowserWindow } from 'electron';
import { cleanDirectory, ensureDirectory } from '../server/utils/fileUtil';

const DOWNLOADS_DIR = process.env.APP_DOWNLOAD_DIR!;

app.whenReady().then(() => {
	ensureDirectory(DOWNLOADS_DIR);
	cleanDirectory(DOWNLOADS_DIR);
	new BrowserWindow()
		.loadURL(process.env.VITE_DEV_SERVER_URL!)
		.catch(console.error);
});

app.on('will-quit', () => {
	console.log('Application is quitting, cleaning downloads directory...');
	cleanDirectory(DOWNLOADS_DIR);
});
