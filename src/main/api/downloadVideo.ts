import { dialog } from 'electron';
import { readdirSync } from 'fs';
import { join } from 'path';
import { ytDlpExists, ffmpegExists, executeYtDlp } from '../utils/commandUtil';
import { DOWNLOADS_DIR } from '../config';

export const downloadVideo = async (videoUrl: string, downloadId: string) => {
	const baseFileName = downloadId;

	try {
		// validate
		ytDlpExists();
		ffmpegExists();

		// execute yt-dlp
		const outputPattern = join(DOWNLOADS_DIR, baseFileName);
		await executeYtDlp(videoUrl, outputPattern, downloadId);

		// get downloaded file
		const files = readdirSync(DOWNLOADS_DIR);
		const downloadedFile = files.find((file) => file.startsWith(baseFileName));
		if (!downloadedFile) {
			throw new Error('Downloaded file not found');
		}

		// download file
		const { filePath } = await dialog.showSaveDialog({
			defaultPath: downloadedFile,
			filters: [{ name: 'All Files', extensions: ['*'] }],
		});
		if (!filePath) {
			throw new Error('Save operation cancelled');
		}

		return {
			success: true,
			message: null,
			error: null,
		};
	} catch (e) {
		const error = e as Error;
		console.error(`Error downloading video: ${videoUrl}`, error);
		return {
			success: false,
			message: error.message,
			error: error,
		};
	}
};
