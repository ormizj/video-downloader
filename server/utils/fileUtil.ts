import { existsSync, mkdirSync } from 'fs';

export const ensureDirectory = (directory: string) => {
	if (!existsSync(directory)) {
		mkdirSync(directory, { recursive: true });
	}
};
