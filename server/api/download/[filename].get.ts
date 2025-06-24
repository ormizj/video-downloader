import { defineEventHandler, sendStream } from 'h3';
import { createReadStream, existsSync } from 'fs';
import { join, resolve } from 'path';
import { stat } from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import { readFileSync } from 'fs';

const DOWNLOADS_DIR = resolve(process.cwd(), 'downloads');

export default defineEventHandler(async (event) => {
	const filename = event.context.params.filename;

	if (!filename) {
		return {
			statusCode: 400,
			body: 'Filename is required',
		};
	}

	const filePath = join(DOWNLOADS_DIR, filename);

	if (!existsSync(filePath)) {
		return {
			statusCode: 404,
			body: `File not found: ${filename}`,
		};
	}

	try {
		// Get file stats to determine size
		const stats = await stat(filePath);

		const fileBuffer = readFileSync(filePath, {
			start: 0,
			end: Math.min(stats.size, 4100),
		});
		const fileType = await fileTypeFromBuffer(fileBuffer);

		let contentType = 'application/octet-stream';

		if (fileType && fileType.mime) {
			contentType = fileType.mime;
		} else {
			const fileExtension = filename.split('.').pop() || '';
			if (fileExtension === 'mp4') contentType = 'video/mp4';
			else if (fileExtension === 'webm') contentType = 'video/webm';
			else if (fileExtension === 'mkv') contentType = 'video/x-matroska';
			else if (fileExtension === 'avi') contentType = 'video/x-msvideo';
			else if (fileExtension === 'mov') contentType = 'video/quicktime';
		}

		event.node.res.setHeader('Content-Type', contentType);
		event.node.res.setHeader('Content-Length', stats.size);
		event.node.res.setHeader(
			'Content-Disposition',
			`attachment; filename="${filename}"`
		);

		const stream = createReadStream(filePath);
		return sendStream(event, stream);
	} catch (error) {
		console.error(`Error streaming file ${filename}:`, error);
		return {
			statusCode: 500,
			body: `Error streaming file: ${error.message}`,
		};
	}
});
