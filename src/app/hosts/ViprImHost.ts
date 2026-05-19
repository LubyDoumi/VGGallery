import { XhrRequestTracker } from "../requests/XhrRequestTracker";
import { VGHost } from "./VGHost";

export class ViprImHost extends VGHost {
  public override get HostName(): string {
    return "vipr.im";
  }

  /////

  private async FetchImageBlob(
    imageHostURL: string,
    tracker: XhrRequestTracker,
  ): Promise<Blob> {
    const request = this.controller.RequestQueue.add({
      method: "GET",
      url: imageHostURL,
      responseType: "blob",
    });

    tracker.TrackRequest(request, 0.8);
    await request.wait();

    const blob = request.response!.response as Blob;

    return blob;
  }

  /////

  public override async FetchPage(
    pageURL: string,
    tracker: XhrRequestTracker,
  ): Promise<string | null | undefined> {
    const request = this.controller.RequestQueue.add({
      method: "GET",
      url: pageURL,
    });

    tracker.TrackRequest(request, 0.1);

    try {
      await request.wait();

      const html = this.controller.DomParser.parseFromString(
        request.response!.responseText,
        "text/html",
      );

      const imageNode = html.querySelector("img.pic.img-responsive");
      const imageURL = imageNode?.getAttribute("src");
      const imageBlob = await this.FetchImageBlob(imageURL!, tracker);
      const blobURL = URL.createObjectURL(imageBlob);

      return blobURL;
    } catch (e) {
      return undefined;
    }
  }

  public override async FetchImage(
    imageURL: string,
    tracker: XhrRequestTracker,
  ): Promise<Blob | null> {
    const request = this.controller.RequestQueue.add({
      method: "GET",
      url: imageURL,
      responseType: "blob",
    });

    tracker.TrackRequest(request);

    try {
      await request.wait();

      const blob = request.response!.response as Blob;

      return blob;
    } catch (e) {
      return null;
    }
  }
}
