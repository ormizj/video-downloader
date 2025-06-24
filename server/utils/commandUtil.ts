import {  execFileSync, spawn } from 'child_process';
import { sendMessageToListeners } from '../api/download-progress.get';

export const ytDlpExists = () => {
	try {
		execFileSync('yt-dlp', ['--version'], { stdio: 'ignore' });
		return true;
	} catch (error) {
		throw new Error('"yt-dlp" is not installed or not in PATH');
	}
};

export const ffmpegExists = () => {
	try {
		execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
		return true;
	} catch (error) {
		throw new Error('"ffmpeg" is not installed or not in PATH');
	}
};

export const executeYtDlp = (
	videoUrl: string,
	outputPattern: string,
	downloadId: string
): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		const ytDlp = spawn('yt-dlp', ['-o', outputPattern, videoUrl], { shell: false });

		ytDlp.stdout.on('data', (data) => {
			const message = data.toString().trim();
			if (message) {
				sendMessageToListeners(downloadId, message);
			}
		});

		ytDlp.stderr.on('data', (data) => {
			const message = data.toString().trim();
			if (message) {
				sendMessageToListeners(downloadId, `Error: ${message}`);
			}
		});

		ytDlp.on('close', (code) => {
			if (code === 0) {
				sendMessageToListeners(downloadId, 'Download completed successfully.');
				resolve();
			} else {
				const errorMsg = `Process exited with code ${code}`;
				sendMessageToListeners(downloadId, errorMsg);
				reject(new Error(errorMsg));
			}
		});

		ytDlp.on('error', (err) => {
			sendMessageToListeners(
				downloadId,
				`Failed to start process: ${err.message}`
			);
			reject(err);
		});
	});
};
