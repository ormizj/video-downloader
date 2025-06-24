import { defineEventHandler, readBody } from 'h3';
import { createSha256Base64UrlHash } from '~~/server/utils/hashUtil';
import { progressStore } from './download-progress.get';

export default defineEventHandler(async (event) => {
	const { videoUrl } = await readBody(event);
	const downloadId = createSha256Base64UrlHash(videoUrl);
	progressStore[downloadId] = [];
	return {
		downloadId,
	};
});
