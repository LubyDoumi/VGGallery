import { VGController } from "../VGController";
import { XhrRequestTracker } from "../requests/XhrRequestTracker";

export type VGImageData = {
  pageURL: string;
  thumbnailURL: string;
};

export abstract class VGHost {
  protected controller: VGController;

  /////

  constructor(controller: VGController) {
    this.controller = controller;
  }

  /////

  public abstract get HostName(): string;

  /////

  /**
   * Fetch the image host page and return the image file URL.
   *
   * @param pageURL
   * @returns The URL of the image file.
   */
  public abstract FetchPage(
    imageData: VGImageData,
    tracker: XhrRequestTracker,
  ): Promise<string | null | undefined>;

  /**
   * Fetch the image file.
   *
   * @param imageURL The URL of the image file.
   * @returns The image file blob.
   */
  public abstract FetchImage(
    imageURL: string,
    tracker: XhrRequestTracker,
  ): Promise<Blob | null>;
}
