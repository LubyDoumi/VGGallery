<script setup lang="ts">
defineProps<{
  value: number; // between 0 and 1
}>();
</script>

<template>
    <div class="progress-bar-container">
        <div class="progress-bar-fill" :style="{ width: `${value * 100}%` }" />
    </div>
</template>

<style scoped>
.progress-bar-container
{
    width: 100%;
    height: 8px;
    background: #2a2a2a;
    border-radius: 4px;
    /*overflow: hidden;*/
}

.progress-bar-fill
{
    height: 100%;
    background: #4a90e2;
    border-radius: 4px;
}
</style>
