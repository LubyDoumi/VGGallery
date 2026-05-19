import { VGThread } from "./VGThread";
import { XhrQueue } from "./requests/XhrQueue";
import { VGHost } from "./hosts/VGHost";
import { ApiThreadFetcher } from "./threadFetcher/ApiThreadFetcher";

export class VGController {
  private hosts: Map<string, VGHost> = new Map<string, VGHost>();
  private wakeLock: WakeLockSentinel | null = null;
  private cachedThreads = new Map<string, VGThread>();

  /////

  public readonly DomParser: DOMParser = new DOMParser();
  public ShowThumbnails: Boolean = true;

  public RequestQueue: XhrQueue = new XhrQueue({
    logging: false,
    maxRetries: 10,
    maxRetryDelay: 10_000,
  });

  /////

  public get FullscreenAllowed(): Boolean {
    return document.fullscreenEnabled;
  }

  public get IsFullscreen(): Boolean {
    return document.fullscreenElement !== null;
  }

  /////

  private onVisibilityChange = (): void => {
    if (document.visibilityState === "visible") this.AcquireWakeLock();
  };

  private disablePinchZoomOnScroll = (event: WheelEvent) => {
    if (event.ctrlKey) event.preventDefault();
  };

  private disablePinchZoomOnTouch = (event: TouchEvent) => {
    if (event.touches.length > 1) event.preventDefault();
  };

  /////

  /**
   * Register a host for the given URL.
   *
   * @param baseURL The base URL of the host.
   * @param host An instance of a VGHost.
   */
  public RegisterHost(host: VGHost): void {
    this.hosts.set(host.HostName, host);
  }

  public EnterFullscreen(): void {
    if (this.FullscreenAllowed && !this.IsFullscreen)
      document.body.requestFullscreen();

    document.body.classList.add("vg-no-scroll");
  }

  public ExitFullscreen(): void {
    if (this.FullscreenAllowed && this.IsFullscreen) document.exitFullscreen();

    document.body.classList.remove("vg-no-scroll");
  }

  public ToggleFullscreen(): void {
    if (document.fullscreenElement) this.ExitFullscreen();
    else this.EnterFullscreen();
  }

  public ToggleThumbnail(): void {
    this.ShowThumbnails = !this.ShowThumbnails;
  }

  public async AcquireWakeLock(): Promise<void> {
    if (!("wakeLock" in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request("screen");
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    } catch (err) {
      // silent failt
    }
  }

  public ReleaseWakeLock(): void {
    this.wakeLock?.release();
    this.wakeLock = null;
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }

  public DisablePinchZoom(): void {
    window.addEventListener("wheel", this.disablePinchZoomOnScroll, {
      passive: false,
    });

    window.addEventListener("touchstart", this.disablePinchZoomOnTouch, {
      passive: false,
    });
  }

  public EnablePinchZoom() {
    window.removeEventListener("wheel", this.disablePinchZoomOnScroll);
    window.removeEventListener("touchstart", this.disablePinchZoomOnTouch);
  }

  /**
   * Get the host handler for the given image URL.
   *
   * @param imageURL
   * @returns
   */
  public GetHostForImage(imageURL: string): VGHost | undefined {
    var url = new URL(imageURL);

    return this.hosts.get(url.hostname);
  }

  public GetCachedThread(link: string): VGThread | undefined {
    return this.cachedThreads.get(link);
  }

  public CreateCacheThread(link: string): VGThread {
    const instance = new VGThread(this, new ApiThreadFetcher(this, link));

    this.cachedThreads.set(link, instance);

    return instance;
  }
}
