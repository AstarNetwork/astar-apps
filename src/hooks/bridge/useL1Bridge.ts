import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getNativeBalance, getTokenBal, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeChainId, EthBridgeNetworkName, ZkToken } from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IZkBridgeService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEthProvider } from '../custom-signature/useEthProvider';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { wait } from '@astar-network/astar-sdk-core';

const eth = {
  symbol: 'ETH',
  name: 'Ether',
  decimal: 18,
  address: astarNativeTokenErcAddr,
  toChainTokenAddress: astarNativeTokenErcAddr,
  fromChainBalance: 0,
  toChainBalance: 0,
};

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
      : EthBridgeNetworkName.Zkatana;
  });

  const zkTokens = ref<ZkToken[]>([]);
  const selectedToken = ref<ZkToken>(eth);
  const importTokenAddress = ref<string>('');
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
  const fromChainId = computed<number>(
    () => EthBridgeChainId[fromChainName.value as EthBridgeNetworkName]
  );
  const toChainId = computed<number>(
    () => EthBridgeChainId[toChainName.value as EthBridgeNetworkName]
  );

  const isDisabledBridge = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(bridgeAmt.value) || fromBridgeBalance.value < Number(bridgeAmt.value);
    return errMsg.value !== '' || isLessAmount;
  });

  const setSelectedToken = (token: ZkToken): void => {
    selectedToken.value = token;
  };

  const initZkTokens = async (): Promise<void> => {
    const address = currentAccount.value;
    const fromChainIdRef = fromChainId.value;
    if (!address) return;
    const tokensRaw = localStorage.getItem(LOCAL_STORAGE.ZK_Bridge_IMPORT_TOKENS);
    const tokensData = tokensRaw ? JSON.parse(tokensRaw) : {};
    let tokens = [];

    if (tokensData.hasOwnProperty(address)) {
      const addressData = tokensData[address];
      if (addressData.hasOwnProperty(fromChainIdRef)) {
        tokens = addressData[fromChainIdRef];
      } else {
        tokens = [eth];
      }
    } else {
      tokens = [eth];
    }
    zkTokens.value = await Promise.all(
      tokens.map(async (token: ZkToken) => {
        let fromChainBalance = '0';
        fromChainBalance = await getTokenBal({
          address,
          tokenAddress: token.address,
          srcChainId: fromChainIdRef,
          tokenSymbol: token.symbol,
        });
        return {
          ...token,
          fromChainBalance: Number(fromChainBalance),
        };
      })
    );
  };

  const setZkTokens = async (token: ZkToken): Promise<void> => {
    const storeTokenData = {
      [fromChainId.value]: [...zkTokens.value, token],
    };

    const tokensRaw = localStorage.getItem(LOCAL_STORAGE.ZK_Bridge_IMPORT_TOKENS);
    const tokensData = tokensRaw ? JSON.parse(tokensRaw) : {};
    const address = currentAccount.value;

    let newDataObj;
    if (tokensData.hasOwnProperty(address)) {
      const addressData = tokensData[address];
      newDataObj = { ...tokensData, [address]: { ...addressData, storeTokenData } };
    } else {
      newDataObj = { ...tokensData, [address]: storeTokenData };
    }
    localStorage.setItem(LOCAL_STORAGE.ZK_Bridge_IMPORT_TOKENS, JSON.stringify(newDataObj));

    zkTokens.value.push(token);
    // Memo: to avoid closing select token modal
    await wait(500);
    importTokenAddress.value = '';
  };

  const inputHandler = (event: any): void => {
    bridgeAmt.value = event.target.value;
    errMsg.value = '';
  };

  const inputImportTokenHandler = (event: any): void => {
    importTokenAddress.value = event.target.value;
  };

  const setBridgeBalance = async () => {
    if (
      !currentAccount.value ||
      !fromChainId.value ||
      !selectedToken.value ||
      !toChainId.value ||
      !selectedToken.value.toChainTokenAddress
    ) {
      return;
    }
    const [fromBal, toBal] = await Promise.all([
      getTokenBal({
        address: currentAccount.value,
        tokenAddress: selectedToken.value.address,
        srcChainId: fromChainId.value,
        tokenSymbol: selectedToken.value.symbol,
      }),
      getTokenBal({
        address: currentAccount.value,
        tokenAddress: selectedToken.value.toChainTokenAddress ?? '',
        srcChainId: toChainId.value,
        tokenSymbol: selectedToken.value.symbol,
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
          token: selectedToken.value.symbol,
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
      if (connectedNetwork !== fromChainId.value) {
        await setupNetwork({ network: fromChainId.value, provider: ethProvider.value });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBridge = async (): Promise<String> => {
    if (!bridgeAmt.value || !selectedToken.value.address) return '';
    const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
    return await zkBridgeService.bridgeAsset({
      amount: bridgeAmt.value,
      fromChainName: fromChainName.value,
      toChainName: toChainName.value,
      senderAddress: currentAccount.value,
      tokenAddress: selectedToken.value.address,
    });
  };

  watchEffect(setErrorMsg);
  watch([fromChainName, toChainName, currentAccount, selectedToken], setBridgeBalance, {
    immediate: true,
  });
  watch([fromChainName, toChainName], handleNetwork, { immediate: true });
  watch([currentAccount, fromChainName], initZkTokens, { immediate: true });

  return {
    bridgeAmt,
    errMsg,
    isDisabledBridge,
    fromBridgeBalance,
    toBridgeBalance,
    fromChainName,
    toChainName,
    nativeTokenSymbol,
    importTokenAddress,
    fromChainId,
    toChainId,
    zkTokens,
    selectedToken,
    setSelectedToken,
    setZkTokens,
    inputHandler,
    inputImportTokenHandler,
    resetStates,
    reverseChain,
    handleBridge,
  };
};
