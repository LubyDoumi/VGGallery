export class Event<T extends (...args: any[]) => any> {
  private callbacks: T[] = [];

  /////

  public Subscribe(callback: T): T {
    this.callbacks.push(callback);
    return callback;
  }

  public Unsubscribe(callback: T): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  public Trigger(...args: Parameters<T>): void {
    for (const callback of this.callbacks) callback(...args);
  }
}
