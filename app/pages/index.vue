<script setup>
import { ref } from 'vue'
import { saveAs } from 'file-saver'

const fileInput = ref(null);
const res = await useFetch(`/api/excell/clear`, { method: 'POST' });
if (import.meta.client && res.error.value) alert(`Something went wrong, couldn't clear previously uploaded files, reinstall the application`);

const handleMergeExcel = async () => {
    try {
        const res = await $fetch('/api/excell/merge', {
            method: 'POST'
        });
        saveAs(res);

    } catch {
        alert('Error merging files');
    }
}

const handleUploadExcel = async () => {
    const formData = new FormData()
    for (let i = 0; i < fileInput.value.files.length; i++) {
        formData.append('files', fileInput.value.files[i])
    }

    try {
        await $fetch('/api/excell/upload', {
            method: 'POST',
            body: formData
        });
    } catch {
        alert('Error uploading files');
    }
}
</script>

<template>
    <div class="overlay">
        <div class="long overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="short overlay-element"></div>
        <div class="long overlay-element"></div>
    </div>
    <div class="main">
        <div class="centered">
            <h3>Upload a folders containing ".xls/x" files and then press "Merge Excels"</h3>
            <br>
            <div>
                <input ref="fileInput" type="file" name="file" webkitdirectory directory @change="handleUploadExcel">
                <button @click="handleMergeExcel">Merge Excels</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 100vw;
    z-index: 200;
    pointer-events: none;
    /* Allow events to pass through */
}

.overlay-element {
    pointer-events: auto;
    /* Capture events on filled areas */
}

.long {
    background-color: blue;
    height: 30px;
    width: 100%;
}

.short {
    background-color: blue;
    height: 30px;
    width: 10%;
}



.main {
    width: 100vw;
    height: 100vh;
    background-color: rgb(25, 25, 25);
    position: fixed;
    top: 0;
    left: 0
}

.centered {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
}

.status {
    font-size: larger;
}

button {
    cursor: pointer;
}
</style>