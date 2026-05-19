<template>
    <div id="VGEmptyPanel">
        <p>No image found</p>
    </div>
</template>

<style scoped>
#VGEmptyPanel
{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

#VGEmptyPanel > p {
    font-size: 3rem;
    text-align: center;
    font-family: sans-serif;
    color: white;
}
</style>
