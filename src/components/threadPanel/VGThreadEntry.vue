<script setup lang="ts">
import { computed } from 'vue';
import { VGPost } from '../../app/VGPost';

const props = defineProps<{
  post: VGPost
  index: number
}>();

const emit = defineEmits<{
  select: []
}>();

const thumbnailsCount = computed(() => Math.min(5, props.post.Images.length));
const images = computed(() => props.post.Images);
</script>

<template>
    <div class="VGPostEntry" @click="emit(`select`)">
        <div id="VGThreadThumbnailContainer">
            <div
            v-for="i in thumbnailsCount"
            class="VGThreadThumbnail"
            :style="{backgroundImage: `url(${images[i - 1]?.ThumbnailURL})`}"></div>
        </div>
        <div id="VGThreadInfo">
            <span>{{ index + 1 }}.</span>
            <b>Images :</b> {{ images.length }}
        </div>
    </div>
</template>

<style scoped>
.VGPostEntry
{
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 96px;
    padding: 10px;
    background-color: rgba(255,255,255,0.1);
    margin: 0 auto;
    border-radius: 5px;
    border: 2px transparent solid;
}

.VGPostEntry.VGThreadEntrySelected
{
    border: 2px var(--vg-selection-color) solid;
}

#VGThreadThumbnailContainer
{
    display: flex;
    height: 100px;
}

#VGThreadThumbnailContainer > .VGThreadThumbnail
{
    flex-grow: 1;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center top;
}

#VGThreadInfo
{
    margin: 0;
    margin-top: 5px;
    text-align: center;
    vertical-align: middle;
    height: 20px;
    color: white;
    font-family: sans-serif;
    /*background-color: rgb(100, 100, 100);*/
}

#VGThreadInfo > span
{
    display: inline;
    float: left;
    font-weight: bold;
    font-size: 15px;
}
</style>
