import { injectable } from 'inversify-props';
import { EventMessage, IEventAggregator } from 'src/v2/messaging';

export type CallbackFunction = (message: EventMessage) => void;

@injectable()
export class EventAggregator implements IEventAggregator {
  private events = new Map<string, CallbackFunction[]>();

  public publish(message: EventMessage): void {
    const events = this.events.get(message.constructor.name);

    if (events) {
      events.forEach((e) => e(message));
    }
  }

  public subscribe(messageName: string, callback: CallbackFunction): void {
    if (!this.events.has(messageName)) {
      this.events.set(messageName, []);
    }

    const event = this.events.get(messageName);
    event && event.push(callback);
  }

  public unsubscribe(messageName: string, callback: CallbackFunction): void {
    const events = this.events.get(messageName);

    if (events) {
      for (let i = 0; i < events.length; i++) {
        if (events[i] === callback) {
          events.splice(i, 1);
          break;
        }
      }
    }
  }
}
