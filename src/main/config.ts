import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';

export const DOWNLOADS_DIR = join(
	app.getPath('temp'),
	`${app.getName()}_${app.getVersion()}_downloads`.toLowerCase()
);

export const initializeDirectories = () => {
	if (existsSync(DOWNLOADS_DIR)) return;
	mkdirSync(DOWNLOADS_DIR, { recursive: true });
};

export const cleanupDirectories = () => {
	if (!existsSync(DOWNLOADS_DIR)) return;
	rmSync(DOWNLOADS_DIR, { recursive: true, force: true });
};
