export class EventEmitter<EventPayload extends object> {
  private handlerCount = 0;
  private handlers: Array<((payload: EventPayload) => Promise<void> | void) | null> = [];

  public async emit(payload: EventPayload): Promise<void> {
    const promises: Array<Promise<void>> = [];

    for (let handler of this.handlers) {
      if (!!handler) {
        const res = handler(payload) as Promise<void>;
        if (typeof res?.then === 'function') {
          promises.push(res);
        }
      }
    }

    await Promise.all(promises);
  }

  public on(handler: (payload: EventPayload) => Promise<void> | void): number {
    this.handlers.push(handler);
    return this.handlerCount++;
  }

  public delete(handlerId: number) {
    this.handlers[handlerId] = null;
  }
}
