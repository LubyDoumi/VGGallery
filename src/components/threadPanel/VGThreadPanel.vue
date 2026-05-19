<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { VGThread } from '../../app/VGThread';
import { VGController } from '../../app/VGController';
import VGGalleryPanel from '../galleryPanel/VGGalleryPanel.vue';
import { VGPost } from '../../app/VGPost';
import { DOMThreadFetcher } from '../../app/threadFetcher/DOMThreadFetcher';
import VGLoadingSpinner from '../VGLoadingSpinner.vue';
import VGEmptyPanel from '../VGEmptyPanel.vue';
import VGThreadPostList from './VGThreadPostList.vue';
import VGDownloadList from './VGDownloadList.vue';

const controller = inject<VGController>("controller")!;
const route = useRoute();
const useDOM = computed(() => route.query.useDOM == "1");
const threadLink = computed(() => route.params.id as string);
const hasPost = computed(() => currentPost.value !== null);
const thread = ref<VGThread | null>(null);
const currentPost = ref<VGPost | null>(null);
const showPosts = ref(false);
const shownDownload = ref(false);
const fetching = ref(true);

/////

function Select(post: VGPost)
{
  currentPost.value = post;
  showPosts.value = false;
}

function CreateThread(): VGThread {
  if (useDOM.value) return new VGThread(controller, new DOMThreadFetcher());

  return controller.GetCachedThread(threadLink.value ?? "")
    ?? controller.CreateCacheThread(threadLink.value ?? "")
}

/////

onMounted(async () => {
  const threadInstance = CreateThread();

  thread.value = reactive(threadInstance);

  await thread.value.FetchPosts();

  if (thread.value.PostCount > 0)
  {
    currentPost.value = thread.value.Posts.get(thread.value.PostIDs[0])!;
    showPosts.value = thread.value.PostCount > 1;
  }

  fetching.value = false;

});
</script>

<template>
    <div class="VGPanelRoot" id="VGThreadPanel" v-if="fetching === false">
        <VGEmptyPanel v-if="(thread?.PostCount ?? 0) === 0"/>

        <VGGalleryPanel :controller="controller" :post="currentPost as VGPost" v-if="hasPost"></VGGalleryPanel>

        <VGDownloadList
        v-if="shownDownload && hasPost"
        :controller="controller"
        :post="currentPost as VGPost"/>

        <VGThreadPostList
        v-show="showPosts"
        :thread="thread as VGThread"
        :currentPost="currentPost as VGPost"
        @select="Select"/>

        <button
        v-if="(thread?.PostCount ?? 0) > 1"
        id="VGShowPostsButton"
        class="vg-icon-button"
        :class="{
          VGThreadShowPosts: showPosts,
          VGThreadHidePosts: !showPosts
        }"
        @click.stop="showPosts = !showPosts"></button>

        <button
        v-if="hasPost"
        class="vg-icon-button"
        :class="{
          VGDownloadShow: shownDownload,
          VGDownloadButtonWithThumbnails: controller.ShowThumbnails
        }"
        @click="shownDownload = !shownDownload" id="VGDownloadButton"></button>
    </div>

    <div v-if="fetching" id="VGThreadLoadingContainer">
        <VGLoadingSpinner />
    </div>
</template>

<style scoped>
.VGPanelRoot
{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

#VGThreadLoadingContainer
{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
}


#VGShowPostsButton
{
    bottom: 100px;
    background-image: url("../../assets/VGMenuIcon.png");
}

#VGShowPostsButton.VGThreadShowPosts
{
    background-color: black;
    opacity: 1;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
}

#VGDownloadButton
{
    bottom: 0;
    right: 0;
    background-image: url("../../assets/VGDownloadIcon.png");
}

#VGDownloadButton.VGDownloadButtonWithThumbnails
{
    bottom: 170px;
}

#VGDownloadButton.VGDownloadShow
{
    background-color: black;
    opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
}

</style>
