<script setup lang="ts">
import { nextTick, ref, onUnmounted } from 'vue';

const urlRef = ref<HTMLInputElement>();
const progressContainerRef = ref<HTMLDivElement>();
const videoUrl = ref('');
const downloadStatus = ref('');
const downloadError = ref('');
const isDownloading = ref(false);
const progressMessages = ref<string[]>([]);
let progressListener: (() => void) | null = null;

const removeProgressListener = () => {
	if (!progressListener) return;
	progressListener();
	progressListener = null;
};

onUnmounted(() => {
	removeProgressListener();
});

const reset = () => {
	progressMessages.value = [];
	downloadStatus.value = '';
	downloadError.value = '';
	isDownloading.value = false;
	removeProgressListener();
};

const initializeDownload = async (): Promise<string> => {
	const { downloadId } = await window.electronAPI.generateDownloadId(
		videoUrl.value
	);
	return downloadId;
};

const progressEventListener = async (downloadId: string) => {
	let isFirstMessage = true;

	progressListener = window.electronAPI.onDownloadProgress((data) => {
		if (data.downloadId !== downloadId) return;

		if (isFirstMessage) {
			isFirstMessage = false;
			downloadStatus.value = 'Downloading...';
		}

		progressMessages.value.push(data.message);

		nextTick(() => {
			if (!progressContainerRef.value) return;
			progressContainerRef.value.scrollTop =
				progressContainerRef.value.scrollHeight;
		});
	});
};

const downloadFile = async (downloadId: string) => {
	const result = await window.electronAPI.downloadVideo(
		videoUrl.value,
		downloadId
	);
	if (!result.success) throw new Error(result.message);
	downloadStatus.value = 'Video download completed!';
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
		downloadStatus.value = 'Video download failed!';
		downloadError.value = error.message;
	} finally {
		isDownloading.value = false;
		removeProgressListener();
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
					tabindex="-1"
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
				<div
					class="status-message"
					:class="{
						error: downloadError,
						hidden: !downloadError && !downloadStatus,
					}"
				>
					{{ downloadError || downloadStatus || '-' }}
				</div>
			</div>
			<div
				ref="progressContainerRef"
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
	padding: 1.5rem 1rem;
	border-radius: 8px;
	background-color: rgba(255, 255, 255, 0.1);
	width: 100%;
	text-align: center;
	text-wrap: wrap;

	.status-message {
		color: #4caf50;
		font-weight: bold;

		&.error {
			color: #f44336;
		}
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
