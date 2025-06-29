import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join } from 'path';
import { setupIpcHandlers } from './ipcHandlers';
import { initializeDirectories, cleanupDirectories } from './config';

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		title: 'Video Downloader',
		icon: join(__dirname, 'static', 'icon.png'),
		webPreferences: {
			preload: join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	if (process.env.NODE_ENV === 'development') {
		const rendererPort = process.argv[2];
		mainWindow.loadURL(`http://localhost:${rendererPort}`);
	} else {
		mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
	}
};

app.whenReady().then(() => {
	initializeDirectories();
	createWindow();
	setupIpcHandlers();

	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': ["script-src 'self'"],
			},
		});
	});

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
	cleanupDirectories();
});

ipcMain.on('message', (event, message) => {
	console.log(message);
});
