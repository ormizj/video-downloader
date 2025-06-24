import { app, BrowserWindow } from 'electron';
import { cleanDirectory, ensureDirectory } from '../server/utils/fileUtil';

const DOWNLOADS_DIR = process.env.APP_DOWNLOAD_DIR!;

app.whenReady().then(() => {
	ensureDirectory(DOWNLOADS_DIR);
	cleanDirectory(DOWNLOADS_DIR);
	new BrowserWindow({
		icon: 'public/icon.svg',
		width: 800,
		height: 600
	})
		.loadURL(process.env.VITE_DEV_SERVER_URL!)
		.catch(console.error);
});

app.on('will-quit', () => {
	cleanDirectory(DOWNLOADS_DIR);
});
