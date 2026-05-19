import { GM_xmlhttpRequest } from "$";
import { Event } from "../helpers/Event";

export interface XhrResponse<TResponse = unknown> {
  status: number;
  statusText: string;
  responseText: string;
  response: TResponse;
  responseHeaders: string;
  readyState: number;
  finalUrl: string;
}

export interface XhrProgressResponse<
  TResponse = unknown,
> extends XhrResponse<TResponse> {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}

export interface XhrErrorResponse {
  error: string;
  finalUrl: string;
  responseText: string;
  status: number;
  statusText: string;
}

export interface XhrAbortHandle {
  abort(): void;
}

export interface XhrOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
  headers?: Record<string, string>;
  data?: string | FormData | Blob;
  binary?: boolean;
  nocache?: boolean;
  revalidate?: boolean;
  timeout?: number;
  context?: unknown;
  responseType?: "arraybuffer" | "blob" | "json" | "stream";
  overrideMimeType?: string;
  anonymous?: boolean;
  fetch?: boolean;
  user?: string;
  password?: string;
}

type XhrRequestStatus = "pending" | "active" | "done" | "failed" | "aborted";

export class XhrError<TResponse = unknown> extends Error {
  public readonly httpStatus: number;
  public readonly gmError: XhrErrorResponse | null;
  public readonly requestStatus: XhrRequestStatus;
  public readonly request: XhrRequest<TResponse>;

  constructor(req: XhrRequest<TResponse>) {
    const reason =
      req.status === "aborted"
        ? "aborted"
        : req.error
          ? `GM error: ${req.error.error}`
          : `HTTP ${req.httpStatus}`;

    super(
      `VGXhrQueue request failed (${reason}) after ${req.attempts} attempt(s): ${req.options.url}`,
    );
    this.name = "VGXhrError";
    this.httpStatus = req.httpStatus;
    this.gmError = req.error;
    this.requestStatus = req.status;
    this.request = req;
  }
}

export class XhrRequest<TResponse = unknown> {
  public status: XhrRequestStatus = "pending";
  public progress: XhrProgressResponse<TResponse> | null = null;
  public response: XhrResponse<TResponse> | null = null;
  public error: XhrErrorResponse | null = null;
  public httpStatus = 0;
  public attempts = 0;

  public readonly onProgress = new Event<
    (p: XhrProgressResponse<TResponse>) => void
  >();
  public readonly onDone = new Event<(r: XhrResponse<TResponse>) => void>();
  public readonly onError = new Event<
    (e: XhrErrorResponse | null, req: XhrRequest<TResponse>) => void
  >();
  public readonly onRetry = new Event<(attempt: number) => void>();
  public readonly onAbort = new Event<() => void>();

  private _abortHandle: XhrAbortHandle | null = null;

  private _settlers: Array<{
    resolve: (r: XhrResponse<TResponse>) => void;
    reject: (reason: XhrError<TResponse>) => void;
  }> = [];

  constructor(
    public options: XhrOptions,
    private readonly _queue: XhrQueue,
  ) {}

  public wait(): Promise<XhrResponse<TResponse>> {
    if (this.status === "done" && this.response) {
      return Promise.resolve(this.response);
    }
    if (this.status === "failed" || this.status === "aborted") {
      return Promise.reject(new XhrError(this));
    }
    return new Promise<XhrResponse<TResponse>>((resolve, reject) => {
      this._settlers.push({ resolve, reject });
    });
  }

  public getProgress(): number {
    if (this.progress?.lengthComputable && this.progress.total > 0) {
      return this.progress.loaded / this.progress.total;
    }
    return this.status === "done" ? 1 : 0;
  }

  public retry(): this {
    this._reset();
    this._queue._enqueue(this);
    return this;
  }

  public abort(): this {
    if (this.status === "active" && this._abortHandle) {
      this._abortHandle.abort();
    }
    this._queue._remove(this);
    this.status = "aborted";
    this.onAbort.Trigger();
    this._rejectSettlers();
    return this;
  }

  public _markActive(handle: XhrAbortHandle): void {
    this.status = "active";
    this._abortHandle = handle;
    this.attempts++;
  }

  public _markDone(resp: XhrResponse<TResponse>): void {
    this.status = "done";
    this.httpStatus = resp.status;
    this.response = resp;
    this._abortHandle = null;
    this.onDone.Trigger(resp);
    this._resolveSettlers(resp);
  }

  public _markFailed(err: XhrErrorResponse | null): void {
    this.status = "failed";
    this.error = err;
    this._abortHandle = null;
    this.onError.Trigger(err, this);
    this._rejectSettlers();
  }

