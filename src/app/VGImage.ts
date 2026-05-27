import { VGHost } from "./hosts/VGHost";
import { VGImageModel } from "./threadFetcher/VGThreadFetcher";
import { XhrRequestTracker } from "./requests/XhrRequestTracker";
import { VGImageZoomData } from "./VGImageZoomData";

export type VGImageStatus = "thumbnail" | "fetchingRaw" | "raw" | "error";

export class VGImage {
  private host: VGHost;
  private imageURL: string;
  private imageThumbnailURL: string;

  private imageBlob: Blob | null = null;
  private rawImageURL: string | null = null;
  private status: VGImageStatus = "thumbnail";
  private preloadedImageURL: string | null = null;

  private zoomDataPerOrientation: Map<OrientationType, VGImageZoomData> =
    new Map<OrientationType, VGImageZoomData>();

  /////

  public get Host(): VGHost {
    return this.host;
  }

  /////

  public FetchImageURLTracker: XhrRequestTracker | null = null;
  public FetchImageFileTrack: XhrRequestTracker | null = null;

  /////

  constructor(host: VGHost, imageModel: VGImageModel) {
    this.host = host;

    switch (imageModel.type) {
      case "directlinked":
        this.imageURL = imageModel.imageURL;
        this.imageThumbnailURL = imageModel.imageURL;
        this.rawImageURL = imageModel.imageURL;
        this.status = "raw";
        break;
      case "linked":
        this.imageURL = imageModel.imageURL;
        this.imageThumbnailURL = imageModel.thumbnailURL;
        break;
    }
  }

  /////

  public get ImageBlob(): Blob | null {
    return this.imageBlob;
  }

  public get PreloadImageURL(): string | null {
    return this.preloadedImageURL;
  }

  public get Status(): VGImageStatus {
    return this.status;
  }

  public get ImageURL(): string {
    return this.imageURL;
  }

  public get ThumbnailURL(): string {
    return this.imageThumbnailURL;
  }

  public get RawImageURL(): string | null {
    return this.rawImageURL;
  }

  /////

  public async FetchRawImageURL(): Promise<void> {
    if (this.rawImageURL !== null) return;

    this.status = "fetchingRaw";

    this.FetchImageURLTracker = new XhrRequestTracker();
    var imageFileURL = await this.host.FetchPage(
      { pageURL: this.imageURL, thumbnailURL: this.imageThumbnailURL },
      this.FetchImageURLTracker,
    );

    this.rawImageURL = imageFileURL ?? null;
    this.status = this.rawImageURL !== null ? "raw" : "error";
  }

  public async FetchImageFile(): Promise<void> {
    if (this.imageBlob !== null) return;

    this.status = "fetchingRaw";

    this.FetchImageFileTrack = new XhrRequestTracker();
    var imageFileURL = await this.host.FetchPage(
      { pageURL: this.imageURL, thumbnailURL: this.imageThumbnailURL },
      this.FetchImageFileTrack,
    );

    if (imageFileURL !== undefined && imageFileURL !== null) {
      this.imageBlob = await this.host.FetchImage(
        imageFileURL,
        this.FetchImageFileTrack,
      );
    }

    this.status = this.imageBlob !== null ? "raw" : "error";
  }

  public async PreloadImageForGallery(): Promise<void> {
    if (this.preloadedImageURL !== null) return;

    this.preloadedImageURL = await _TryPreloadWithImageElement(this);

    if (this.preloadedImageURL !== null) return;

    this.preloadedImageURL = await _TryLoadImageBlob(this);

    /////

    async function _TryPreloadWithImageElement(
      _this: VGImage,
    ): Promise<string | null> {
      await _this.FetchRawImageURL();

      if (_this.rawImageURL === null) return null;

      const imageNode = new Image();
      imageNode.src = _this.rawImageURL!;

      try {
        await imageNode.decode();

        return _this.rawImageURL;
      } catch {}

      return null;
    }

    async function _TryLoadImageBlob(_this: VGImage): Promise<string | null> {
      await _this.FetchImageFile();

      if (_this.imageBlob === null) return null;

      return URL.createObjectURL(_this.imageBlob);
    }
  }

  public GetZoomData(orientation: OrientationType): VGImageZoomData {
    return (
      this.zoomDataPerOrientation.get(orientation) ?? VGImageZoomData.Default
    );
  }

  public SetZoomData(
    orientation: OrientationType,
    zoomData: VGImageZoomData,
  ): void {
    this.zoomDataPerOrientation.set(orientation, zoomData);
  }
}
