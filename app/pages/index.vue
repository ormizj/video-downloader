<script setup lang="ts">
import { saveAs } from 'file-saver';

const videoUrl = ref('');
const downloadStatus = ref('');
const downloadError = ref('');
const isDownloading = ref(false);

const handleDownloadVideo = async () => {
	try {
		downloadStatus.value =
			'Starting video download. This may take a while for large videos...';
		downloadError.value = '';
		isDownloading.value = true;

		const response = await fetch('/api/download', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				videoUrl: videoUrl.value,
			}),
		});

		const contentDisposition = response.headers.get('Content-Disposition')!;
		const filename = contentDisposition.match(/filename="(.+?)"/)![1];

		const blob = await response.blob();
		saveAs(blob, filename);

		downloadStatus.value = 'Video download completed!';
	} catch (e) {
		const error = e as Error;
		console.error('Error downloading video:', error);
		downloadError.value = error.message;
		downloadStatus.value = '';
	} finally {
		isDownloading.value = false;
	}
};
</script>

<template>
	<div class="main">
		<div class="centered">
			<h3>Video Downloader</h3>
			<div class="input-group">
				<input
					v-model="videoUrl"
					type="text"
					placeholder="Enter video URL"
					class="url-input"
					:disabled="isDownloading"
				/>
				<button
					@click="handleDownloadVideo"
					:disabled="!videoUrl || isDownloading"
				>
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
		</div>
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
	width: fit-content;
	min-width: 35rem;
	gap: 1rem;
}

.input-group {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 0.5rem;
	width: 100%;
}

.url-input {
	flex-grow: 1;
	padding: 8px;
	border-radius: 4px;
	border: 1px solid #ccc;
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
</style>
