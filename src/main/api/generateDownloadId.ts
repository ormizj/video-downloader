import { createSha256Base64UrlHash } from '../utils/hashUtil';
import { clearProgressMessages } from './progressHandler';

export const generateDownloadId = (
	videoUrl: string
): { downloadId: string } => {
	const downloadId = createSha256Base64UrlHash(videoUrl);
	clearProgressMessages(downloadId);
	return { downloadId };
};
