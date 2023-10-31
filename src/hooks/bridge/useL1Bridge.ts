import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { checkAllowance, getTokenBal } from 'src/config/web3';
import {
  EthBridgeChainId,
  EthBridgeContract,
  EthBridgeNetworkName,
  ZkToken,
} from 'src/modules/zk-evm-bridge';
import { setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IZkBridgeService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch, watchEffect, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEthProvider } from '../custom-signature/useEthProvider';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { ethers } from 'ethers';
import { Erc20Token } from 'src/modules/token';

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
  const isApproved = ref<boolean>(false);

  const store = useStore();
  const { t } = useI18n();
  const { currentAccount } = useAccount();
  const { web3Provider, ethProvider } = useEthProvider();

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

  const setIsApproved = async (): Promise<void> => {
    const fromChainIdRef = fromChainId.value;
    const senderAddress = currentAccount.value;
    const contractAddress = EthBridgeContract[fromChainName.value];
    const tokenAddress = selectedToken.value.address;
    const decimals = selectedToken.value.decimal;
    const amount = bridgeAmt.value ?? '0';
    if (!decimals) return;
    try {
      if (tokenAddress === astarNativeTokenErcAddr) {
        isApproved.value = true;
        return;
      }
      const amountAllowance = await checkAllowance({
        srcChainId: fromChainIdRef,
        senderAddress,
        contractAddress,
        tokenAddress,
      });
      const parsedBridgeAmount = ethers.utils.parseUnits(amount, decimals).toString();
      isApproved.value =
        Number(amountAllowance) !== 0 && Number(amountAllowance) >= Number(parsedBridgeAmount);
    } catch (error) {
      console.error(error);
      isApproved.value = false;
    }
  };

  const initZkTokens = async (): Promise<void> => {
    const address = currentAccount.value;
    const fromChainIdRef = fromChainId.value;
    if (!address) return;
    const tokensRaw = localStorage.getItem(LOCAL_STORAGE.EVM_TOKEN_IMPORTS);
    const tokensData = tokensRaw ? JSON.parse(tokensRaw) : [];
    const filteredTokens =
      tokensData.length > 0 &&
      tokensData
        .map((it: Erc20Token) => {
          const isValidToken = it.bridgedTokenAddress && it.srcChainId === fromChainIdRef;
          return isValidToken
            ? {
                address: it.address,
                decimal: Number(it.decimal),
                fromChainBalance: 0,
                name: it.name,
                symbol: it.symbol,
                toChainBalance: 0,
                toChainTokenAddress: it.bridgedTokenAddress,
              }
            : null;
        })
        .filter((it: Erc20Token) => it !== null);

    let tokens = [];
    if (filteredTokens) {
      tokens = [eth, ...filteredTokens];
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
    zkTokens.value.push(token);
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

  const handleApprove = async (): Promise<String> => {
    if (!bridgeAmt.value || !selectedToken.value.address) return '';
    const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
    return await zkBridgeService.approve({
      amount: bridgeAmt.value,
      fromChainName: fromChainName.value,
      toChainName: toChainName.value,
      senderAddress: currentAccount.value,
      tokenAddress: selectedToken.value.address,
      decimal: selectedToken.value.decimal,
    });
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
      decimal: selectedToken.value.decimal,
    });
  };

  watchEffect(setErrorMsg);
  watch([fromChainName, toChainName, currentAccount, selectedToken], setBridgeBalance, {
    immediate: true,
  });
  watch([fromChainName, toChainName], handleNetwork, { immediate: true });
  watch([currentAccount, fromChainName], initZkTokens, { immediate: true });
  watch([selectedToken, fromChainId, currentAccount], setIsApproved);

  const autoFetchAllowanceHandler = setInterval(async () => {
    if (!isApproved.value) {
      await setIsApproved();
    }
  }, 30 * 1000);

  onUnmounted(() => {
    clearInterval(autoFetchAllowanceHandler);
  });

  watchEffect(() => {
    console.log('isApproved', isApproved.value);
  });

  return {
    bridgeAmt,
    errMsg,
    isDisabledBridge,
    fromBridgeBalance,
    toBridgeBalance,
    fromChainName,
    toChainName,
    importTokenAddress,
    fromChainId,
    toChainId,
    zkTokens,
    selectedToken,
    isApproved,
    setSelectedToken,
    setZkTokens,
    inputHandler,
    inputImportTokenHandler,
    resetStates,
    reverseChain,
    handleBridge,
    handleApprove,
  };
};
