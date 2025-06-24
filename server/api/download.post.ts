import { defineEventHandler, readBody, sendStream } from 'h3';
import { execSync } from 'child_process';
import { readdirSync, createReadStream } from 'fs';
import { join, resolve } from 'path';
import { stat } from 'fs/promises';
import mime from 'mime-types';
import { createSha256Base64UrlHash } from '~~/server/utils/hashUtil';
import { ensureDirectory } from '~~/server/utils/fileUtil';
import { ffmpegExists, ytDlpExists } from '~~/server/utils/commandUtil';

export default defineEventHandler(async (event) => {
	const DOWNLOADS_DIR = resolve(process.cwd(), 'downloads');
	const { videoUrl } = await readBody(event);
	const baseFileName = createSha256Base64UrlHash(videoUrl);

	console.log('Received video download request:', { videoUrl });

	const isYtDlpInstalled = ytDlpExists();
	const isFfmpegInstalled = ffmpegExists();

	if (!isYtDlpInstalled || !isFfmpegInstalled) {
		console.error('Required commands not found:', {
			'yt-dlp': isYtDlpInstalled ? 'Found' : 'Not found',
			'ffmpeg': isFfmpegInstalled ? 'Found' : 'Not found',
		});

		event.node.res.statusCode = 500;
		return {
			success: false,
			message: 'Required software not installed',
			error:
				`Missing required software: ${!isYtDlpInstalled ? 'yt-dlp' : ''} ${!isFfmpegInstalled ? 'ffmpeg' : ''}`.trim(),
		};
	}

	try {
		ensureDirectory(DOWNLOADS_DIR);
		const outputPattern = join(DOWNLOADS_DIR, baseFileName);

		console.log('Downloading video from:', videoUrl);
		console.log('Output pattern:', outputPattern);

		execSync(`yt-dlp -o "${outputPattern}" "${videoUrl}"`, {
			stdio: 'inherit',
		});

		const files = readdirSync(DOWNLOADS_DIR);
		const downloadedFile = files.find((file) => file.startsWith(baseFileName))!;

		const actualOutputPath = join(DOWNLOADS_DIR, downloadedFile);
		console.log('Actual downloaded file:', actualOutputPath);

		const stats = await stat(actualOutputPath);

		const fileExtension = downloadedFile.split('.').pop()!;
		const contentType = mime.lookup(fileExtension);

		console.log('Detected file type:', contentType);
		console.log('Video downloaded successfully, streaming to client');

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
		event.node.res.statusCode = 500;
		return {
			success: false,
			message: 'Error downloading video',
			error: error.message,
		};
	}
});
