import { BrowserWindow } from 'electron';

export const progressStore: Record<string, string[]> = {};

export const sendMessageToListeners = (downloadId: string, message: string) => {
	if (!progressStore[downloadId]) {
		progressStore[downloadId] = [];
	}
	progressStore[downloadId].push(message);

	BrowserWindow.getAllWindows().forEach((window) => {
		window.webContents.send('download-progress', {
			downloadId,
			message,
		});
	});
};

export const getProgressMessages = (downloadId: string): string[] => {
	return progressStore[downloadId] || [];
};

export const clearProgressMessages = (downloadId: string): void => {
	delete progressStore[downloadId];
};
