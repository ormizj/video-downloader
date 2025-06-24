import { defineEventHandler, readBody, sendStream } from 'h3';
import {  spawn } from 'child_process';
import { readdirSync, createReadStream, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';
import mime from 'mime-types';
import { ffmpegExists, ytDlpExists } from '~~/server/utils/commandUtil';
import {  sendMessageToListeners } from './download-progress.get';

export default defineEventHandler(async (event) => {
	const DOWNLOADS_DIR = process.env.APP_DOWNLOAD_DIR!;
	const { videoUrl, downloadId } = await readBody(event);
	const baseFileName = downloadId;
	let actualOutputPath: string;

	try {
		// validate
		ytDlpExists();
		ffmpegExists();

		// download file
		const outputPattern = join(DOWNLOADS_DIR, baseFileName);
		await new Promise<void>((resolve, reject) => {
			const ytDlp = spawn('yt-dlp', ['-o', outputPattern, videoUrl]);

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
					sendMessageToListeners(
						downloadId,
						'Download completed successfully.'
					);
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

		// get the downloaded file
		const files = readdirSync(DOWNLOADS_DIR);
		const downloadedFile = files.find((file) => file.startsWith(baseFileName))!;

		// path to the downloaded file
		actualOutputPath = join(DOWNLOADS_DIR, downloadedFile);
		const stats = await stat(actualOutputPath);

		// get file extension
		const fileExtension = downloadedFile.split('.').pop()!;
		const contentType = mime.lookup(fileExtension) as string;

		// set headers
		event.node.res.setHeader('Content-Type', contentType);
		event.node.res.setHeader('Content-Length', stats.size);
		event.node.res.setHeader(
			'Content-Disposition',
			`attachment; filename="${downloadedFile}"`
		);

		// return file to client
		const stream = createReadStream(actualOutputPath);
		return sendStream(event, stream);
	} catch (e) {
		const error = e as Error;
		console.error(`Error downloading video: ${videoUrl}`, error);
		event.node.res.statusCode = 422;
		return {
			success: false,
			message: error.message,
			error: error,
		};
	} finally {
		event.node.res.on('finish', () => {
			if (existsSync(actualOutputPath)) {
				unlinkSync(actualOutputPath);
			}
		});
	}
});
