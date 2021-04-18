import { Logger, LogService } from './LogService';

export class EventEmitter<EventPayload extends object> {
  private handlerCount = 0;
  private handlers: Array<((payload: EventPayload) => Promise<void> | void) | null> = [];
  private logger?: Logger;

  constructor(private loggingName?: string) {
    if (loggingName) {
      this.logger = LogService.getLogger(loggingName);
    }
  }

  public get numberOfHandlers() {
    return this.handlers.filter(h => !!h).length;
  }

  public async emit(payload: EventPayload): Promise<void> {
    const promises: Array<Promise<void>> = [];

    this.logger?.log('emit', [], { payload });

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
