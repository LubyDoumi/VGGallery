import { XhrRequestTracker } from "../requests/XhrRequestTracker";
import { VGHost, VGImageData } from "./VGHost";

export class ImxHost extends VGHost {
  public override get HostName(): string {
    return "imx.to";
  }

  /////

  public override async FetchPage(
    imageData: VGImageData,
    tracker: XhrRequestTracker,
  ): Promise<string | null | undefined> {
    const params = {
      imgContinue: "",
    };

    const request = this.controller.RequestQueue.add({
      method: "POST",
      url: imageData.pageURL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams(params).toString(),
    });

    tracker.TrackRequest(request, 0.1);

    try {
      await request.wait();

      const doc = this.controller.DomParser.parseFromString(
        request.response!.responseText,
        "text/html",
      );

      const imageNode = doc.querySelector('img[src^="https://image.imx.to/"]');
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
