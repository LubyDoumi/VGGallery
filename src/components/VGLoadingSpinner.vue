<template>
    <div class="vg-loading-spinner"></div>
</template>

<style scoped>
@keyframes vg-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.vg-loading-spinner {
    width: 32px;
    height: 32px;
    background-image: url("../assets/VGLoadingIcon.png");
    background-repeat: no-repeat;
    background-position: center;
    animation: vg-spin 3s linear infinite;
}
</style>
