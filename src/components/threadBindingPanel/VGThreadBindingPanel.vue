<script setup lang="ts">
import { computed } from 'vue';
import TeleportPrepend from '../TeleportPrepend.vue';
import VGPanel from '../VGPanel.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const galleryOpen = computed(() => route.name !== "root" && route.name !== undefined);
const url = document.location.href;

const isMobileTheme = document.querySelector(".ui-mobile-viewport") !== null;
</script>

<template>
    <TeleportPrepend :to="isMobileTheme ? `.posthead` : `#thread_controls`">
        <div id="VGPostButtons">
            <RouterLink
            v-slot="{ navigate }"
            :to="{ name: `gallery`, params: { id: url }, query : { useDOM: 1 } }"
            >
                <button @click="navigate" id="VGOpenGalleryButton">Gallery</button>
            </RouterLink>
        </div>
    </TeleportPrepend>

    <Teleport to="body">
        <VGPanel v-if="galleryOpen">
            <RouterView/>
        </VGPanel>
    </Teleport>
</template>

<style scoped>
#VGPostButtons
{
    display: flex;
    width: 100%;
    height: 100px;
    margin-bottom: 20px;
    background-color: rgb(230,230,230);
    gap: 10px;
}

#VGPostButtons a
{
    flex-grow: 1;
}

#VGPostButtons button
{
    width: 100%;
    height: 100%;
    font-size: 30px;
    font-weight: bold;
    font-family: sans-serif;
    border-style: solid;
    background-repeat: no-repeat;
    background-position: center left 50px;
}

#VGOpenGalleryButton
{
    background-image: url("../../assets/VGGalleryIcon.png");
}
</style>
