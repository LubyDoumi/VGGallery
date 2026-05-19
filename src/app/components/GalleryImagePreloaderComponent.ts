import { ref, watch } from "vue";
import { VGImage } from "../VGImage";

export function GalleryImagePreloaderComponent(getImage: () => VGImage) {
  const displayedSrc = ref<string>("");

  watch(
    () => getImage(),
    async (img, _old, onCleanup) => {
      if (!img) return;

      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      displayedSrc.value = "";
      await img.PreloadImageForGallery();

      if (!cancelled) {
        displayedSrc.value = img.ImageBlobURL ?? "";
      }
    },
    { immediate: true },
  );

  return { displayedSrc };
}
