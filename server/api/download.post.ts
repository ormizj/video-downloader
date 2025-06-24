import { defineEventHandler, readBody, sendStream } from 'h3';
import { execSync } from 'child_process';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	createReadStream,
} from 'fs';
import { join, resolve } from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { stat } from 'fs/promises';

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

		const stats = await stat(actualOutputPath);

		const fileBuffer = readFileSync(actualOutputPath, {
			start: 0,
			end: Math.min(stats.size, 4100),
		});
		const fileType = await fileTypeFromBuffer(fileBuffer);

		let contentType = 'application/octet-stream';

		if (fileType && fileType.mime) {
			contentType = fileType.mime;
		} else {
			// Fallback to extension-based detection
			const fileExtension = downloadedFile.split('.').pop() || '';
			if (fileExtension === 'mp4') contentType = 'video/mp4';
			else if (fileExtension === 'webm') contentType = 'video/webm';
			else if (fileExtension === 'mkv') contentType = 'video/x-matroska';
			else if (fileExtension === 'avi') contentType = 'video/x-msvideo';
			else if (fileExtension === 'mov') contentType = 'video/quicktime';
		}

		console.log('Detected file type:', contentType);
		console.log('Video downloaded successfully, streaming to client');

		// Set response headers
		event.node.res.setHeader('Content-Type', contentType);
		event.node.res.setHeader('Content-Length', stats.size);
		event.node.res.setHeader(
			'Content-Disposition',
			`attachment; filename="${downloadedFile}"`
		);

		const stream = createReadStream(actualOutputPath);
		return sendStream(event, stream);
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