  public _updateProgress(p: XhrProgressResponse<TResponse>): void {
    this.progress = p;
    this.onProgress.Trigger(p);
  }

  public _reset(): void {
    this.status = "pending";
    this.progress = null;
    this.response = null;
    this.error = null;
    this.httpStatus = 0;
    this._abortHandle = null;
  }

  private _resolveSettlers(resp: XhrResponse<TResponse>): void {
    const settlers = this._settlers.splice(0);
    for (const { resolve } of settlers) resolve(resp);
  }

  private _rejectSettlers(): void {
    const settlers = this._settlers.splice(0);
    for (const { reject } of settlers) reject(new XhrError(this));
  }
}

export interface XhrQueueOptions {
  concurrency?: number;
  maxRetries?: number;
  retryBaseDelay?: number;
  maxRetryDelay?: number;
  logging?: boolean;
}

const LOG_LABELS: Record<
  "added" | "started" | "succeeded" | "failed" | "retrying",
  string
> = {
  added: "📥 Added",
  started: "🚀 Started",
  succeeded: "✅ Succeeded",
  failed: "❌ Failed",
  retrying: "🔄 Retrying",
};

export class XhrQueue {
  private readonly _concurrency: number;
  private readonly _maxRetries: number;
  private readonly _retryBaseDelay: number;
  private readonly _maxRetryDelay: number;
  private readonly _logging: boolean;

  private _pending: XhrRequest<any>[] = [];
  private _active = 0;
  private _dispatching = false;

  constructor(opts: XhrQueueOptions = {}) {
    this._concurrency = opts.concurrency ?? 5;
    this._maxRetries = opts.maxRetries ?? 3;
    this._retryBaseDelay = opts.retryBaseDelay ?? 1_000;
    this._maxRetryDelay = opts.maxRetryDelay ?? Infinity;
    this._logging = opts.logging ?? false;
  }

  public add<TResponse = unknown>(options: XhrOptions): XhrRequest<TResponse> {
    if (options.url.startsWith("http:")) {
      options = { ...options, url: "https:" + options.url.slice(5) };
    }
    const req = new XhrRequest<TResponse>(options, this);
    this._enqueue(req);
    return req;
  }

  public get pendingCount(): number {
    return this._pending.length;
  }

  public get activeCount(): number {
    return this._active;
  }

  public get totalCount(): number {
    return this._pending.length + this._active;
  }

  public _enqueue(req: XhrRequest<any>): void {
    req.status = "pending";
    this._pending.push(req);
    this._log("added", req);
    this._dispatch();
  }

  public _remove(req: XhrRequest<any>): void {
    const idx = this._pending.indexOf(req);
    if (idx !== -1) this._pending.splice(idx, 1);
  }

  private _log(
    event: keyof typeof LOG_LABELS,
    req: XhrRequest<any>,
    extra?: string,
  ): void {
    if (!this._logging) return;

    const parts = [
      `[VGXhrQueue] ${LOG_LABELS[event]}`,
      req.options.url,
      `| total: ${this.totalCount}`,
      `(active: ${this._active}, pending: ${this._pending.length})`,
    ];
    if (extra) parts.push(`| ${extra}`);

    console.log(parts.join(" "));
  }

  private _dispatch(): void {
    if (this._dispatching) return;
    this._dispatching = true;

    try {
      while (this._active < this._concurrency && this._pending.length > 0) {
        const req = this._pending.shift()!;
        this._execute(req);
      }
    } finally {
      this._dispatching = false;
    }
  }

  private _execute(req: XhrRequest<any>): void {
    this._log("started", req, `attempt ${req.attempts + 1}`);

    if (req.options.url.startsWith("blob:")) {
      this._executeFetch(req);
    } else {
      this._executeGm(req);
    }
  }

  private _executeGm(req: XhrRequest<any>): void {
    const handle: XhrAbortHandle = GM_xmlhttpRequest({
      ...req.options,

      onprogress: (p) => {
        req._updateProgress(p as unknown as XhrProgressResponse<unknown>);
      },

      onload: (resp) => {
        this._active--;
        this._handleHttpStatus(
          req,
          resp.status,
          resp as unknown as XhrResponse<unknown>,
        );
      },

      onerror: (err) => {
        this._active--;
        this._scheduleRetry(
          req,
          err as unknown as XhrErrorResponse,
          "network error",
        );
      },

      ontimeout: () => {
        this._active--;
        this._scheduleRetry(req, null, "timeout");
      },

      onabort: () => {
        this._active--;
        this._dispatch();
      },
    });

    req._markActive(handle);
    this._active++;
  }

