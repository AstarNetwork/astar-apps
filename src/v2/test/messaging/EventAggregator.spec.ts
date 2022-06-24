import 'reflect-metadata';
import { EventAggregator, EventMessage } from 'src/v2/messaging';

class TestMessage extends EventMessage {
  public message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }
}

describe('EventAggregator.ts', () => {
  it('publish invokes a registered callback', () => {
    const sut = new EventAggregator();
    const message = new TestMessage('Hello');
    let callbackInvoked = false;
    let messageReceived: TestMessage | undefined;

    sut.subscribe(TestMessage.name, (message) => {
      callbackInvoked = true;
      messageReceived = message as TestMessage;
    });

    sut.publish(message);

    expect(callbackInvoked).toBeTruthy();
    expect(messageReceived?.message).toEqual('Hello');
  });

  it('publish invokes all registered callbacks', () => {
    const sut = new EventAggregator();
    const message = new TestMessage('Hello');
    let callbackInvocationCount = 0;

    sut.subscribe(TestMessage.name, () => {
      callbackInvocationCount++;
    });

    sut.subscribe(TestMessage.name, () => {
      callbackInvocationCount++;
    });

    sut.publish(message);

    expect(callbackInvocationCount).toEqual(2);
  });

  it('unsubscribe removes subscription', () => {
    const sut = new EventAggregator();
    const message = new TestMessage('Hello');
    let callbackInvoked = false;

    const callback = () => {
      callbackInvoked = true;
    };

    sut.subscribe(TestMessage.name, callback);

    sut.unsubscribe(TestMessage.name, callback);

    sut.publish(message);

    expect(callbackInvoked).toBeFalsy();
  });
});
