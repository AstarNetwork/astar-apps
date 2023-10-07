import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

export enum BridgeNetworkName {
  'Sepolia' = 'Sepolia Testnet',
  'Akiba' = 'Akiba zkEVM Testnet',
}

export function useL1Bridge() {
  const l1Network = computed<string>(() => BridgeNetworkName.Sepolia);
  const l2Network = computed<string>(() => BridgeNetworkName.Akiba);

  const transferAmt = ref<string | null>(null);
  const toBridgeBalance = ref<number>(0);
  const fromBridgeBalance = ref<number>(0);
  const errMsg = ref<string>('');
  const fromChainName = ref<string>(l1Network.value);
  const toChainName = ref<string>(l2Network.value);

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

  const reverseChain = (fromChain: string, toChain: string): void => {
    fromChainName.value = toChain;
    toChainName.value = fromChain;
  };

  const handleBridge = async (): Promise<void> => {};

  watchEffect(setErrorMsg);

  watchEffect(() => {
    console.log('transferAmt', transferAmt.value);
    console.log('errMsg', errMsg.value);
    console.log('isDisabledBridge', isDisabledBridge.value);
    console.log('toBridgeBalance', toBridgeBalance.value);
    console.log('fromBridgeBalance', fromBridgeBalance.value);
    console.log('nativeTokenSymbol', fromBridgeBalance.value);
  });

  return {
    transferAmt,
    errMsg,
    isDisabledBridge,
    fromBridgeBalance,
    toBridgeBalance,
    fromChainName,
    toChainName,
    nativeTokenSymbol,
    inputHandler,
    resetStates,
    reverseChain,
    handleBridge,
  };
}