  private _executeFetch(req: XhrRequest<any>): void {
    const controller = new AbortController();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (req.options.timeout) {
      timeoutId = setTimeout(() => {
        controller.abort();
        this._active--;
        this._scheduleRetry(req, null, "timeout");
      }, req.options.timeout);
    }

    const clearTimer = (): void => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    req._markActive({ abort: () => controller.abort() });
    this._active++;

    fetch(req.options.url, {
      method: req.options.method ?? "GET",
      headers: req.options.headers,
      body: req.options.data as BodyInit | undefined,
      signal: controller.signal,
    })
      .then(async (resp) => {
        clearTimer();

        const { bodyBuffer, chunks } = await this._fetchStreamBody(
          resp,
          resp.status,
          req,
        );
        const gmResp = this._buildVGXhrResponse(resp, bodyBuffer, chunks, req);

        this._active--;
        this._handleHttpStatus(req, resp.status, gmResp);
      })
      .catch((err: unknown) => {
        clearTimer();

        if (err instanceof DOMException && err.name === "AbortError") {
          if (req.status !== "aborted") {
            this._active--;
            this._dispatch();
          }
          return;
        }

        this._active--;
        this._scheduleRetry(
          req,
          null,
          `fetch error: ${(err as Error).message}`,
        );
      });
  }

  private async _fetchStreamBody(
    resp: Response,
    status: number,
    req: XhrRequest<any>,
  ): Promise<{ bodyBuffer: Uint8Array; chunks: Uint8Array[] }> {
    const contentLength = resp.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    const lengthComputable = total > 0;
    let loaded = 0;
    const chunks: Uint8Array[] = [];

    if (resp.body) {
      const reader = resp.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        req._updateProgress({
          status,
          statusText: resp.statusText,
          responseHeaders: "",
          readyState: 3,
          finalUrl: req.options.url,
          lengthComputable,
          loaded,
          total,
          responseText: "",
          response: undefined as unknown,
        } as XhrProgressResponse<unknown>);
      }
    }

    const bodyBuffer = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      bodyBuffer.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return { bodyBuffer, chunks };
  }

  private _buildVGXhrResponse(
    resp: Response,
    bodyBuffer: Uint8Array,
    chunks: Uint8Array[],
    req: XhrRequest<any>,
  ): XhrResponse<unknown> {
    let responseText = "";
    let response: unknown;

    switch (req.options.responseType) {
      case "blob":
        response = new Blob(chunks as BlobPart[], {
          type: resp.headers.get("content-type") ?? "",
        });
        break;
      case "arraybuffer":
        response = bodyBuffer.buffer;
        break;
      case "json":
        responseText = new TextDecoder().decode(bodyBuffer);
        response = JSON.parse(responseText);
        break;
      default:
        responseText = new TextDecoder().decode(bodyBuffer);
        response = responseText;
        break;
    }

    return {
      status: resp.status,
      statusText: resp.statusText,
      responseText,
      response,
      responseHeaders: [...resp.headers.entries()]
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n"),
      readyState: 4,
      finalUrl: req.options.url,
    };
  }

  private _handleHttpStatus(
    req: XhrRequest<any>,
    status: number,
    resp: XhrResponse<unknown>,
  ): void {
    if (status >= 200 && status < 400) {
      req._markDone(resp);
      this._log("succeeded", req, `HTTP ${status}`);
      this._dispatch();
    } else if (status >= 400 && status < 500) {
      req.httpStatus = status;
      req._markFailed(null);
      this._log("failed", req, `HTTP ${status} (client error, not retrying)`);
      this._dispatch();
    } else if (status >= 500) {
      req.httpStatus = status;
      this._scheduleRetry(req, null, `HTTP ${status}`);
    }
  }

  private _scheduleRetry(
    req: XhrRequest<any>,
    err: XhrErrorResponse | null = null,
    reason = "",
  ): void {
    if (req.attempts >= this._maxRetries) {
      req._markFailed(err);
      this._log(
        "failed",
        req,
        `${reason} — retries exhausted (${this._maxRetries})`,
      );
      this._dispatch();
      return;
    }

    const delay = Math.min(
      this._retryBaseDelay * Math.pow(2, req.attempts - 1),
      this._maxRetryDelay,
    );
    this._log(
      "retrying",
      req,
      `${reason} — attempt ${req.attempts + 1} in ${delay}ms`,
    );
    req.onRetry.Trigger(req.attempts);

    setTimeout(() => {
      if (req.status === "aborted") {
        this._dispatch();
        return;
      }
      req._reset();
      this._pending.unshift(req);
      this._dispatch();
    }, delay);
  }
}
