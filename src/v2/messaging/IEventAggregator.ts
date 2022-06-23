export abstract class EventMessage {}

export interface IEventAggregator {
  publish(message: EventMessage): void;

  subscribe(messageName: string, callback: (mesage: EventMessage) => void): void;

  unsubscribe(messageName: string, callback: (mesage: EventMessage) => void): void;
}
