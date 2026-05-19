import JSZip from "jszip";
import { VGPost } from "./VGPost";
import { Utils } from "./helpers/Utils";

export type VGPostDownloadStatus = "ready" | "pending" | "zip";

export class VGPostDownloader {
  private post: VGPost;
  private zipBlob: Blob | null = null;
  private status: VGPostDownloadStatus = "ready";

  /////

  constructor(post: VGPost) {
    this.post = post;
  }

  /////

  public get Status(): VGPostDownloadStatus {
    return this.status;
  }

  public get Progress(): number {
    let progress = 0;

    for (const image of this.post.Images) {
      progress += image.FetchImageFileTrack?.Progress ?? 0;
    }

    progress /= this.post.Images.length;

    return progress;
  }

  /////

  private async DownloadToZip(): Promise<void> {
    await Promise.all(this.post.Images.map((im) => im.FetchImageFile()));

    const zip = new JSZip();
    let i = 0;

    for (const image of this.post.Images) {
      if (image.ImageBlob === null) continue;

      var imageExtension = Utils.GetExtensionForMimeType(image.ImageBlob.type);
      var imageName = "Image" + (i + 1) + "." + imageExtension;

      zip.file(imageName, image.ImageBlob);

      ++i;
    }

    this.status = "zip";

    if (i > 0) this.zipBlob = await zip.generateAsync({ type: "blob" });
  }

  /////

  public async Download(): Promise<void> {
    if (this.status === "pending") return;

    this.status = "pending";

    if (this.zipBlob === null) await this.DownloadToZip();

    if (this.zipBlob !== null)
      Utils.BrowserDownloadBlob(this.zipBlob!, this.post.PostName);

    this.status = "ready";
  }
}
