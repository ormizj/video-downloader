import { defineEventHandler, readBody } from 'h3';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const DOWNLOADS_DIR = resolve(process.cwd(), 'downloads');

const ensureDownloadsDir = () => {
	if (!existsSync(DOWNLOADS_DIR)) {
		mkdirSync(DOWNLOADS_DIR, { recursive: true });
		console.log(`Created downloads directory at: ${DOWNLOADS_DIR}`);
	}
};

const ytDlpExists = () => {
	try {
		execSync('yt-dlp --version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		return false;
	}
};

const ffmpegExists = () => {
	try {
		execSync('ffmpeg -version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		return false;
	}
};

export default defineEventHandler(async (event) => {
	const { videoUrl, fileName } = await readBody(event);

	console.log('Received video download request:', { videoUrl, fileName });

	const isYtDlpInstalled = ytDlpExists();
	const isFfmpegInstalled = ffmpegExists();

	if (!isYtDlpInstalled || !isFfmpegInstalled) {
		console.error('Required commands not found:', {
			'yt-dlp': isYtDlpInstalled ? 'Found' : 'Not found',
			'ffmpeg': isFfmpegInstalled ? 'Found' : 'Not found',
		});

		return {
			success: false,
			message: 'Required software not installed',
			error:
				`Missing required software: ${!isYtDlpInstalled ? 'yt-dlp' : ''} ${!isFfmpegInstalled ? 'ffmpeg' : ''}`.trim(),
		};
	}

	try {
		ensureDownloadsDir();
		let baseFileName = fileName;
		baseFileName = baseFileName.replace(/\.[^/.]+$/, '');
		baseFileName = baseFileName.replace(/[/\\?%*:|"<>]/g, '_');

		const outputPattern = join(DOWNLOADS_DIR, baseFileName);

		console.log('Downloading video from:', videoUrl);
		console.log('Output pattern:', outputPattern);

		execSync(`yt-dlp -o "${outputPattern}" "${videoUrl}"`, {
			stdio: 'inherit',
		});

		const files = readdirSync(DOWNLOADS_DIR);
		const downloadedFile = files.find((file) => file.startsWith(baseFileName));

		if (!downloadedFile) {
			throw new Error(
				`Downloaded file not found for base name: ${baseFileName}`
			);
		}

		const actualOutputPath = join(DOWNLOADS_DIR, downloadedFile);
		console.log('Actual downloaded file:', actualOutputPath);

		const fileExtension = downloadedFile.split('.').pop();

		console.log('Video downloaded successfully, sending back to client');

		return {
			success: true,
			message: 'Video downloaded successfully',
			fileName: downloadedFile,
			fileExtension: fileExtension,
		};
	} catch (e) {
		const error = e as Error;
		console.error('Error downloading video:', error);
		return {
			success: false,
			message: 'Error downloading video',
			error: error.message,
		};
	}
});
