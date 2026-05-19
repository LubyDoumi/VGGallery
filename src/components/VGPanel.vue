<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue';
import { Utils } from '../app/helpers/Utils';
import { VGController } from '../app/VGController';
import { RouterLink } from 'vue-router';

const controller = inject<VGController>("controller")!;
const fullscreenAllowed = Utils.Poll(() => controller.FullscreenAllowed, 250);
const isFullscreen = Utils.Poll(() => controller.IsFullscreen, 250);

/////

onMounted(() => {
  controller.AcquireWakeLock();
  controller.DisablePinchZoom();
  controller.EnterFullscreen();

});

onUnmounted(() => {
  controller.ReleaseWakeLock();
  controller.EnablePinchZoom();
  controller.ExitFullscreen();

})
</script>

<template>
    <div id="VGPanel"
    @keydown.up.prevent="controller.ToggleFullscreen()"
    tabindex="-1"
    autofocus>
        <slot/>

        <RouterLink
        :to="{ name: `root` }"
        v-slot="navigate"
        >
            <button @click="navigate.navigate()" id="VGCloseButton" class="vg-icon-button"></button>
        </RouterLink>

        <button @click="controller.ToggleFullscreen()"
            v-if="fullscreenAllowed"
            id="VGFullscreenButton"
            class="vg-icon-button"
            :class="{
              VGFullscreenOn: isFullscreen,
              VGFullscreenOff: !isFullscreen
            }"
        ></button>
    </div>
</template>

<style>
body
{
    touch-action: pan-x pan-y;
}
</style>

<style scoped>
#VGPanel
{
    display: flex;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    background-color: rgba(0,0,0,0.95);
    z-index: 99999;
    touch-action: pan-x pan-y;
    overscroll-behavior: contain;
    justify-content: center;
}

#VGPanel > :deep(.VGPanelRoot)
{
    display: flex;
}

#VGPanel, #VGPanel *, #VGPanel :deep(*)
{
    user-select: none;
}

#VGCloseButton
{
    top: 0;
    right: 0;
    background-image: url("../assets/VGCloseIcon.png");
    mix-blend-mode: difference;
}

#VGFullscreenButton
{
    top: 0;
    left: 0;
    mix-blend-mode: difference;
}

#VGFullscreenButton.VGFullscreenOn
{
    background-image: url("../assets/VGMinimizeIcon.png");
}

#VGFullscreenButton.VGFullscreenOff
{
    background-image: url("../assets/VGFullscreenIcon.png");
}
</style>
