import { ethers, constants as ethersConstants } from 'ethers';
import { debounce } from 'lodash-es';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { checkAllowance, getTokenBal, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { Erc20Token } from 'src/modules/token';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import {
  EthBridgeChainId,
  EthBridgeContract,
  EthBridgeNetworkName,
  ZkToken,
  getNetworkId,
} from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IZkBridgeService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { WatchCallback, computed, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEthProvider } from '../custom-signature/useEthProvider';
import { EthereumProvider } from '../types/CustomSignature';
import { Path } from 'src/router';
import { useRouter } from 'vue-router';
import { nativeBridgeEnabled } from 'src/features';

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
      : EthBridgeNetworkName.Zkyoto;
  });

  const zkTokens = ref<ZkToken[]>([]);
  const selectedToken = ref<ZkToken>(eth);
  const importTokenAddress = ref<string>('');
  const bridgeAmt = ref<string | null>(null);
  const toBridgeBalance = ref<number>(0);
  const fromBridgeBalance = ref<number>(0);
  const isGasPayable = ref<boolean | undefined>(undefined);
  const isLoadingGasPayable = ref<boolean>(true);
  const errMsg = ref<string>('');
  const fromChainName = ref<EthBridgeNetworkName>(l2Network.value);
  const toChainName = ref<EthBridgeNetworkName>(l1Network.value);
  const isApproved = ref<boolean>(false);
  const isApproving = ref<boolean>(false);
  const isApproveMaxAmount = ref<boolean>(false);
  const providerChainId = ref<number>(0);

  const resetStates = (): void => {
    bridgeAmt.value = '';
    fromBridgeBalance.value = 0;
    toBridgeBalance.value = 0;
    errMsg.value = '';
    isApproveMaxAmount.value = false;
    isApproving.value = false;
    isApproved.value = false;
  };

  const store = useStore();
  const { t } = useI18n();
  const { currentAccount } = useAccount();
  const { web3Provider, ethProvider } = useEthProvider();
  const router = useRouter();

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

  const setIsApproving = (result: boolean) => {
    isApproving.value = result;
  };

  const setIsApproved = async (): Promise<void> => {
    const fromChainIdRef = fromChainId.value;
    const senderAddress = currentAccount.value;
    const contractAddress = EthBridgeContract[fromChainName.value];
    const tokenAddress = selectedToken.value.address;
    const decimals = selectedToken.value.decimal;
    const amount = bridgeAmt.value ?? '0';
    if (tokenAddress === astarNativeTokenErcAddr) {
      isApproved.value = true;
      return;
    }
    if (!decimals || !amount) return;
    try {
      const amountAllowance = await checkAllowance({
        srcChainId: fromChainIdRef,
        senderAddress,
        contractAddress,
        tokenAddress,
      });
      const formattedAllowance = ethers.utils.formatUnits(amountAllowance, decimals).toString();
      console.info('allowance: ', formattedAllowance, selectedToken.value.symbol);
      isApproved.value = Number(formattedAllowance) >= Number(amount);
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
                image: it.image,
                bridgeUrl: it.bridgeUrl,
              }
            : null;
        })
        .filter((it: Erc20Token) => it !== null && !it.bridgeUrl);

    let tokens = [];
    if (filteredTokens) {
      tokens = [eth, ...filteredTokens];
    } else {
      tokens = [eth];
    }

    const balTokens = await Promise.all(
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

    const sortedTokens = balTokens
      .sort((a, b) => {
        if (a.symbol < b.symbol) {
          return -1;
        }
        if (a.symbol > b.symbol) {
          return 1;
        }
        return 0;
      })
      .sort((a, b) => Number(b.fromChainBalance) - Number(a.fromChainBalance));

    const moveEthToFront = (tokens: ZkToken[]): ZkToken[] => {
      const ethIndex = tokens.findIndex((token) => token.symbol === 'ETH');
      if (ethIndex > -1) {
        // Memo: Remove the ETH token from its current position
        const [ethToken] = tokens.splice(ethIndex, 1);
        // Memo Add the ETH token to the beginning of the array
        tokens.unshift(ethToken);
      }
      return tokens;
    };

    zkTokens.value = moveEthToFront(sortedTokens);
  };

  const setZkTokens = async (token: ZkToken): Promise<void> => {
    zkTokens.value.push(token);
    importTokenAddress.value = '';
  };

  const inputHandler = (event: any): void => {
    bridgeAmt.value = event.target.value;
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

  const setErrorMsg = (): void => {
    if (isLoading.value) return;
    const bridgeAmtRef = Number(bridgeAmt.value);
    const providerChainIdRef = providerChainId.value;
    const selectedTokenRef = selectedToken.value;
    const isGasPayableRef = isGasPayable.value;
    const isLoadingGasPayableRef = isLoadingGasPayable.value;
    const isBalanceNotEnough =
      !isGasPayableRef && bridgeAmtRef > 0 && isApproved.value && !isLoadingGasPayableRef;
    try {
      if (bridgeAmtRef > fromBridgeBalance.value) {
        errMsg.value = t('warning.insufficientBalance', {
          token: selectedTokenRef.symbol,
        });
      } else if (providerChainIdRef !== fromChainId.value) {
        errMsg.value = t('warning.selectedInvalidNetworkInWallet');
      } else if (isBalanceNotEnough) {
        errMsg.value = t('warning.balanceNotEnough', { symbol: 'ETH' });
      } else {
        errMsg.value = '';
      }
    } catch (error: any) {
      errMsg.value = error.message;
    }
  };

  const reverseChain = async (
    fromChain: EthBridgeNetworkName,
    toChain: EthBridgeNetworkName
  ): Promise<void> => {
    fromChainName.value = toChain;
    toChainName.value = fromChain;
    // Fixme: switch chain with not changing selected token
    // const waitDelay = 500;
    // await wait(waitDelay);
    // const t = zkTokens.value.find((it) => it.address === selectedToken.value.toChainTokenAddress);
    // setSelectedToken(t ? t : eth);
    setSelectedToken(eth);
    resetStates();
  };

  const setProviderChainId: WatchCallback<[number, EthereumProvider | undefined]> = async (
    [fromChainId, provider],
    _,
    registerCleanup
  ) => {
    try {
      if (!provider || !web3Provider.value || !ethProvider.value) return;
      const chainId = await web3Provider.value.eth.getChainId();
      providerChainId.value = chainId;

      providerChainId.value = await web3Provider.value!.eth.net.getId();
      if (providerChainId.value !== fromChainId) {
        await setupNetwork({ network: fromChainId, provider: ethProvider.value });
        const chainId = await web3Provider.value.eth.getChainId();
        providerChainId.value = chainId;
      }

      const handleChainChanged = (chainId: string) => {
        providerChainId.value = Number(chainId);
      };

      //subscribe to chainChanged event
      provider.on('chainChanged', handleChainChanged);

      registerCleanup(() => {
        // unsubscribe from chainChanged event to prevent memory leak
        provider.removeListener('chainChanged', handleChainChanged);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (): Promise<String> => {
    if (!bridgeAmt.value || !selectedToken.value.address) return '';
    const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
    const amount = isApproveMaxAmount.value
      ? ethersConstants.MaxUint256
      : ethers.utils.parseUnits(bridgeAmt.value, selectedToken.value.decimal).toString();

    return await zkBridgeService.approve({
      amount,
      fromChainName: fromChainName.value,
      toChainName: toChainName.value,
      senderAddress: currentAccount.value,
      tokenAddress: selectedToken.value.address,
      decimal: selectedToken.value.decimal,
    });
  };

  const handleBridge = async (): Promise<String> => {
    if (!bridgeAmt.value || !selectedToken.value.address) return '';
    if (!isApproved.value) {
      throw Error('Please approve first');
    }
    const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
    const destNetworkId = await getNetworkId(toChainName.value);

    const hash = await zkBridgeService.bridgeAsset({
      amount: bridgeAmt.value,
      fromChainName: fromChainName.value,
      toChainName: toChainName.value,
      senderAddress: currentAccount.value,
      tokenAddress: selectedToken.value.address,
      decimal: selectedToken.value.decimal,
      destNetworkId,
    });
    await setIsApproved();
    bridgeAmt.value = '';
    isApproveMaxAmount.value = false;
    return hash;
  };

  const setIsGasPayable = async (): Promise<void> => {
    if (!bridgeAmt.value || !selectedToken.value.address || !isApproved.value) return;
    try {
      isLoadingGasPayable.value = true;
      const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
      const destNetworkId = await getNetworkId(toChainName.value);

      isGasPayable.value = await zkBridgeService.dryRunBridgeAsset({
        amount: bridgeAmt.value,
        fromChainName: fromChainName.value,
        toChainName: toChainName.value,
        senderAddress: currentAccount.value,
        tokenAddress: selectedToken.value.address,
        decimal: selectedToken.value.decimal,
        destNetworkId,
      });
    } catch (error) {
      console.error(error);
    } finally {
      isLoadingGasPayable.value = false;
    }
  };

  watch([fromChainId, ethProvider], setProviderChainId, { immediate: true });
  watch([providerChainId, isLoading, bridgeAmt, selectedToken, isGasPayable], setErrorMsg, {
    immediate: true,
  });

  watch([fromChainName, toChainName, currentAccount, selectedToken], setBridgeBalance, {
    immediate: true,
  });
  watch([currentAccount, fromChainName], initZkTokens, { immediate: true });

  const debounceDelay = 500;
  const debounceIsGasPayable = 1000;
  const debouncedSetIsApproved = debounce(setIsApproved, debounceDelay);
  const debouncedSetIsGasPayable = debounce(setIsGasPayable, debounceIsGasPayable);

  watch([selectedToken, fromChainId, currentAccount, bridgeAmt], debouncedSetIsApproved, {
    immediate: true,
  });

  watch([bridgeAmt, isApproved], debouncedSetIsGasPayable, {
    immediate: false,
  });

  watch([selectedToken, fromChainId, currentAccount], resetStates);

  const autoFetchAllowanceHandler = setInterval(
    async () => {
      if (!isApproved.value) {
        await setIsApproved();
      }
    },
    isApproving.value ? 5 : 30 * 1000
  );

  // Memo: the app goes to assets page if users access to the bridge page by inputting URL directly
  watchEffect(() => {
    if (!nativeBridgeEnabled) {
      router.push(Path.Assets);
    }
  });

  onUnmounted(() => {
    clearInterval(autoFetchAllowanceHandler);
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
    isApproving,
    isApproveMaxAmount,
    setIsApproving,
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
