<script setup lang="ts">
import { computed, inject } from 'vue';
import { VGForum } from '../../app/VGForum';
import { useRoute } from 'vue-router';
import VGPanel from '../VGPanel.vue';

const route = useRoute();
const forum = inject<VGForum>("forum")!;
const onPage = computed(() => route.name !== "root" && route.name !== undefined);
</script>

<template>
    <Teleport v-for="entry in forum.ThreadLinks" :to="`#thread_${entry[0]}`">
        <RouterLink
        v-slot="{ navigate }"
        :to="{ name: `thread`, params: { id: entry[1] } }">
            <button @click="navigate" class="VGThreadButton">Gallery</button>
        </RouterLink>
    </Teleport>

    <Teleport to="body">
        <VGPanel v-if="onPage">
            <RouterView />
        </VGPanel>
    </Teleport>
</template>

<style>
li.threadbit div.threadinfo {
    position: relative;
}
</style>

<style scoped>
.VGThreadButton
{
    position: absolute;
    top: 5px;
    bottom: 5px;
    right: 5px;
    width: 120px;
    font-weight: bold;
    font-family: sans-serif;
    border: 1px solid gray;
    background-color: rgb(230,230,230);
    background-image: url("../../assets/VGGalleryIcon.png");
    background-repeat: no-repeat;
    background-position: center left 10px;
    background-size: 16px 16px;
}

.ui-mobile-viewport .VGThreadButton
{
    right: 100px;
}
</style>
