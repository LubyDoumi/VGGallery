<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { VGImage } from '../../app/VGImage';
import { GalleryZoomComponent } from '../../app/components/GalleryZoomComponent';
import { GalleryImagePreloaderComponent } from '../../app/components/GalleryImagePreloaderComponent';
import { VGController } from '../../app/VGController';
import VGLoadingSpinner from '../VGLoadingSpinner.vue';

const props = defineProps<{
  controller: VGController
  image: VGImage;
}>();

/////

onMounted(() =>{
  zoomController.SetZoomData(props.image.GetZoomData(screen.orientation.type));
});

watch(() => props.image, (n, o) => {
  o.SetZoomData(screen.orientation.type, zoomController.GetZoomData());
  zoomController.SetZoomData(n.GetZoomData(screen.orientation.type));
});

watch(() => props.controller.ShowThumbnails, (n, o) => {
  zoomController.RefreshClamp();
})

/////

const containerRef = ref<HTMLElement | null>(null);
const zoomController = GalleryZoomComponent(containerRef, {
  maxScale: 5,
});

const { displayedSrc } = GalleryImagePreloaderComponent(() => props.image);

zoomController.OnOrientationChanges((prev, curr) => {
  props.image.SetZoomData(prev, zoomController.GetZoomData());
  zoomController.SetZoomData(props.image.GetZoomData(curr));
});
</script>

<template>
    <div id="VGSelectedImage" ref="containerRef">
        <img
            :src="image.ThumbnailURL"
            :style="{
              transform: `translate(${zoomController.PanX}px, ${zoomController.PanY}px) scale(${zoomController.ZoomScale})`
            }"
            draggable="false"
        />
        <img
            v-if="displayedSrc"
            :src="displayedSrc"
            :style="{
              transform: `translate(${zoomController.PanX}px, ${zoomController.PanY}px) scale(${zoomController.ZoomScale})`
            }"
            draggable="false"
        />

        <VGLoadingSpinner v-if="image.Status === `fetchingRaw`" id="VGImageLoadingIcon" />

        <div
        v-if="image.Status === `error`"
        id="VGImageError">
            <h3>Cant't load image file</h3>
            <p>Ensure that the extension as the authorization to access to "{{ image.Host.HostName }}"</p>
        </div>
    </div>
</template>

<style scoped>
#VGSelectedImage
{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
    overscroll-behavior-y: none;
}

#VGSelectedImage img
{
    transform-origin: top left;
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

#VGImageError
{
    position: absolute;
    bottom: 50px;
    padding: 5px;
    max-width: 300px;
    font-weight: bold;
    font-size: 14px;
    font-family: sans-serif;
    background-color: red;
    color: white;
    border-radius: 5px;
    text-align: center;
}

#VGImageError > h3
{
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: bold;
}

#VGImageLoadingIcon
{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
}
</style>
