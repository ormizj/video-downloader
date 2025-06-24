import { execSync } from 'child_process';

export const ytDlpExists = () => {
	try {
		execSync('yt-dlp --version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		return false;
	}
};

export const ffmpegExists = () => {
	try {
		execSync('ffmpeg -version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		return false;
	}
};
