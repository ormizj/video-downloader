import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
	generateDownloadId(videoUrl: string) {
		return ipcRenderer.invoke('generate-download-id', videoUrl);
	},

	downloadVideo(videoUrl: string, downloadId: string) {
		return ipcRenderer.invoke('download-video', { videoUrl, downloadId });
	},

	onDownloadProgress(callback: (data: string) => void) {
		const listener = (_: unknown, data: string) => callback(data);
		ipcRenderer.on('download-progress', listener);
		return () => {
			ipcRenderer.removeListener('download-progress', listener);
		};
	},
});
