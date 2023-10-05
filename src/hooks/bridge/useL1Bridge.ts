import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

export function useL1Bridge() {
  const transferAmt = ref<string | null>(null);
  const toBridgeBalance = ref<number>(0);
  const fromBridgeBalance = ref<number>(0);
  const errMsg = ref<string>('');

  const store = useStore();
  const { t } = useI18n();
  const { currentAccount } = useAccount();

  const { nativeTokenSymbol, evmNetworkIdx, isSupportXvmTransfer } = useNetworkInfo();
  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

  const isDisabledBridge = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(transferAmt.value) || fromBridgeBalance.value < Number(transferAmt.value);
    return errMsg.value !== '' || isLessAmount;
  });

  const inputHandler = (event: any): void => {
    transferAmt.value = event.target.value;
    errMsg.value = '';
  };

  const resetStates = (): void => {
    transferAmt.value = '';
    fromBridgeBalance.value = 0;
    toBridgeBalance.value = 0;
    errMsg.value = '';
  };

  const setErrorMsg = (): void => {
    if (isLoading.value) return;
    const transferAmtRef = Number(transferAmt.value);
    try {
      if (transferAmtRef > fromBridgeBalance.value) {
        errMsg.value = t('warning.insufficientBalance', {
          token: 'ETH',
        });
      } else {
        errMsg.value = '';
      }
    } catch (error: any) {
      errMsg.value = error.message;
    }
  };

  const reverseChain = (): void => {};

  // const finalizedCallback = (hash: string): void => {
  //   addTxHistories({
  //     hash: String(hash),
  //     type: HistoryTxType.Transfer,
  //     address: currentAccount.value,
  //   });
  // };

  const handleBridge = async (): Promise<void> => {};

  watchEffect(setErrorMsg);

  return {
    transferAmt,
    errMsg,
    isDisabledBridge,
    inputHandler,
    resetStates,
    reverseChain,
    handleBridge,
  };
}
