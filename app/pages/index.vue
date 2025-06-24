<script setup lang="ts">
import { saveAs } from 'file-saver';

const videoUrl = ref('');

const handleDownloadVideo = async () => {
	try {
		const emptyBlob = new Blob([], { type: 'video/mp4' });
		const initialFileName =
			new URL(videoUrl.value).pathname.split('/').pop() || 'video.mp4';

		// Save the empty file
		saveAs(emptyBlob, initialFileName);

		// Automatically send the file path to the server
		await $fetch('/api/download', {
			method: 'POST',
			body: {
				videoUrl: videoUrl.value,
				filePath: initialFileName,
			},
		});

		alert('Video download request sent to server successfully!');
	} catch (error) {
		alert('Error downloading video');
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
