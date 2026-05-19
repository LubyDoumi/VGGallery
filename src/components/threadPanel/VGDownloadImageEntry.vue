<script setup lang="ts">
import { VGController } from '../../app/VGController';
import { VGImage } from '../../app/VGImage';
import VGProgressBar from '../VGProgressBar.vue';

const props = defineProps<{
  controller: VGController,
  image: VGImage,
  index: number
}>();
</script>

<template>
    <div class="VGDownloadImageEntry">
        <p class="VGImageIndex">{{ image.FetchImageFileTrack?.Error ? '❌' : index + 1 }}</p>
        <VGProgressBar
        v-if="!image.FetchImageFileTrack?.Error"
        :value="image.FetchImageFileTrack?.Progress ?? 0"
        class="VGImageProgress"></VGProgressBar>
    </div>
</template>

<style scoped>
.VGDownloadImageEntry
{
    display: flex;
    align-items: center;
    gap: 10px;
    height: 30px;
    box-sizing: border-box;
    padding: 0 10px;
    border-radius: 5px;
    border: 1px solid rgba(255,255,255,0.1);
}

.VGDownloadImageEntry:hover
{
    background-color: rgba(255,255,255,0.2);
}

.VGImageIndex
{
    margin: 0;
    min-width: 30px;
    font-size: 13px;
    font-weight: bold;
    font-family: sans-serif;
    color: white;
    text-align: right;
}

.VGImageProgress
{
    flex: 1;
    height: 6px;
}
</style>
