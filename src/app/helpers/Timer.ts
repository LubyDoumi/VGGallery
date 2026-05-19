import { Event } from "./Event";

export class Timer {
  private duration: number;
  private remaining: number;
  private startedAt: number | null = null;
  private handle: ReturnType<typeof setTimeout> | null = null;

  /////

  public OnFinished = new Event<() => void>();

  constructor(duration: number) {
    this.duration = duration;
    this.remaining = duration;
  }

  /////

  public get IsRunning(): boolean {
    return this.handle !== null;
  }

  public get Progress(): number {
    if (this.startedAt === null) return 1 - this.remaining / this.duration;
    return 1 - (this.remaining - (Date.now() - this.startedAt)) / this.duration;
  }

  /////

  public SetDuration(duration: number): void {
    this.duration = duration;

    if (this.handle !== null) {
      const elapsed = Date.now() - this.startedAt!;
      clearTimeout(this.handle);
      this.remaining = Math.max(0, duration - elapsed);
      this.startedAt = Date.now();
      this.handle = setTimeout(() => this.Finish(), this.remaining);
    } else {
      this.remaining = duration;
    }
  }

  public Start(): void {
    if (this.handle !== null) return;
    this.startedAt = Date.now();
    this.handle = setTimeout(() => this.Finish(), this.remaining);
  }

  public Pause(): void {
    if (this.handle === null) return;
    clearTimeout(this.handle);
    this.handle = null;
    this.remaining -= Date.now() - this.startedAt!;
    this.startedAt = null;
  }

  public Toggle(restart: boolean = false): void {
    if (this.handle !== null) this.Pause();
    else {
      if (restart) this.Restart();
      else this.Start();
    }
  }

  public Restart(): void {
    if (this.handle !== null) clearTimeout(this.handle);
    this.handle = null;
    this.startedAt = null;
    this.remaining = this.duration;
    this.Start();
  }

  /////

  private Finish(): void {
    this.handle = null;
    this.startedAt = null;
    this.remaining = this.duration;
    this.OnFinished.Trigger();
  }
}
