<script setup lang="ts">
import { saveAs } from 'file-saver';
import { nextTick } from 'vue';

const urlRef = ref<HTMLInputElement>();
const videoUrl = ref('');
const downloadStatus = ref('');
const downloadError = ref('');
const isDownloading = ref(false);
const progressMessages = ref<string[]>([]);
let eventSource: EventSource | null = null;

const closeEventSource = () => {
	if (!eventSource) return;
	eventSource.close();
	eventSource = null;
};

onUnmounted(() => {
	closeEventSource();
});

const reset = () => {
	progressMessages.value = [];
	downloadStatus.value = '';
	downloadError.value = '';
	isDownloading.value = false;
	closeEventSource();
};

const initializeDownload = async (): Promise<string> => {
	const { downloadId } = await $fetch<{ downloadId: string }>(
		'/api/generate-download-id',
		{
			method: 'POST',
			body: {
				videoUrl: videoUrl.value,
			},
		}
	);
	return downloadId;
};

const progressEventListener = async (downloadId: string) => {
	let isFirstMessage = true;
	eventSource = new EventSource(`/api/download-progress?id=${downloadId}`);
	eventSource.onmessage = (event) => {
		if (isFirstMessage) {
			isFirstMessage = false;
			downloadStatus.value = 'Downloading...';
		}
		
		const data = JSON.parse(event.data);
		progressMessages.value.push(data.message);

		// scroll to the bottom
		nextTick(() => {
			const container = document.querySelector('.progress-container')!;
			container.scrollTop = container.scrollHeight;
		});
	};
};

const downloadFile = async (downloadId: string) => {
	const { _data: blob, headers } = await $fetch.raw<Blob>('/api/download', {
		method: 'POST',
		body: {
			videoUrl: videoUrl.value,
			downloadId: downloadId,
		},
		responseType: 'blob',
	});
	downloadStatus.value = 'Video download completed!';

	const contentDisposition = headers.get('Content-Disposition')!;
	const filename = contentDisposition.match(/filename="(.+?)"/)![1];
	saveAs(blob!, filename);
};

const handleSubmit = async () => {
	try {
		reset();
		isDownloading.value = true;
		downloadStatus.value =
			'Starting video download. This may take a while for large videos...';

		const downloadId = await initializeDownload();
		await progressEventListener(downloadId);
		await downloadFile(downloadId);
	} catch (e) {
		const error = e as Error;
		console.error(`Error downloading video: ${error}`);
		downloadError.value = error.message;
		downloadStatus.value = '';
	} finally {
		isDownloading.value = false;
		closeEventSource();
	}
};
</script>

<template>
	<div class="main">
		<form @submit.prevent="handleSubmit" class="centered">
			<div class="header-container">
				<h3>Video Downloader</h3>
				<a
					href="https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options"
					target="_blank"
					class="help-link"
				>
					Help
				</a>
			</div>
			<div class="input-group">
				<input
					id="url"
					@focus="urlRef!.select()"
					ref="urlRef"
					v-model="videoUrl"
					type="text"
					placeholder="Enter video URL"
					class="url-input"
					:disabled="isDownloading"
				/>
				<button type="submit" :disabled="!videoUrl || isDownloading">
					{{ isDownloading ? 'Downloading...' : 'Download Video' }}
				</button>
			</div>
			<div
				class="status-container"
				:class="{ hidden: !downloadStatus && !downloadError }"
			>
				<div class="status-message" :class="{ hidden: !downloadStatus }">
					{{ downloadStatus || '-' }}
				</div>
				<div class="error-message" :class="{ hidden: !downloadError }">
					{{ downloadError || '-' }}
				</div>
			</div>

			<!-- Progress messages container -->
			<div
				class="progress-container"
				:class="{ hidden: !progressMessages.length }"
			>
				<div
					v-for="(message, index) in progressMessages"
					:key="index"
					class="progress-message"
				>
					{{ message }}
				</div>
			</div>
		</form>
	</div>
</template>

<style scoped>
.hidden {
	visibility: hidden;
}

.main {
	width: 100vw;
	height: 100vh;
	background-color: rgb(25, 25, 25);
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	justify-content: center;
}

.centered {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: white;
	width: min(50rem, 75%);
	gap: 1.5rem;
	padding-block: 3rem;
}

.input-group {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 1rem;
	width: 100%;
}

.url-input {
	flex-grow: 1;
	padding: 8px;
	border-radius: 4px;
	border: 1px solid #ccc;

	&[disabled] {
		color: #808080;
		cursor: not-allowed;
	}
}

button {
	cursor: pointer;
	padding: 0.5rem 1rem;
	border-radius: 4px;
	border: none;
	background-color: #4caf50;
	color: white;
	font-weight: bold;
}

button:disabled {
	background-color: #cccccc;
	color: #666666;
	cursor: not-allowed;
	opacity: 0.5;
}

.header-container {
	display: flex;
	align-items: baseline;
	justify-content: center;
	gap: 1rem;
	width: 100%;
}

.help-link {
	color: #4caf50;
	text-decoration: none;
	font-size: 0.75rem;
	font-weight: bold;
	transition: color 0.2s ease;
}

.help-link:hover {
	color: #81c784;
	text-decoration: underline;
}

.status-container {
	--status-gap: 1rem;

	position: relative;
	padding: 1.5rem var(--status-gap);
	border-radius: 8px;
	background-color: rgba(255, 255, 255, 0.1);
	width: 100%;
	text-align: center;
	text-wrap: wrap;

	.status-message {
		color: #4caf50;
		font-weight: bold;
	}

	.error-message {
		margin-top: 0.125rem;
		position: absolute;
		color: #f44336;
		font-weight: bold;
		width: calc(100% - var(--status-gap));
	}
}

.progress-container {
	flex-grow: 1;
	padding-inline: 1rem;
	border-radius: 8px;
	background-color: rgba(0, 0, 0, 0.3);
	width: 100%;
	overflow-y: auto;
	font-family: 'Courier New', sans-serif;
	font-size: 1rem;
	color: #e0e0e0;
	text-align: left;
}

.progress-message {
	padding-block: 0.25rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	white-space: pre-wrap;
	word-break: break-word;
}

.progress-message:last-child {
	border-bottom: none;
}
</style>
