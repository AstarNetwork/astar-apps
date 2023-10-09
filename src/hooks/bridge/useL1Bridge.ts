import { ethers } from 'ethers';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getNativeBalance, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import {
  EthBridgeChainId,
  EthBridgeNetworkName,
  ZK_EVM_BRIDGE_ABI,
  ZkNetworkId,
} from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { AbiItem } from 'web3-utils';
import { useEthProvider } from '../custom-signature/useEthProvider';

export const useL1Bridge = () => {
  const l1Network = computed<string>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? EthBridgeNetworkName.Ethereum
      : EthBridgeNetworkName.Sepolia;
  });

  const l2Network = computed<string>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? EthBridgeNetworkName.Astar
      : EthBridgeNetworkName.Akiba;
  });

  const bridgeAmt = ref<string | null>(null);
  const toBridgeBalance = ref<number>(0);
  const fromBridgeBalance = ref<number>(0);
  const errMsg = ref<string>('');
  const fromChainName = ref<string>(l1Network.value);
  const toChainName = ref<string>(l2Network.value);

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

  const reverseChain = (fromChain: string, toChain: string): void => {
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

  const handleClaimAsset = async (): Promise<void> => {
    // Todo
  };

  const handleBridge = async (): Promise<void> => {
    if (!web3Provider.value || !ethProvider.value) return;
    try {
      const connectedNetwork = await web3Provider.value!.eth.net.getId();
      const fromChainId = EthBridgeChainId[fromChainName.value as EthBridgeNetworkName];
      if (connectedNetwork !== fromChainId) {
        throw Error("Connected Network doesn't match");
      }
      const web3 = web3Provider.value;
      const nonce = await web3.eth.getTransactionCount(currentAccount.value);

      const contractAddress = '0xE3583F529aA992D21A8fae3f3c37d94900339C7F';
      // ABI: https://github.com/0xPolygonHermez/zkevm-bridge-ui/blob/7c84791d06770569d316f27d62c3989bef81be58/abis/bridge.json
      const contract = new web3.eth.Contract(ZK_EVM_BRIDGE_ABI as AbiItem[], contractAddress);

      const isToL1 =
        toChainName.value === EthBridgeNetworkName.Ethereum ||
        toChainName.value === EthBridgeNetworkName.Sepolia;
      // Todo: Ask if `0` is L1 and `1` is L1
      const destinationNetwork = isToL1 ? ZkNetworkId.L1 : ZkNetworkId.L2;
      const destinationAddress = currentAccount.value;
      const amount = ethers.utils.parseEther(String(bridgeAmt.value)).toString();
      const token = astarNativeTokenErcAddr;

      // Todo: Ask if we need to care about `forceUpdateGlobalExitRoot` and `permitData`
      const forceUpdateGlobalExitRoot = true;
      const permitData = '0x';

      const data = contract.methods
        .bridgeAsset(
          destinationNetwork,
          destinationAddress,
          amount,
          token,
          forceUpdateGlobalExitRoot,
          permitData
        )
        .encodeABI();

      const rawTx = {
        nonce,
        from: currentAccount.value,
        to: contractAddress,
        value: amount,
        data,
      };
      const estimatedGas = await web3.eth.estimateGas(rawTx);
      await web3.eth
        .sendTransaction({ ...rawTx, gas: estimatedGas })
        .once('transactionHash', (transactionHash) => {
          console.log('transactionHash', transactionHash);
        });
    } catch (error) {
      // Memo: display the error toast
    }
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
    handleClaimAsset,
  };
};
