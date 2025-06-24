import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { unlinkSync } from 'node:fs';

export const ensureDirectory = (directory: string) => {
	if (!existsSync(directory)) {
		mkdirSync(directory, { recursive: true });
	}
};

export const cleanDirectory = (directory: string) => {
	if (existsSync(directory)) {
		const files = readdirSync(directory);
		for (const file of files) {
			unlinkSync(join(directory, file));
		}
	}
};
