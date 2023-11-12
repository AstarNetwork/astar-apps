import {
  ASTAR_DECIMALS,
  ASTAR_SS58_FORMAT,
  SUBSTRATE_SS58_FORMAT,
  capitalize,
  isValidAddressPolkadotAddress,
  isValidEvmAddress,
  wait,
} from '@astar-network/astar-sdk-core';
import { ApiPromise } from '@polkadot/api';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import { getTokenBal } from 'src/config/web3';
import {
  astarNativeTokens,
  useAccount,
  useBalance,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
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
import { Chain, XcmChain, chainsNotSupportWithdrawal } from 'src/v2/models/XcmModels';
import { MOONBEAM_ASTAR_TOKEN_ID } from 'src/v2/repositories/implementations/xcm/MoonbeamXcmRepository';
import { Ref, computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { evmToAddress } from '@polkadot/util-crypto';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { castChainName, castXcmEndpoint } from 'src/modules/xcm';
import { Path } from 'src/router';
import { container } from 'src/v2/common';
import { AstarToken } from 'src/v2/config/xcm/XcmRepositoryConfiguration';
import { IApiFactory } from 'src/v2/integration';
import {
  IAccountUnificationService,
  IXcmEvmService,
  IXcmService,
  IXcmTransfer,
} from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { useRouter } from 'vue-router';

const { Acala, Astar, Karura, Polkadot, Shiden } = xcmChainObj;

export function useXcmBridge(selectedToken: Ref<Asset>) {
  const originChainApi = ref<ApiPromise | null>(null);
  const originChainApiEndpoint = ref<string>('');
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
    // Memo: Moonbeam and Moonriver
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
    if (
      !currentAccount.value ||
      !srcChain.value ||
      !originChainApi.value ||
      isH160.value ||
      !originChainApiEndpoint.value
    ) {
      return '0';
    }

    const xcmService = container.get<IXcmService>(Symbols.XcmService);
    const balance = await xcmService.getNativeBalance(
      currentAccount.value,
      srcChain.value,
      originChainApiEndpoint.value
    );
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
    if (!selectedToken.value) return false;
    const originChainMinBal = Number(selectedToken.value.minBridgeAmount);
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

  const setErrMsg = async (): Promise<void> => {
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
      errMsg.value = t('warning.insufficientBalance', {
        token: selectedTokenRef.metadata.symbol,
      });
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

    const isBlankDestAddressToEvm =
      isWithdrawalEthChain.value && sendingAmount && !inputtedAddress.value;
    if (isBlankDestAddressToEvm) {
      errMsg.value = t('warning.blankDestAddress');
      return;
    }

    if (isDeposit.value) {
      if (!checkIsEnoughMinBal(sendingAmount)) {
        errMsg.value = t('warning.insufficientOriginChainBalance', {
          chain: selectedToken.value.originChain,
          amount: selectedToken.value.minBridgeAmount,
          token: selectedToken.value.metadata.symbol,
        });
        return;
      }
      if ((await getOriginChainNativeBal()) === '0') {
        errMsg.value = t('warning.insufficientOriginChainNativeBalance', {
          chain: selectedToken.value.originChain,
        });
      }
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

  const getEndpoints = (): string[] => {
    if (isAstarNativeTransfer.value) {
      const isFromAstar = srcChain.value.name === Astar.name || srcChain.value.name === Shiden.name;
      const chainName = isFromAstar ? destChain.value.name : srcChain.value.name;
      const defaultParachainEndpoint = xcmChainObj[chainName];
      return defaultParachainEndpoint.endpoints;
    } else {
      return originChain.value.endpoints;
    }
  };

  const connectOriginChain = async (endpoint: string): Promise<void> => {
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timed out after 10 seconds'));
      }, 10 * 1000); // 10 seconds
    });

    try {
      // Fixme: stop logging multiple `API-WS: disconnected from wss://xxxxx: 1006:: Abnormal Closure` logs when connection error
      originChainApi.value = (await Promise.race([
        apiFactory.get(endpoint),
        timeoutPromise,
      ])) as ApiPromise;
      isLoadingApi.value = false;
    } catch (error: any) {
      throw Error(error.message);
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
    const accountUnificationService = container.get<IAccountUnificationService>(
      Symbols.AccountUnificationService
    );
    if (isDeposit.value) {
      // if: SS58 Deposit
      const isSendToH160 = isValidEvmAddress(address);
      const destAddress = isSendToH160
        ? await accountUnificationService.getConvertedNativeAddress(address)
        : address;
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
          // Withdraw GLMR or MOVR
          isNativeToken: true,
        });
        return Number(balance);
      } else {
        // if: SS58 Withdraw
        const isValidAddress = isValidAddressPolkadotAddress(address);
        if (!isValidAddress || !originChainApiEndpoint.value) {
          return 0;
        }
        const xcmService = container.get<IXcmService>(Symbols.XcmService);
        const bal = await xcmService.getTokenBalance(
          address,
          destChain.value,
          selectedToken.value,
          selectedToken.value.isNativeToken,
          originChainApiEndpoint.value
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

      const successMessage = t('assets.toast.completedBridgeMessage', {
        symbol: selectedToken.value.metadata.symbol,
        transferAmt: amount.value,
        fromChain: castChainName(srcChain.value.name),
        toChain: castChainName(destChain.value.name),
      });

      const selectedEndpointStored = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT));
      const selectedEndpoint = JSON.parse(selectedEndpointStored);
      const astarEndpoint = selectedEndpoint && Object.values(selectedEndpoint)[0];
      const isAstarChains =
        srcChain.value.name.toLowerCase().includes('astar') ||
        srcChain.value.name.toLowerCase().includes('shiden');
      const endpoint = isAstarChains ? astarEndpoint : originChainApiEndpoint.value;

      await xcmService.transfer({
        from: srcChain.value,
        to: destChain.value,
        token: selectedToken.value,
        senderAddress: currentAccount.value,
        recipientAddress,
        amount: Number(amount.value),
        finalizedCallback,
        successMessage,
        endpoint,
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
      !originChainApiEndpoint.value ||
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
          selectedToken.value.isNativeToken,
          originChainApiEndpoint.value
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

  const checkHasConnectedApi = async (): Promise<boolean> => {
    try {
      const apiChainName = String(await originChainApi.value?.rpc.system.chain()).toLowerCase();
      const isConnected =
        apiChainName === srcChain.value.name.toLowerCase() ||
        apiChainName === destChain.value.name.toLowerCase();
      return !!(originChainApi.value && selectedToken.value && apiChainName && isConnected);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const initializeXcmApi = async (reset = false): Promise<void> => {
    const hasConnectedApi = await checkHasConnectedApi();

    if (!isLoadOriginApi.value || hasConnectedApi || !srcChain.value || !destChain.value) {
      return;
    }

    isLoadingApi.value = true;
    const endpoints = getEndpoints();
    for (let index = 0; index < endpoints.length; index++) {
      const endpoint = castXcmEndpoint(endpoints[index]);
      try {
        await connectOriginChain(endpoint);
        originChainApiEndpoint.value = endpoint;
        console.info('Connected to', originChainApiEndpoint.value);
        break;
      } catch (error) {
        console.info('Failed connecting to', endpoint);
        console.error(error);
      }
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

  // Memo: to avoid using previous endpoint to fetch destChainBalance and it causes a bug (ex: acala -> statemint)
  const balMonitorDelay = 500;

  watch(
    [isLoadingApi, currentAccount, selectedToken, srcChain, originChainApiEndpoint],
    async () => {
      // Memo: to display the balance with the same timing as destination balance
      await wait(balMonitorDelay);
      await monitorFromChainBalance();
    }
  );

  watch(
    [
      isLoadingApi,
      currentAccount,
      selectedToken,
      destChain,
      originChainApiEndpoint,
      inputtedAddress,
    ],
    async () => {
      await wait(balMonitorDelay);
      await monitorDestChainBalance(inputtedAddress.value);
    },
    { immediate: true }
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
