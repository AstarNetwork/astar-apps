import { useI18n } from 'vue-i18n';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useStore } from 'src/store';
import { computed, ref } from 'vue';
import { displayCustomMessage, TxType } from './custom-signature/message';
import { useExtrinsicCall } from './custom-signature/useExtrinsicCall';
import { hasExtrinsicFailedEvent } from 'src/modules/extrinsic';

export function useCustomSignature({ fn, txType }: { fn?: () => void; txType?: TxType }) {
  const customMsg = ref<string | null>(null);
  const { t } = useI18n();

  const store = useStore();
  const isCustomSig = computed(() => {
    const isEthWallet = store.getters['general/isEthWallet'];
    const isH160 = store.getters['general/isH160Formatted'];
    return isEthWallet && !isH160;
  });
  const senderAddress = computed(() => store.getters['general/selectedAddress']);

  const handleTransactionError = (e: Error): void => {
    console.error(e);
    const message = e.message;
    store.dispatch('general/showAlertMsg', {
      msg: t('toast.transactionFailed', { message }),
      alertType: 'error',
    });
  };

  const handleResult = async (result: ISubmittableResult): Promise<boolean> => {
    try {
      return new Promise<boolean>(async (resolve) => {
        const status = result.status;
        if (status.isFinalized) {
          store.commit('general/setLoading', false);
          if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
            fn && fn();
            const msg = customMsg.value
              ? customMsg.value
              : t('toast.completedHash', { hash: status.asFinalized.toString() });

            store.dispatch('general/showAlertMsg', {
              msg,
              alertType: 'success',
            });

            customMsg.value = null;
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          store.commit('general/setLoading', true);
        }

        if (txType) {
          displayCustomMessage({
            txType,
            result,
            senderAddress: senderAddress.value,
            store,
            t,
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
