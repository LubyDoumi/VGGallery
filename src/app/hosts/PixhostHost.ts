import { XhrRequestTracker } from "../requests/XhrRequestTracker";
import { VGHost, VGImageData } from "./VGHost";

export class PixhostHost extends VGHost {
  public override get HostName(): string {
    return "pixhost.to";
  }

  /////

  public override async FetchPage(
    imageData: VGImageData,
    tracker: XhrRequestTracker,
  ): Promise<string | null | undefined> {
    const request = this.controller.RequestQueue.add({
      method: "GET",
      url: imageData.pageURL,
    });

    tracker.TrackRequest(request, 0.1);

    try {
      await request.wait();

      const html = this.controller.DomParser.parseFromString(
        request.response!.responseText,
        "text/html",
      );
      const imageNode = html.querySelector("div.image > img.image-img");
      const imageURL = imageNode?.getAttribute("src");

      return imageURL;
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
