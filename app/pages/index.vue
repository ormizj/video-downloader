<script setup lang="ts">
import { saveAs } from 'file-saver';

const videoUrl = ref('');

const handleDownloadVideo = async () => {
	try {
		let fileName = 'video';

		alert('Starting video download. This may take a while for large videos...');

		const response = await $fetch('/api/download', {
			method: 'POST',
			body: {
				videoUrl: videoUrl.value,
				fileName: fileName,
			},
		});

		if (response && response.success) {
			const actualFileName = response.fileName;
			window.location.href = `/api/download/${actualFileName}`;
		} else {
			throw new Error(response?.message || 'Failed to download video');
		}
	} catch (e) {
		const error = e as Error;
		console.error('Error downloading video:', error);
		alert(`Error downloading video: ${error.message}`);
	}
};
</script>

<template>
	<div class="main">
		<div class="centered">
			<h3>Video Downloader</h3>
			<br />
			<div class="input-group">
				<input
					v-model="videoUrl"
					type="text"
					placeholder="Enter video URL"
					class="url-input"
				/>
				<button @click="handleDownloadVideo" :disabled="!videoUrl">
					Download Video
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.main {
	width: 100vw;
	height: 100vh;
	background-color: rgb(25, 25, 25);
	position: fixed;
	top: 0;
	left: 0;
}

.centered {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: white;
}

.input-group {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
}

.url-input {
	min-width: 300px;
	padding: 8px;
	border-radius: 4px;
	border: 1px solid #ccc;
}

button {
	cursor: pointer;
	padding: 8px 16px;
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
</style>
