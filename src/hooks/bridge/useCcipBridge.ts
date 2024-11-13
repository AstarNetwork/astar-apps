import { debounce } from 'lodash-es';
import { getTokenBal, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { CCIP_BRIDGE_CHAIN_ID, CCIP_CHAIN_ID, CCIP_NETWORK_NAME } from 'src/modules/ccip-bridge';
import { showLoading } from 'src/modules/extrinsic/utils';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { LayerZeroSlippage, LayerZeroToken, LayerZeroTokens } from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { WatchCallback, computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEthProvider } from '../custom-signature/useEthProvider';
import { EthereumProvider } from '../types/CustomSignature';

export const useCcipBridge = () => {
  const { isShibuya } = useNetworkInfo();

  const selectedToken = ref<LayerZeroToken>(LayerZeroTokens[0]);
  const importTokenAddress = ref<string>('');
  const bridgeAmt = ref<string | null>(null);
  const toBridgeBalance = ref<number>(0);
  const fromBridgeBalance = ref<number>(0);
  const isGasPayable = ref<boolean | undefined>(undefined);
  const isLoadingGasPayable = ref<boolean>(true);
  const errMsg = ref<string>('');
  const fromChainName = ref<CCIP_NETWORK_NAME>(
    isShibuya.value ? CCIP_NETWORK_NAME.ShibuyaEvm : CCIP_NETWORK_NAME.AstarEvm
  );
  const toChainName = ref<CCIP_NETWORK_NAME>(
    isShibuya.value ? CCIP_NETWORK_NAME.SoneiumMinato : CCIP_NETWORK_NAME.Soneium
  );
  const isApproved = ref<boolean>(false);
  const isApproving = ref<boolean>(false);
  const isApproveMaxAmount = ref<boolean>(false);
  const providerChainId = ref<number>(0);
  const transactionFee = ref<number>(0);

  const resetStates = (): void => {
    bridgeAmt.value = '';
    fromBridgeBalance.value = 0;
    toBridgeBalance.value = 0;
    transactionFee.value = 0;
    errMsg.value = '';
    isApproveMaxAmount.value = false;
    isApproving.value = false;
    isApproved.value = false;
  };

  const store = useStore();
  const { t } = useI18n();
  const { currentAccount } = useAccount();
  const { web3Provider, ethProvider } = useEthProvider();

  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
  const fromChainId = computed<CCIP_CHAIN_ID>(
    () => CCIP_BRIDGE_CHAIN_ID[fromChainName.value as CCIP_NETWORK_NAME]
  );

  const toChainId = computed<CCIP_CHAIN_ID>(
    () => CCIP_BRIDGE_CHAIN_ID[toChainName.value as CCIP_NETWORK_NAME]
  );

  const isDisabledBridge = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(bridgeAmt.value) || fromBridgeBalance.value < Number(bridgeAmt.value);
    return errMsg.value !== '' || isLessAmount;
  });

  const setSelectedToken = (token: LayerZeroToken): void => {
    selectedToken.value = token;
  };

  const setIsApproving = (result: boolean) => {
    isApproving.value = result;
  };

  const setIsApproved = async (): Promise<void> => {
    // const fromChainIdRef = fromChainId.value as number;
    // const senderAddress = currentAccount.value;
    // const fromNetworkId = fromLzId.value;
    // const contractAddress = selectedToken.value.oftBridgeContract[fromNetworkId];
    // const tokenAddress = selectedToken.value.tokenAddress[fromNetworkId];
    // const decimals = selectedToken.value.decimals[fromNetworkId];
    // const amount = bridgeAmt.value ?? '0';

    // const isApprovalRequired =
    //   tokenAddress !== astarNativeTokenErcAddr && contractAddress !== tokenAddress;

    // if (!isApprovalRequired) {
    //   isApproved.value = true;
    //   return;
    // }
    // if (!amount) return;
    try {
      //   const amountAllowance = await checkAllowance({
      //     srcChainId: fromChainIdRef,
      //     senderAddress,
      //     contractAddress,
      //     tokenAddress,
      //   });
      //   const formattedAllowance = ethers.utils.formatUnits(amountAllowance, decimals).toString();
      //   console.info('allowance: ', formattedAllowance, selectedToken.value.symbol[fromNetworkId]);
      //   isApproved.value = Number(formattedAllowance) >= Number(amount);
      isApproved.value = true;
    } catch (error) {
      console.error(error);
      isApproved.value = false;
    }
  };

  const inputHandler = (event: any): void => {
    bridgeAmt.value = event.target.value;
  };

  const inputImportTokenHandler = (event: any): void => {
    importTokenAddress.value = event.target.value;
  };

  const setBridgeBalance = async (): Promise<void> => {
    if (!currentAccount.value || !selectedToken.value) {
      return;
    }
    try {
      showLoading(store.dispatch, true);
      // Todo: update SBY token address
      const [fromChainBalance, toChainBalance] = await Promise.all([
        getTokenBal({
          address: currentAccount.value,
          tokenAddress: astarNativeTokenErcAddr,
          srcChainId: CCIP_BRIDGE_CHAIN_ID[fromChainName.value],
          tokenSymbol: selectedToken.value.symbol,
        }),
        getTokenBal({
          address: currentAccount.value,
          tokenAddress: astarNativeTokenErcAddr,
          srcChainId: CCIP_BRIDGE_CHAIN_ID[toChainName.value],
          tokenSymbol: selectedToken.value.symbol,
        }),
      ]);

      fromBridgeBalance.value = Number(fromChainBalance);
      toBridgeBalance.value = Number(toChainBalance);
    } catch (error) {
      console.error(error);
    } finally {
      showLoading(store.dispatch, false);
    }
  };

  const setErrorMsg = (): void => {
    const isLoadingGasPayableRef = isLoadingGasPayable.value;
    if (isLoading.value || isLoadingGasPayableRef) return;
    const bridgeAmtRef = Number(bridgeAmt.value);
    const providerChainIdRef = providerChainId.value;
    const selectedTokenRef = selectedToken.value;
    const isGasPayableRef = isGasPayable.value;
    const isBalanceNotEnough = !isGasPayableRef && bridgeAmtRef > 0 && isApproved.value;

    try {
      if (bridgeAmtRef > fromBridgeBalance.value) {
        errMsg.value = t('warning.insufficientBalance', {
          token: selectedTokenRef.symbol,
        });
      } else if (providerChainIdRef !== fromChainId.value) {
        errMsg.value = t('warning.selectedInvalidNetworkInWallet');
      } else if (isBalanceNotEnough) {
        errMsg.value = t('warning.balanceNotEnough', {
          symbol: isShibuya.value ? 'SBY' : 'ASTR',
        });
      } else {
        errMsg.value = '';
      }
    } catch (error: any) {
      errMsg.value = error.message;
    }
  };

  const reverseChain = async (
    fromChain: CCIP_NETWORK_NAME,
    toChain: CCIP_NETWORK_NAME
  ): Promise<void> => {
    fromChainName.value = toChain;
    toChainName.value = fromChain;
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
    // if (!bridgeAmt.value) return '';
    // const lzBridgeService = container.get<ILzBridgeService>(Symbols.LzBridgeService);
    // const amount = isApproveMaxAmount.value
    //   ? ethersConstants.MaxUint256
    //   : ethers.utils
    //       .parseUnits(bridgeAmt.value, selectedToken.value.decimals[fromLzId.value])
    //       .toString();
    // return await lzBridgeService.approve({
    //   amount: String(amount),
    //   contractAddress: selectedToken.value.oftBridgeContract[fromLzId.value],
    //   senderAddress: currentAccount.value,
    //   tokenAddress: selectedToken.value.tokenAddress[fromLzId.value],
    //   fromChainId: fromChainId.value,
    // });
    return '';
  };

  const calcMinAmount = (amount: number): number => {
    // Memo: LayerZeroSlippage: 0.5%
    const result = amount * (1 - LayerZeroSlippage / 100);
    // Memo: resolve the issue due to the limitations of floating-point precision in JS.
    return parseFloat(result.toFixed(5));
  };

  const handleBridge = async (): Promise<String> => {
    // if (!bridgeAmt.value || !isApproved.value) return '';
    // const lzBridgeService = container.get<ILzBridgeService>(Symbols.LzBridgeService);
    // const amount = Number(bridgeAmt.value);

    // const isNativeToken =
    //   fromChainName.value === LayerZeroNetworkName.AstarEvm &&
    //   selectedToken.value.symbol === 'ASTR';

    // const hash = await lzBridgeService.bridgeLzAsset({
    //   senderAddress: currentAccount.value,
    //   amount,
    //   minAmount: calcMinAmount(amount),
    //   fromNetworkId: fromLzId.value,
    //   destNetworkId: toLzId.value,
    //   tokenAddress: selectedToken.value.tokenAddress[fromLzId.value],
    //   isNativeToken,
    //   token: selectedToken.value,
    //   fromChainId: fromChainId.value,
    // });

    // if (isHex(hash)) {
    //   addLzHistories({
    //     hash: hash,
    //     type: HistoryTxType.LZ_BRIDGE,
    //     address: currentAccount.value,
    //     amount: bridgeAmt.value,
    //     symbol: selectedToken.value.symbol,
    //     fromChainId: fromChainId.value,
    //     toChainId: toChainId.value,
    //   });
    // }

    const hash = '';
    await setIsApproved();
    bridgeAmt.value = '';
    isApproveMaxAmount.value = false;
    return hash;
  };

  const setIsGasPayable = async (): Promise<void> => {
    try {
      if (errMsg.value || !currentAccount.value) return;
      // isLoadingGasPayable.value = true;
      // const lzBridgeService = container.get<ILzBridgeService>(Symbols.LzBridgeService);
      // const amount = bridgeAmt.value ? Number(bridgeAmt.value) : 0.01;
      // const isNativeToken =
      //   fromChainName.value === LayerZeroNetworkName.AstarEvm &&
      //   selectedToken.value.symbol === 'ASTR';

      // const { isGasPayable: resIsGasPayable, fee } = await lzBridgeService.dryRunBridgeAsset({
      //   senderAddress: currentAccount.value,
      //   amount,
      //   minAmount: calcMinAmount(amount),
      //   fromNetworkId: fromLzId.value,
      //   destNetworkId: toLzId.value,
      //   tokenAddress: selectedToken.value.tokenAddress[fromLzId.value],
      //   isNativeToken,
      //   token: selectedToken.value,
      //   fromChainId: fromChainId.value,
      // });
      // transactionFee.value = fee;
      // isGasPayable.value = resIsGasPayable;
    } catch (error) {
      // Memo: can be ignore 'outOfFund' error due to the token balance is not enough because of hardcoding in amount variable above
      console.error(error);
    } finally {
      isLoadingGasPayable.value = false;
    }
  };

  watch([fromChainId, ethProvider], setProviderChainId, { immediate: true });
  watch([providerChainId, isLoading, bridgeAmt, selectedToken, isGasPayable], setErrorMsg, {
    immediate: false,
  });

  watch([fromChainName, selectedToken], setBridgeBalance, {
    immediate: false,
  });
  // watch([currentAccount, fromChainName], initLzTokens, { immediate: true });

  const debounceDelay = 500;
  const debounceIsGasPayable = 1000;
  const debouncedSetIsApproved = debounce(setIsApproved, debounceDelay);
  const debouncedSetIsGasPayable = debounce(setIsGasPayable, debounceIsGasPayable);

  watch([selectedToken, fromChainId, currentAccount, bridgeAmt], debouncedSetIsApproved, {
    immediate: true,
  });

  watch(
    [bridgeAmt, fromChainName, currentAccount, errMsg, providerChainId, currentAccount],
    debouncedSetIsGasPayable,
    {
      immediate: false,
    }
  );

  watch([selectedToken, fromChainId], resetStates, {
    immediate: false,
  });

  const autoFetchAllowanceHandler = setInterval(
    async () => {
      if (!isApproved.value) {
        await setIsApproved();
      }
    },
    isApproving.value ? 5 : 30 * 1000
  );

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
    // lzTokens,
    selectedToken,
    isApproved,
    isApproving,
    isApproveMaxAmount,
    transactionFee,
    setIsApproving,
    setSelectedToken,
    inputHandler,
    inputImportTokenHandler,
    resetStates,
    reverseChain,
    handleBridge,
    handleApprove,
  };
};
