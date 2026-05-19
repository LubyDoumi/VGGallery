<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import VGGalleryThumbnail from './VGGalleryThumbnail.vue';
import VGGalleryViewport from './VGGalleryViewport.vue';
import { VGController } from '../../app/VGController';
import { GalleryNavigationButtonComponent } from '../../app/components/GalleryNavigationButtonComponent';
import VGProgressBar from '../VGProgressBar.vue';
import { Utils } from '../../app/helpers/Utils';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { VGImage } from '../../app/VGImage';
import { VGPost } from '../../app/VGPost';
import VGEmptyPanel from '../VGEmptyPanel.vue';

const props = defineProps<{
  controller: VGController,
  post: VGPost
}>();

/////

onMounted(() => {
  props.post.SelectImage(0);
});

onUnmounted(() => {
  props.post?.StopSlideshow();
});

/////

const slideshowProgress = Utils.Poll(() => props.post.SlideshowProgress, 16);
const hasImage = computed(() => props.post.Images.length > 0);
const imageContainer = ref<HTMLElement | null>(null);
const prevRef = ref<HTMLDivElement | null>(null);
const nextRef = ref<HTMLDivElement | null>(null);
const slideshowSpeedButton = ref<HTMLElement | null>(null);
const thumbnailScroller = ref<InstanceType<typeof RecycleScroller> | null>(null);
const thumbnailItems = computed(() =>
  props.post.Images.map((image, index) => ({ id: index, image }))
);

function scrollThumbnailToCenter(index: number, smooth = true): void {
  const scroller = thumbnailScroller.value;
  if (!scroller) return;
  const el = scroller.$el as HTMLElement;
  const left = index * 160 - el.clientWidth / 2 + 80;
  el.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' });
}

function onThumbnailWheel(e: WheelEvent): void {
  const el = (thumbnailScroller.value?.$el as HTMLElement | undefined);
  if (!el || e.ctrlKey || e.deltaX !== 0) return;
  e.preventDefault();
  el.scrollLeft += e.deltaY;
}

GalleryNavigationButtonComponent(
  imageContainer,
  prevRef, () => props.post.PreviousImage(true),
  {
    excludeElements: [slideshowSpeedButton],
    longPressDuration: 500,
    onLongPress: () => props.post.ToggleSlideshow("backward")
  }
);

GalleryNavigationButtonComponent(
  imageContainer,
  nextRef,
  () => props.post.NextImage(true),
  {
    excludeElements: [slideshowSpeedButton],
    longPressDuration: 500,
    onLongPress: () => props.post.ToggleSlideshow("forward")
  }
);

/////

watch(() => props.post, (n, o) => {
  props.post.SelectImage(0);
  thumbnailScroller.value.scrollToItem(0);
});

watch(() => props.post.CurrentImageIndex, (index) => scrollThumbnailToCenter(index));
watch(() => props.controller.ShowThumbnails, () => {
  setTimeout(() => scrollThumbnailToCenter(props.post.CurrentImageIndex, false), 60);
});
</script>

