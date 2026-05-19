import { ref, onUnmounted } from "vue";

export class Utils {
  public static Mod(value: number, modulus: number): number {
    return ((value % modulus) + modulus) % modulus;
  }

  public static GetExtensionForMimeType(mimeType: string): string {
    return (
      {
        "image/bmp": "bmp",
        "image/gif": "gif",
        "image/jpeg": "jpeg",
        "image/png": "png",
        "image/svg+xml": "svg",
        "image/tiff": "tif",
        "image/webp": "webp",
      }[mimeType] || "jpg"
    );
  }

  public static BrowserDownloadBlob(blob: Blob, filename: string): void {
    const zipURL = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = zipURL;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(zipURL);
  }

  public static async PreloadImage(src: string): Promise<void> {
    // TODO need to handle server error, maybe use the VGImage blob

    const img = new Image();
    img.src = src;
    try {
      await img.decode();
    } catch (e) {
      /* fall through */
    }
  }

  public static Poll<T>(getter: () => T, intervalMs: number = 1000) {
    const value = ref<T>(getter());

    const timer = setInterval(() => {
      value.value = getter();
    }, intervalMs);

    onUnmounted(() => clearInterval(timer));

    return value;
  }
}
