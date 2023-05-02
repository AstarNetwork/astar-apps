import { Null, Result } from '@polkadot/types-codec';
import { DispatchError, EventRecord } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';

enum ErrorCode {
  TooManyEraStakeValues = 'dappsStaking.TooManyEraStakeValues',
}

export class WalletService {
  constructor(protected readonly eventAggregator: IEventAggregator) {}

  protected isExtrinsicFailed(events: EventRecord[]): boolean {
    let result = false;
    let message = '';
    events
      .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
      .map(({ event: { data, method, section } }) => {
        if (section === 'system' && method === 'ExtrinsicFailed') {
          const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
          message = dispatchError.type.toString();
          message = this.getErrorMessage(dispatchError);
          result = true;
        } else if (section === 'ethCall' && method === 'Executed') {
          const [, dispatchError] = data as unknown as ITuple<[Result<Null, DispatchError>]>;

          if (dispatchError && dispatchError.isErr) {
            message = this.getErrorMessage(dispatchError.asErr);
            result = true;
          }
        } else if (section === 'utility' && method === 'BatchInterrupted') {
          const anyData = data as any;
          const error = anyData[1].registry.findMetaError(anyData[1].asModule);
          let message = `${error.section}.${error.name}`;
          message = `action: ${section}.${method} ${message}`;
          result = true;
        }
      });

    if (result) {
      let msg = '';
      if (message === ErrorCode.TooManyEraStakeValues) {
        msg = 'Please claim your rewards before sending transaction';
      } else {
        msg = message;
      }
      this.eventAggregator.publish(new ExtrinsicStatusMessage({ success: false, message: msg }));
      throw Error(msg);
    }
    return result;
  }

  private getErrorMessage(dispatchError: DispatchError): string {
    let message = '';
    if (dispatchError.isModule) {
      try {
        const mod = dispatchError.asModule;
        const error = dispatchError.registry.findMetaError(mod);

        message = `${error.section}.${error.name}`;
      } catch (error) {
        // swallow
        console.error(error);
      }
    } else if (dispatchError.isToken) {
      message = `${dispatchError.type}.${dispatchError.asToken.type}`;
    }

    return message;
  }
}