<template>
    <div class="VGPanelRoot" ref="container"
    :class="{VGShowThumbnails: controller.ShowThumbnails, VGHideThumbnails: !controller.ShowThumbnails}"
    @keydown.left.prevent="post.PreviousImage(true)"
    @keydown.right.prevent="post.NextImage(true)"
    @keydown.down.prevent="controller.ToggleThumbnail()"
    @keydown.space.exact.prevent="post.ToggleSlideshow(`forward`)"
    @keydown.shift.space.prevent="post.ToggleSlideshow(`backward`)"
    @keydown.s.exact.prevent="post.NextSlideshowSpeed()"
    tabindex="-1"
    autofocus>
         <div v-show="hasImage" id="VGSelectedImageContainer" ref="imageContainer" >
            <VGGalleryViewport
            v-if="post.CurrentImage"
            :controller="controller"
            :image="post.CurrentImage as VGImage"
            ></VGGalleryViewport>

            <div id="VGPreviousImageButton" ref="prevRef"></div>
            <div id="VGNextImageButton" ref="nextRef"></div>

            <VGProgressBar
            v-if="post.SlideshowIsRunning"
            :value="slideshowProgress"
            :class="{ VGSlideshowReverse: post.SlideshowMode === `backward` }"
            id="VGSlideshowProgress"></VGProgressBar>

            <div
            ref="slideshowSpeedButton"
            v-if="post.SlideshowIsRunning"
            @click.stop.prevent="post.NextSlideshowSpeed()"
            id="VGSlideshowSpeedButton"></div>
        </div>

        <VGEmptyPanel v-if="!hasImage" />

        <RecycleScroller
        v-if="hasImage"
        id="VGThumbnails"
        ref="thumbnailScroller"
        :items="thumbnailItems"
        :item-size="160"
        direction="horizontal"
        key-field="id"
        v-slot="{ item }"
        @wheel="onThumbnailWheel"
        >
            <VGGalleryThumbnail
            :controller="controller"
            :post="post as VGPost"
            :image="item.image"
            @select="post.SelectImage(item.id)"
            ></VGGalleryThumbnail>
        </RecycleScroller>

        <p v-if="hasImage" id="VGGalleryProgression">{{ (post.CurrentImageIndex + 1) }} / {{ post.Images.length }}</p>
        <button v-if="hasImage" @click="controller.ToggleThumbnail()" id="VGToggleThumbnailsButton" class="vg-icon-button"></button>
    </div>
</template>

<style scoped>
.VGPanelRoot
{
    flex-grow: 1;
}

#VGToggleThumbnailsButton
{
    bottom: 0;
    left: 0;
    height: 170px;
    background-image: url("../../assets/VGGalleryIcon.png");
    background-position: center bottom 10px;
}

#VGGalleryProgression
{
    position: absolute;
    bottom: 50px;
    left: 10px;
    height: auto;
    width: 50px;
    padding: 2px;
    color: white;
    font-weight: bold;
    font-size: 13px;
    font-family: sans-serif;
    text-align: center;
    text-wrap-mode: wrap;
    text-wrap-style:pretty;
    background-color: rgba(0,0,0,0.3);
    border-radius: 3px;
}

#VGPreviousImageButton
{
    position: absolute;
    border: none;
    background-color:  rgba(0,0,0,0);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 50%;
    pointer-events: none;
}

#VGNextImageButton
{
    position: absolute;
    border: none;
    background-color: rgba(0,0,0,0);
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 50%;
    pointer-events: none;

}

#VGSelectedImageContainer
{
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
}

#VGSelectedImageContainer > #VGSelectedImage
{
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
}

.VGShowThumbnails #VGThumbnails
{
    opacity: 1;
    display: block;
}

.VGHideThumbnails #VGThumbnails
{
    opacity: 0;
    display: none;
}

.VGShowThumbnails #VGSelectedImageContainer
{
    height: calc(100% - 170px);
}

.VGHideThumbnails #VGSelectedImageContainer
{
    height: 100%;
}

#VGThumbnails
{
    position: absolute;
    left: 80px;
    right: 0;
    bottom: 0;
    height: 170px;
    padding-top: 5px;
    box-sizing: border-box;
    background-color: var(--vg-overlay-bg);
    overflow-x: scroll;
}

#VGSlideshowProgress
{
    position: absolute;
    bottom: 10px;
    width: 50px;
    height: 5px;
    opacity: 0.5;
}

#VGSlideshowProgress.VGSlideshowReverse
{
    transform: scaleX(-1);
}

#VGSlideshowProgress :deep(.progress-bar-fill)
{
    background-color: white;
}

#VGSlideshowProgress.progress-bar-container
{
    border-width: 2px;
    border-style: solid;
    border-color: rgba(0,0,0,0.5);
}

#VGSlideshowSpeedButton
{
    position: absolute;
    bottom: 0;
    width: 80px;
    height: 80px;
}
</style>
