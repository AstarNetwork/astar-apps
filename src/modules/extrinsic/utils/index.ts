import { DispatchError, EventRecord } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import { Dispatch } from 'vuex';

export const showError = (dispatch: Dispatch, message: string): void => {
  dispatch(
    'general/showAlertMsg',
    {
      msg: message,
      alertType: 'error',
    },
    { root: true }
  );
};

export const hasExtrinsicFailedEvent = (
  events: EventRecord[],
  dispatch: Dispatch,
  setMessage?: Function
): boolean => {
  let result = false;
  events
    .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
    .map(({ event: { data, method, section } }) => {
      // console.log('event', method, section, data);
      // if (section === 'utility' && method === 'BatchInterrupted') {
      //   console.log(data.toHuman());
      // }

      if (section === 'system' && method === 'ExtrinsicFailed') {
        const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
        let message = dispatchError.type;

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

        if (setMessage) {
          setMessage(message);
        }

        showError(dispatch, `action: ${section}.${method} ${message}`);
        result = true;
      } else if (section === 'utility' && method === 'BatchInterrupted') {
        // TODO there should be a better way to extract error,
        // for some reason cast data as unknown as ITuple<[DispatchError]>; doesn't work
        const anyData = data as any;
        const error = anyData[1].registry.findMetaError(anyData[1].asModule);
        let message = `${error.section}.${error.name}`;
        showError(dispatch, `action: ${section}.${method} ${message}`);
        result = true;
      }
    });

  return result;
};
