import { ApiPromise } from '@polkadot/api';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import { getTokenBal, isValidEvmAddress, toSS58Address } from 'src/config/web3';
import {
  astarNativeTokens,
  useAccount,
  useBalance,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
import { capitalize } from 'src/hooks/helper/common';
import {
  ASTAR_DECIMALS,
  ASTAR_SS58_FORMAT,
  isValidAddressPolkadotAddress,
  SUBSTRATE_SS58_FORMAT,
} from 'src/hooks/helper/plasmUtils';
import { SystemAccount } from 'src/modules/account';
import { showLoading } from 'src/modules/extrinsic/utils';
import {
  addXcmTxHistories,
  checkIsDeposit,
  fetchXcmBalance,
  monitorBalanceIncreasing,
  xcmChainObj,
} from 'src/modules/xcm';
import { useStore } from 'src/store';
import { Asset, ethWalletChains } from 'src/v2/models';
import { Chain, chainsNotSupportWithdrawal, XcmChain } from 'src/v2/models/XcmModels';
import { MOONBEAM_ASTAR_TOKEN_ID } from 'src/v2/repositories/implementations/xcm/MoonbeamXcmRepository';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { evmToAddress } from '@polkadot/util-crypto';
import { Path } from 'src/router';
import { container } from 'src/v2/common';
import { AstarToken } from 'src/v2/config/xcm/XcmRepositoryConfiguration';
import { IApiFactory } from 'src/v2/integration';
import { IXcmEvmService, IXcmService, IXcmTransfer } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { useRouter } from 'vue-router';

const { Acala, Astar, Karura, Polkadot, Shiden } = xcmChainObj;

export function useXcmBridgeV3(selectedToken: Ref<Asset>) {
  const originChainApi = ref<ApiPromise | null>(null);
  const srcChain = ref<XcmChain>(Polkadot);
  const destChain = ref<XcmChain>(Astar);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const isInputDestAddrManually = ref<boolean>(false);
  const inputtedAddress = ref<string>('');
  const destAddressBalance = ref<number>(0);
  const fromAddressBalance = ref<number>(0);
  const originChainNativeBal = ref<number>(0);
  const isLoadingApi = ref<boolean>(true);

  const router = useRouter();
  const { xcmOpponentChain, from, to, isEvmBridge, isTransferPage, reverseChain, tokenSymbol } =
    useTransferRouter();
  const { t } = useI18n();
  const store = useStore();
  const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();
  const { currentAccount } = useAccount();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isDeposit = computed<boolean>(() =>
    srcChain.value ? checkIsDeposit(srcChain.value.name) : false
  );
  const isAstar = computed<boolean>(() => currentNetworkIdx.value === endpointKey.ASTAR);

  const isAstarNativeTransfer = computed<boolean>(() => {
    return !!astarNativeTokens.find((it) => it === tokenSymbol.value);
  });

  const opponentChain = computed<XcmChain>(() => {
    try {
      let chain = xcmOpponentChain.value;
      if (xcmOpponentChain.value === Chain.ASTAR_EVM) {
        chain = Astar.name;
      }
      if (xcmOpponentChain.value === Chain.SHIDEN_EVM) {
        chain = Shiden.name;
      }
      return xcmChainObj[chain as keyof typeof xcmChainObj];
    } catch (error) {
      console.error(error);
      return isAstar.value ? Acala : Karura;
    }
  });

  const decimals = computed<number>(() =>
    selectedToken.value ? Number(selectedToken.value.metadata.decimals) : 0
  );
  const originChain = computed<XcmChain>(
    () => xcmChainObj[selectedToken.value.originChain as Chain]
  );

  const isLoadOriginApi = computed<boolean>(
    () => !!(selectedToken.value && selectedToken.value.originChain)
  );

  const isWithdrawalEthChain = computed<boolean>(() =>
    ethWalletChains.includes(destChain.value.name)
  );

  const { accountData } = useBalance(currentAccount);

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
    errMsg.value = '';
    inputtedAddress.value = '';
    destAddressBalance.value = 0;
    fromAddressBalance.value = 0;
    if (!isH160.value) {
      isInputDestAddrManually.value = false;
    }
  };

  const toggleIsInputDestAddrManually = (): void => {
    isInputDestAddrManually.value = !isInputDestAddrManually.value;
  };

  const setInputDestAddrManually = (): void => {
    if (inputtedAddress.value || isH160.value) {
      isInputDestAddrManually.value = true;
    }
  };

  const setSrcChain = (chain: XcmChain): void => {
    srcChain.value = chain;
    // Memo: prevent an error clicking the reverse button after the UI opened from clicking the XCM tab
    if (chain.name === destChain.value.name) {
      const astarChain = isAstar.value ? Astar : Shiden;
      destChain.value = destChain.value.name === astarChain.name ? opponentChain.value : astarChain;
    }
  };

  const setDestChain = (chain: XcmChain): void => {
    destChain.value = chain;
  };

  const getOriginChainNativeBal = async (): Promise<string> => {
    if (!currentAccount.value || !srcChain.value || !originChainApi.value || isH160.value) {
      return '0';
    }

    const xcmService = container.get<IXcmService>(Symbols.XcmService);
    const balance = await xcmService.getNativeBalance(currentAccount.value, srcChain.value);
    return balance.toString();
  };

  const setOriginChainNativeBal = async (): Promise<void> => {
    if (
      !originChainApi.value ||
      !selectedToken.value ||
      selectedToken.value.metadata === null ||
      isH160.value
    ) {
      return;
    }
    try {
      const isFromAstar = from.value === Astar.name || from.value === Shiden.name;
      const rawBalance =
        isAstarNativeTransfer.value && isFromAstar
          ? accountData.value!.getUsableTransactionBalance().toString()
          : await getOriginChainNativeBal();

      const chainProperties = await originChainApi.value.rpc.system.properties();
      const tokenDecimals = chainProperties.tokenDecimals
        .unwrapOrDefault()
        .toArray()
        .map((i) => i.toNumber());

      const decimal = isFromAstar ? ASTAR_DECIMALS : tokenDecimals[0];
      const balance = ethers.utils.formatUnits(rawBalance, decimal).toString();
      originChainNativeBal.value = Number(balance);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIsEnoughMinBal = (amount: number): boolean => {
    const originChainMinBal = selectedToken.value && selectedToken.value.minBridgeAmount;
    return fromAddressBalance.value - amount > (originChainMinBal || 0);
  };

  const checkInputtedAddress = (): boolean => {
    if (!originChainApi.value) return false;
    if (isWithdrawalEthChain.value || isEvmBridge.value) {
      return isValidEvmAddress(inputtedAddress.value);
    } else {
      const isSubstrateAddress = isValidAddressPolkadotAddress(
        inputtedAddress.value,
        SUBSTRATE_SS58_FORMAT
      );
      const ss58Prefix =
        originChainApi.value && Number(originChainApi.value.consts.system.ss58Prefix);
      const prefix = isDeposit.value ? ASTAR_SS58_FORMAT : ss58Prefix;
      const isValidPrefixAddress = isValidAddressPolkadotAddress(inputtedAddress.value, prefix);
      return isSubstrateAddress || isValidPrefixAddress;
    }
  };

  const setErrMsg = (): void => {
    errMsg.value = '';

    const isChainNotSupportWithdrawal = chainsNotSupportWithdrawal.includes(destChain.value.name);
    if (isChainNotSupportWithdrawal) {
      errMsg.value = t('warning.withdrawalNotSupport', { chain: destChain.value.name });
      return;
    }

    if (isLoadingApi.value || !amount.value) {
      return;
    }

    const sendingAmount = Number(amount.value);
    const selectedTokenRef = selectedToken.value;
    const minBridgeAmount = Number(selectedTokenRef && selectedTokenRef.minBridgeAmount);

    if (sendingAmount > fromAddressBalance.value) {
      errMsg.value = t('warning.insufficientBalance');
      return;
    }

    if (sendingAmount && minBridgeAmount > sendingAmount) {
      errMsg.value = t('warning.insufficientBridgeAmount', {
        amount: minBridgeAmount,
        token: selectedTokenRef.metadata.symbol,
      });
      return;
    }

    if (inputtedAddress.value && !checkInputtedAddress()) {
      errMsg.value = t('warning.inputtedInvalidDestAddress');
      return;
    }

    if (isDeposit.value && !checkIsEnoughMinBal(sendingAmount)) {
      errMsg.value = t('warning.insufficientOriginChainBalance', {
        chain: selectedToken.value.originChain,
        amount: selectedToken.value.minBridgeAmount,
        token: selectedToken.value.metadata.symbol,
      });
      return;
    }
  };

  const inputHandler = (event: any): void => {
    amount.value = event.target.value;
  };

  const setIsDisabledBridge = (): void => {
    const isRequiredInputAddress =
      isH160.value || (!isH160.value && isEvmBridge.value) || isInputDestAddrManually.value;
    const isFulfilledAddress =
      !isRequiredInputAddress || (isRequiredInputAddress && inputtedAddress.value);

    isDisabledBridge.value =
      !amount.value || Number(amount.value) === 0 || errMsg.value !== '' || !isFulfilledAddress;
  };

  const getEndpoint = (): string => {
    if (isAstarNativeTransfer.value) {
      const isFromAstar = srcChain.value.name === Astar.name || srcChain.value.name === Shiden.name;
      const chainName = isFromAstar ? destChain.value.name : srcChain.value.name;
      const defaultParachainEndpoint = xcmChainObj[chainName];
      return defaultParachainEndpoint.endpoint as string;
    } else {
      return originChain.value.endpoint || '';
    }
  };

  const connectOriginChain = async (endpoint: string): Promise<void> => {
    try {
      const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
      originChainApi.value = await apiFactory.get(endpoint);
      isLoadingApi.value = false;
    } catch (err) {
      console.error(err);
    }
  };

  const getDestChainBalance = async (address: string): Promise<number> => {
    if (
      !isLoadOriginApi.value ||
      !address ||
      !originChainApi.value ||
      (isEvmBridge.value && !inputtedAddress.value)
    ) {
      return 0;
    }
    if (isDeposit.value) {
      // if: SS58 Deposit
      const isSendToH160 = isValidEvmAddress(address);
      const destAddress = isSendToH160 ? toSS58Address(address) : address;
      if (isAstarNativeTransfer.value) {
        const accountInfo = await $api?.query.system.account<SystemAccount>(address);
        const bal = accountInfo!.data.free || '0';
        const formattedBalance = ethers.utils
          .formatUnits(bal.toString(), decimals.value)
          .toString();
        return Number(formattedBalance);
      } else {
        const { userBalance } = await fetchXcmBalance({
          token: selectedToken.value,
          userAddress: destAddress,
          api: $api!,
        });
        return Number(userBalance);
      }
    } else {
      if (isWithdrawalEthChain.value) {
        if (!isValidEvmAddress(inputtedAddress.value)) return 0;
        const tokenAddress = isAstarNativeTransfer.value
          ? MOONBEAM_ASTAR_TOKEN_ID[selectedToken.value.metadata.symbol as AstarToken]
          : selectedToken.value.mappedERC20Addr;
        const srcChainId = Number(originChainApi.value.consts.system.ss58Prefix);
        const balance = await getTokenBal({
          srcChainId,
          address: inputtedAddress.value,
          tokenAddress,
          tokenSymbol: selectedToken.value.metadata.symbol,
        });
        return Number(balance);
      } else {
        // if: SS58 Withdraw
        const xcmService = container.get<IXcmService>(Symbols.XcmService);
        const bal = await xcmService.getTokenBalance(
          address,
          destChain.value,
          selectedToken.value,
          selectedToken.value.isNativeToken
        );
        return Number(ethers.utils.formatUnits(bal, decimals.value).toString());
      }
    }
  };

  const finalizedCallback = async (hash: string): Promise<void> => {
    addXcmTxHistories({
      hash,
      from: srcChain.value.name,
      to: destChain.value.name,
      symbol: selectedToken.value.metadata.symbol,
      amount: amount.value as string,
      address: currentAccount.value,
    });
    const isMonitorBal = isDeposit.value && !isInputDestAddrManually.value;
    if (isMonitorBal) {
      await monitorBalanceIncreasing({
        api: $api!,
        userAddress: currentAccount.value,
        originTokenData: selectedToken.value,
      });
    }
    router.push(Path.Assets);
  };

  const bridge = async (): Promise<void> => {
    try {
      const isChainNotSupportWithdrawal = chainsNotSupportWithdrawal.includes(destChain.value.name);
      if (isChainNotSupportWithdrawal) {
        throw Error(t('warning.withdrawalNotSupport', { chain: destChain.value.name }));
      }

      const xcmService: IXcmTransfer = isH160.value
        ? container.get<IXcmEvmService>(Symbols.XcmEvmService)
        : container.get<IXcmService>(Symbols.XcmService);

      const recipientAddress = isEvmBridge.value
        ? evmToAddress(inputtedAddress.value, ASTAR_SS58_FORMAT)
        : isInputDestAddrManually.value
        ? inputtedAddress.value
        : currentAccount.value;

      await xcmService.transfer({
        from: srcChain.value,
        to: destChain.value,
        token: selectedToken.value,
        senderAddress: currentAccount.value,
        recipientAddress,
        amount: Number(amount.value),
        finalizedCallback,
      });
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
      showLoading(store.dispatch, false);
    }
  };

  const getFromChainBalance = async (address: string): Promise<number> => {
    if (
      !selectedToken.value ||
      !originChainApi.value ||
      !isTransferPage.value ||
      selectedToken.value.metadata.symbol.toLowerCase() !== tokenSymbol.value
    ) {
      return 0;
    }

    try {
      if (isDeposit.value) {
        const xcmService = container.get<IXcmService>(Symbols.XcmService);
        const fromAddressBalFull = await xcmService.getTokenBalance(
          address,
          srcChain.value,
          selectedToken.value,
          selectedToken.value.isNativeToken
        );

        return Number(ethers.utils.formatUnits(fromAddressBalFull, decimals.value).toString());
      } else {
        // if: Withdraw
        if (isH160.value) {
          const balance = await getTokenBal({
            srcChainId: evmNetworkIdx.value,
            address,
            tokenAddress: selectedToken.value.mappedERC20Addr,
            tokenSymbol: selectedToken.value.metadata.symbol,
          });
          return Number(balance);
        } else {
          if (isAstarNativeTransfer.value) {
            const formattedBalance = ethers.utils
              .formatUnits(
                accountData.value!.getUsableTransactionBalance().toString(),
                decimals.value
              )
              .toString();
            return Number(formattedBalance);
          } else {
            // Memo: Native balance
            return Number(selectedToken.value.userBalance);
          }
        }
      }
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const initializeXcmApi = async (reset = false): Promise<void> => {
    const hasConnectedApi = originChainApi.value && selectedToken.value && reset === false;

    if (!isLoadOriginApi.value || hasConnectedApi || !srcChain.value || !destChain.value) {
      return;
    }

    isLoadingApi.value = true;
    try {
      const endpoint = getEndpoint();
      endpoint && (await connectOriginChain(endpoint));
    } catch (error) {
      console.error(error);
    }
  };

  const updateChain = async (): Promise<void> => {
    if (!isTransferPage.value || !from.value || !to.value) {
      return;
    }
    setSrcChain(xcmChainObj[capitalize(from.value) as keyof typeof xcmChainObj]);
    setDestChain(xcmChainObj[capitalize(to.value) as keyof typeof xcmChainObj]);
    await initializeXcmApi();
  };

  const monitorDestChainBalance = async (inputtedAddress: string): Promise<void> => {
    if (isLoadingApi.value) return;
    let account = '';

    if (inputtedAddress) {
      account = inputtedAddress;
    }
    if (!isInputDestAddrManually.value && currentAccount.value) {
      account = currentAccount.value;
    }
    destAddressBalance.value = account ? await getDestChainBalance(account) : 0;
  };

  const monitorFromChainBalance = async (): Promise<void> => {
    if (isLoadingApi.value || !currentAccount.value) return;
    const result = await getFromChainBalance(currentAccount.value);
    fromAddressBalance.value = result;
  };

  // Memo: Somehow WatchEffect doesn't work for displaying `withdrawalNotSupport` error message on UI
  // (it works if insert -> console.log(errMsg.value))
  watch(
    [destChain, isLoadOriginApi, amount, selectedToken, fromAddressBalance, inputtedAddress],
    setErrMsg
  );
  watchEffect(setIsDisabledBridge);
  watchEffect(updateChain);
  watchEffect(setInputDestAddrManually);
  watch([selectedToken, from], resetStates, { immediate: false });
  watch([isInputDestAddrManually], () => {
    if (!isInputDestAddrManually.value) {
      inputtedAddress.value = '';
    }
  });

  watchEffect(async () => {
    if (isLoadingApi.value) return;
    await setOriginChainNativeBal();
  });
  watchEffect(async () => {
    await monitorFromChainBalance();
  });
  watch(
    [to, isLoadingApi, isInputDestAddrManually, inputtedAddress, currentAccount, selectedToken],
    async () => {
      await monitorDestChainBalance(inputtedAddress.value);
    }
  );

  return {
    amount,
    errMsg,
    srcChain,
    destChain,
    isDisabledBridge,
    isEvmBridge,
    inputtedAddress,
    isH160,
    destAddressBalance,
    fromAddressBalance,
    isDeposit,
    isLoadingApi,
    isAstarNativeTransfer,
    isWithdrawalEthChain,
    isInputDestAddrManually,
    inputHandler,
    bridge,
    initializeXcmApi,
    reverseChain,
    toggleIsInputDestAddrManually,
  };
}
