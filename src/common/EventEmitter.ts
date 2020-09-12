export class EventEmitter<EventPayload extends object> {
  private handlerCount = 0;
  private handlers: Array<((payload: EventPayload) => any) | null> = [];

  public emit(payload: EventPayload) {
    for (let handler of this.handlers) {
      if (!!handler) {
        handler(payload);
      }
    }
  }

  public on(handler: (payload: EventPayload) => any): number {
    this.handlers.push(handler);
    return this.handlerCount++;
  };

  public delete(handlerId: number) {
    this.handlers[handlerId] = null;
  }
}
