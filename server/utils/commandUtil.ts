import { execSync } from 'child_process';

export const ytDlpExists = () => {
	try {
		execSync('yt-dlp --version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		throw new Error('"yt-dlp" is not installed or not in PATH');
	}
};

export const ffmpegExists = () => {
	try {
		execSync('ffmpeg -version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		throw new Error('"ffmpeg" is not installed or not in PATH');
	}
};
