<script setup lang="ts">
import { computed } from 'vue';
import { VGController } from '../../app/VGController';
import VGDownloadImageEntry from './VGDownloadImageEntry.vue';
import VGProgressBar from '../VGProgressBar.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { VGPost } from '../../app/VGPost';

const props = defineProps<{
  controller: VGController,
  post: VGPost
}>();

/////

const hasImage = computed(() => props.post.Images.length > 0);

const imageRows = computed(() =>
  props.post.Images.map((image, i) => ({ id: i, image, index: i }))
);
</script>

<template>
    <div id="VGDownloadList">
        <RecycleScroller
        v-if="hasImage"
        id="VGImagesContainer"
        :items="imageRows"
        :item-size="35"
        key-field="id"
        v-slot="{ item }"
        >
            <VGDownloadImageEntry
            :controller="controller"
            :image="item.image"
            :index="item.index"
            ></VGDownloadImageEntry>
        </RecycleScroller>

        <button v-if="hasImage"
        @click="post.Downloader.Download()"
        :disabled="post.Downloader.Status !== `ready`"
        :class="{ VGDownloadButtonWithThumbnails: controller.ShowThumbnails }"
        id="VGDownloadButton">
            <p v-if="post.Downloader.Status === `ready`">Download</p>
            <p v-if="post.Downloader.Status === `zip`">Zipping ...</p>
            <VGProgressBar v-if="post.Downloader.Status === `pending`" :value="post.Downloader.Progress" id="VGDownloadProgress"></VGProgressBar>
        </button>
    </div>
</template>

<style scoped>
#VGDownloadList
{
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: calc(min(500px, 100%) + 1px);
    box-sizing: border-box;
    padding: 20px;
    padding-top: 80px;
    background-color: black;
    border-left: var(--vg-panel-border-color) 1px solid;
    display: flex;
    height: 100%;
    flex-direction: column;
}

#VGImagesContainer
{
    flex-grow: 1;
    overflow: hidden;
    height: 100%;
    padding: 0 5px;
    border-radius: 20px;
    overflow-y: scroll;
    background-color: var(--vg-overlay-bg);
    overscroll-behavior: none;
}

#VGDownloadButton
{
    margin-top: 20px;
    width: 80%;
    height: 50px;
    flex-shrink: 0;
    font-size: 20px;
    font-family: sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    border-style: none;
    border-radius: 10px;
    color: black;
}

#VGDownloadButton.VGDownloadButtonWithThumbnails
{
    width: 100%;
}

.VGShowThumbnails #VGDownloadButton
{
    width: 100%;
}

#VGDownloadButton > p
{
    margin: 0;
    padding: 0;
}

#VGDownloadProgress
{
    position: relative;
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
}

#VGNoImageWarning
{
    position: relative;
    top: 50%;
    transform: translateY(-50%);
}
</style>
