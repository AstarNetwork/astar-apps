import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { EVM, getNativeBalance } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, ref, watchEffect, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Web3 from 'web3';

export enum BridgeNetworkName {
  'Sepolia' = 'Sepolia Testnet',
  'Akiba' = 'Akiba zkEVM Testnet',
  'Ethereum' = 'Ethereum Mainnet',
  'Astar' = 'Astar zkEVM Mainnet',
}

const chainId = {
  [BridgeNetworkName.Sepolia]: EVM.SEPOLIA_TESTNET,
  [BridgeNetworkName.Ethereum]: EVM.ETHEREUM_MAINNET,
  [BridgeNetworkName.Akiba]: EVM.AKIBA_TESTNET,
  [BridgeNetworkName.Astar]: EVM.ASTAR_ZKEVM_MAINNET,
};

export function useL1Bridge() {
  const l1Network = computed<string>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? BridgeNetworkName.Ethereum
      : BridgeNetworkName.Sepolia;
  });

  const l2Network = computed<string>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? BridgeNetworkName.Astar
      : BridgeNetworkName.Akiba;
  });

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

  const setBridgeBalance = async () => {
    const fromChainId = chainId[fromChainName.value as BridgeNetworkName];
    const toChainId = chainId[toChainName.value as BridgeNetworkName];

    const [fromBal, toBal] = await Promise.all([
      getNativeBalance({
        address: currentAccount.value,
        srcChainId: fromChainId,
      }),
      getNativeBalance({
        address: currentAccount.value,
        srcChainId: toChainId,
      }),
    ]);
    fromBridgeBalance.value = Number(fromBal);
    toBridgeBalance.value = Number(toBal);
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
  watch([fromChainName, toChainName], setBridgeBalance, { immediate: true });

  watchEffect(async () => {
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
