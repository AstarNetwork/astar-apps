import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getNativeBalance, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeChainId, EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IZkBridgeService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEthProvider } from '../custom-signature/useEthProvider';

export const useL1Bridge = () => {
  const l1Network = computed<EthBridgeNetworkName>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? EthBridgeNetworkName.Ethereum
      : EthBridgeNetworkName.Sepolia;
  });

  const l2Network = computed<EthBridgeNetworkName>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? EthBridgeNetworkName.AstarZk
      : EthBridgeNetworkName.Akiba;
  });

  const bridgeAmt = ref<string | null>(null);
  const toBridgeBalance = ref<number>(0);
  const fromBridgeBalance = ref<number>(0);
  const errMsg = ref<string>('');
  const fromChainName = ref<EthBridgeNetworkName>(l1Network.value);
  const toChainName = ref<EthBridgeNetworkName>(l2Network.value);

  const store = useStore();
  const { t } = useI18n();
  const { currentAccount } = useAccount();
  const { web3Provider, ethProvider } = useEthProvider();

  const { nativeTokenSymbol } = useNetworkInfo();
  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

  const isDisabledBridge = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(bridgeAmt.value) || fromBridgeBalance.value < Number(bridgeAmt.value);
    return errMsg.value !== '' || isLessAmount;
  });

  const inputHandler = (event: any): void => {
    bridgeAmt.value = event.target.value;
    errMsg.value = '';
  };

  const setBridgeBalance = async () => {
    const fromChainId = EthBridgeChainId[fromChainName.value as EthBridgeNetworkName];
    const toChainId = EthBridgeChainId[toChainName.value as EthBridgeNetworkName];

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
    bridgeAmt.value = '';
    fromBridgeBalance.value = 0;
    toBridgeBalance.value = 0;
    errMsg.value = '';
  };

  const setErrorMsg = (): void => {
    if (isLoading.value) return;
    const bridgeAmtRef = Number(bridgeAmt.value);
    try {
      if (bridgeAmtRef > fromBridgeBalance.value) {
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

  const reverseChain = (fromChain: EthBridgeNetworkName, toChain: EthBridgeNetworkName): void => {
    fromChainName.value = toChain;
    toChainName.value = fromChain;
  };

  const handleNetwork = async (): Promise<void> => {
    try {
      if (!web3Provider.value || !ethProvider.value) return;
      const connectedNetwork = await web3Provider.value!.eth.net.getId();
      const fromChainId = EthBridgeChainId[fromChainName.value as EthBridgeNetworkName];
      if (connectedNetwork !== fromChainId) {
        await setupNetwork({ network: fromChainId, provider: ethProvider.value });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBridge = async (): Promise<String> => {
    if (!bridgeAmt.value) return '';
    const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
    return await zkBridgeService.bridgeAsset({
      amount: bridgeAmt.value,
      fromChainName: fromChainName.value,
      toChainName: toChainName.value,
      senderAddress: currentAccount.value,
    });
  };

  watchEffect(setErrorMsg);
  watch([fromChainName, toChainName], setBridgeBalance, { immediate: true });
  watch([fromChainName, toChainName], handleNetwork, { immediate: true });

  return {
    bridgeAmt,
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
};
