import { XhrErrorResponse, XhrRequest } from "./XhrQueue";

export class XhrRequestTracker {
  private requests: { req: XhrRequest; ratio: number }[] = [];

  /////

  public Error: XhrErrorResponse | null = null;

  /////

  constructor() {
    this.OnRequestError = this.OnRequestError.bind(this);
  }

  public get Progress(): number {
    if (this.requests.length === 0) return 1;

    const totalRatio = this.requests.reduce((sum, { ratio }) => sum + ratio, 0);
    let totalProgress = 0;

    for (const { req, ratio } of this.requests) {
      totalProgress += (req.getProgress() * ratio) / totalRatio;
    }

    return Math.min(totalProgress, 1);
  }

  /////

  private OnRequestError(e: XhrErrorResponse | null, req: XhrRequest) {
    req.onError.Unsubscribe(this.OnRequestError);
    this.Error = e;
  }

  /////

  public TrackRequest(request: XhrRequest, ratio: number = 1): void {
    if (this.Error !== null) return;

    request.onError.Subscribe(this.OnRequestError);
    this.requests.push({ req: request, ratio });
  }
}
