<script setup lang="ts">
import { VGImage } from '../../app/VGImage';
import { VGController } from '../../app/VGController';
import { VGPost } from '../../app/VGPost';

const props = defineProps<{
  controller: VGController,
  post: VGPost,
  image: VGImage
}>();

const emit = defineEmits<{
  select: []
}>();
</script>

<template>
    <a @click.prevent="emit('select')" class="VGThumbnailLink">
        <img :src="props.image.ThumbnailURL" class="VGThumbnail"/>
        <div class="VGThumbnailSelection" :class="{ VGThumbnailSelected: image === post.CurrentImage }"></div>
    </a>
</template>

<style scoped>
.VGThumbnailLink
{
    position: relative;
    bottom: 0;
    display: block;
    width: 150px;
    height: 100%;
    box-sizing: border-box;
}

.VGThumbnail
{
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.VGThumbnailSelection
{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.VGThumbnailSelection.VGThumbnailSelected
{
    border-width: 3px;
    border-color: var(--vg-selection-color);
    border-style: solid;
}
</style>
