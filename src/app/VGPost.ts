import { VGController } from "./VGController";
import { VGImage } from "./VGImage";
import { VGPostDownloader } from "./VGPostDownloader";
import { Timer } from "./helpers/Timer";
import { Utils } from "./helpers/Utils";
import { VGPostModel } from "./threadFetcher/VGThreadFetcher";

export type VGSlideshowMode = "forward" | "backward";

export class VGPost {
  private controller: VGController;
  private postID: number;
  private postName: string;
  private images: VGImage[] = [];

  private slideshowStarted: boolean = false;
  private slideshowCallback: (() => void) | null = null;
  private slideshowMode: VGSlideshowMode = "forward";
  private slideshowSpeeds = [1000, 3000, 10000];
  private slideshowCurrentSpeed = 1;
  private slideshowTimer: Timer = new Timer(this.slideshowSpeeds[1]);

  /////

  public readonly Downloader: VGPostDownloader;

  public CurrentImage: VGImage | null = null;
  public CurrentImageIndex: number = 0;

  /////

  constructor(controller: VGController, postModel: VGPostModel) {
    this.controller = controller;
    this.postID = postModel.postID;
    this.postName = postModel.title;
    this.Downloader = new VGPostDownloader(this);

    this.FetchImages(postModel);
  }

  /////

  public get PostID(): number {
    return this.postID;
  }

  public get PostName(): string {
    return this.postName;
  }

  public get Images(): VGImage[] {
    return this.images;
  }

  public get SlideshowIsRunning(): boolean {
    return this.slideshowTimer.IsRunning;
  }

  public get SlideshowProgress(): number {
    return this.slideshowTimer.Progress;
  }

  public get SlideshowMode(): VGSlideshowMode {
    return this.slideshowMode;
  }

  /////

  private OnTimerFinish(): void {
    if (this.slideshowMode === "forward") this.NextImage();
    else if (this.slideshowMode === "backward") this.PreviousImage();

    this.slideshowTimer.Restart();
  }

  /////

  private FetchImages(postModel: VGPostModel): void {
    for (const imageModel of postModel.images) {
      const host = this.controller.GetHostForImage(imageModel.imageURL);

      if (host !== undefined) {
        const image = new VGImage(host, imageModel);

        this.images.push(image);
      }
    }
  }

  /////

  public SelectImage(index: number, stopSlideshow: boolean = false): void {
    if (Number.isNaN(index)) index = 0;

    if (index >= 0 && index < this.Images.length) {
      this.CurrentImageIndex = index;
      this.CurrentImage = this.Images[index];

      var nextImageIndex = (index + 1) % this.images.length;
      var previousImageIndex = Utils.Mod(index - 1, this.images.length);
      var nextImage = this.images[nextImageIndex];
      var previousImage = this.images[previousImageIndex];

      nextImage.PreloadImageForGallery();
      previousImage.PreloadImageForGallery();

      if (stopSlideshow) {
        this.slideshowTimer.Restart();
        this.PauseSlideshow();
      }
    }
  }

  public PreviousImage(stopSlideshow: boolean = false): void {
    var newIndex = this.CurrentImageIndex;

    --newIndex;

    if (newIndex < 0) {
      newIndex = this.Images.length - 1;
    }

    this.SelectImage(newIndex, stopSlideshow);
  }

  public NextImage(stopSlideshow: boolean = false): void {
    var newIndex = this.CurrentImageIndex;

    newIndex = (newIndex + 1) % this.Images.length;

    this.SelectImage(newIndex, stopSlideshow);
  }

  public StartSlideshow(mode: VGSlideshowMode): void {
    if (this.slideshowStarted) return;

    this.slideshowCallback = this.slideshowTimer.OnFinished.Subscribe(() =>
      this.OnTimerFinish(),
    );
    this.slideshowTimer.Restart();

    this.slideshowMode = mode;
    this.slideshowStarted = true;
  }

  public StopSlideshow(): void {
    if (!this.slideshowStarted) return;

    this.slideshowTimer.OnFinished.Unsubscribe(this.slideshowCallback!);
    this.slideshowTimer.Pause();

    this.slideshowStarted = false;
  }

  public PauseSlideshow(): void {
    this.slideshowTimer.Pause();
  }

  public ToggleSlideshow(mode: VGSlideshowMode): void {
    if (mode !== this.slideshowMode) {
      this.slideshowMode = mode;
      this.slideshowTimer.Restart();
    } else if (!this.slideshowStarted) {
      this.StartSlideshow(mode);
    } else {
      this.slideshowMode = mode;
      this.slideshowTimer.Toggle(true);
    }
  }

  public NextSlideshowSpeed(): void {
    this.slideshowCurrentSpeed =
      (this.slideshowCurrentSpeed + 1) % this.slideshowSpeeds.length;

    this.slideshowTimer.Restart();
    this.slideshowTimer.SetDuration(
      this.slideshowSpeeds[this.slideshowCurrentSpeed],
    );
  }
}
