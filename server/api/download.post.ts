import { defineEventHandler, readBody, sendStream } from 'h3';
import { execSync } from 'child_process';
import { readdirSync, createReadStream, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';
import mime from 'mime-types';
import { createSha256Base64UrlHash } from '~~/server/utils/hashUtil';
import { ffmpegExists, ytDlpExists } from '~~/server/utils/commandUtil';

export default defineEventHandler(async (event) => {
	const DOWNLOADS_DIR = process.env.APP_DOWNLOAD_DIR!;
	const { videoUrl } = await readBody(event);
	const baseFileName = createSha256Base64UrlHash(videoUrl);
	let actualOutputPath:string;

	try {
		// validate
		ytDlpExists();
		ffmpegExists();

		// download file
		const outputPattern = join(DOWNLOADS_DIR, baseFileName);
		execSync(`yt-dlp -o "${outputPattern}" "${videoUrl}"`, {
			stdio: 'inherit',
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
