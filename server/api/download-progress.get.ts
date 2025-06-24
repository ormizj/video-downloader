import { defineEventHandler } from 'h3';

export const progressStore: Record<string, string[]> = {};
const listeners: Record<string, Set<any>> = {};

export const sendMessageToListeners = (downloadId: string, message: string) => {
	if (!listeners[downloadId]) return;
	progressStore[downloadId].push(message);

	for (const res of listeners[downloadId]) {
		res.write(`data: ${JSON.stringify({ message })}\n\n`);
	}
};

export default defineEventHandler(async (event) => {
	// initialize
	const downloadId = event.node.req.url?.split('?id=')[1]!;
	if (!progressStore[downloadId]) progressStore[downloadId] = [];
	if (!listeners[downloadId]) listeners[downloadId] = new Set();

	// headers
	event.node.res.setHeader('Content-Type', 'text/event-stream');
	event.node.res.setHeader('Cache-Control', 'no-cache');
	event.node.res.setHeader('Connection', 'keep-alive');

	listeners[downloadId].add(event.node.res);

	// keep connection open
	return new Promise(() => {
		// cleanup
		event.node.req.on('close', () => {
			if (listeners[downloadId]) {
				listeners[downloadId].delete(event.node.res);

				if (listeners[downloadId].size === 0) {
					delete listeners[downloadId];
					delete progressStore[downloadId];
				}
			}
		});
	});
});
