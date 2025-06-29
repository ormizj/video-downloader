import { ipcMain } from 'electron';
import { generateDownloadId } from './api/generateDownloadId';
import { getProgressMessages } from './api/progressHandler';
import { downloadVideo } from './api/downloadVideo';

export const setupIpcHandlers = () => {
	ipcMain.handle('generate-download-id', async (_, videoUrl: string) => {
		return generateDownloadId(videoUrl);
	});

	ipcMain.handle('get-download-progress', (_, downloadId: string) => {
		return getProgressMessages(downloadId);
	});

	ipcMain.handle('download-video', async (_, { videoUrl, downloadId }) => {
		return downloadVideo(videoUrl, downloadId);
	});
};
