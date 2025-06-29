/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
	generateDownloadId: (videoUrl: string) => Promise<{ downloadId: string }>;
	downloadVideo: (
		videoUrl: string,
		downloadId: string
	) => Promise<
		| {
				success: true;
				message: null;
				error: null;
		  }
		| {
				success: false;
				message: string;
				error: Error;
		  }
	>;
	onDownloadProgress: (
		callback: (data: { downloadId: string; message: string }) => void
	) => () => void;
}

declare global {
	interface Window {
		electronAPI: ElectronApi;
	}
}
