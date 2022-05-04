import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useStore } from 'src/store';
import { computed, ref } from 'vue';
import { displayCustomMessage, TxType } from './custom-signature/message';
import { useExtrinsicCall } from './custom-signature/useExtrinsicCall';

export function useCustomSignature({ fn, txType }: { fn?: () => void; txType?: TxType }) {
  const customMsg = ref<string | null>(null);

  const store = useStore();
  const isCustomSig = computed(() => {
    const isEthWallet = store.getters['general/isEthWallet'];
    const isH160 = store.getters['general/isH160Formatted'];
    return isEthWallet && !isH160;
  });
  const senderAddress = computed(() => store.getters['general/selectedAddress']);

  const handleTransactionError = (e: Error): void => {
    console.error(e);
    store.dispatch('general/showAlertMsg', {
      msg: `Transaction failed with error: ${e.message}`,
      alertType: 'error',
    });
  };

  const handleResult = async (result: ISubmittableResult): Promise<boolean> => {
    try {
      return new Promise<boolean>(async (resolve) => {
        const status = result.status;
        if (status.isInBlock) {
          const msg = customMsg.value ?? `Completed at block hash #${status.asInBlock.toString()}`;

          store.dispatch('general/showAlertMsg', {
            msg,
            alertType: 'success',
          });

          store.commit('general/setLoading', false);
          fn && fn();
          customMsg.value = null;
          resolve(true);
        } else {
          if (status.type !== 'Finalized') {
            store.commit('general/setLoading', true);
          } else {
            resolve(false);
          }
        }

        if (txType) {
          displayCustomMessage({
            txType,
            result,
            senderAddress: senderAddress.value,
            dispatch: store.dispatch,
          });
        }
      });
    } catch (error: any) {
      handleTransactionError(error);
      store.commit('general/setLoading', false);
      return false;
    }
  };

  const { callFunc } = useExtrinsicCall({
    onResult: handleResult,
    onTransactionError: handleTransactionError,
  });

  const handleCustomExtrinsic = async (method: SubmittableExtrinsic<'promise'>) => {
    await callFunc(method);
  };

  const dispatchError = (msg: string) => {
    console.error(msg);
    store.dispatch('general/showAlertMsg', {
      msg,
      alertType: 'error',
    });
  };

  return {
    callFunc,
    dispatchError,
    isCustomSig,
    handleResult,
    handleTransactionError,
    customMsg,
    handleCustomExtrinsic,
  };
}
