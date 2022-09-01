import { evmToAddress } from '@polkadot/util-crypto';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import { getTokenBal, isValidEvmAddress, toSS58Address } from 'src/config/web3';
import { ASTAR_SS58_FORMAT } from 'src/hooks/helper/plasmUtils';
import { SystemAccount } from 'src/modules/account';
import { SubstrateAccount } from 'src/store/general/state';
import { capitalize } from './../helper/common';

import {
  astarNativeTokens,
  useAccount,
  useBalance,
  useCustomSignature,
  useGasPrice,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { getInjector } from 'src/hooks/helper/wallet';
import { showLoading } from 'src/modules/extrinsic/utils';
import {
  Chain,
  checkIsDeposit,
  fetchXcmBalance,
  monitorBalanceIncreasing,
  parachainIds,
  XcmChain,
  xcmChainObj,
} from 'src/modules/xcm';
import { useStore } from 'src/store';
import { wait } from 'src/v2/common';
import { Asset } from 'src/v2/models';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ASTAR_DECIMALS,
  isValidAddressPolkadotAddress,
  SUBSTRATE_SS58_FORMAT,
} from './../helper/plasmUtils';
import { AcalaApi, MoonbeamApi } from './parachainApi';
import { MOONBEAM_ASTAR_TOKEN_ID } from './parachainApi/MoonbeamApi';
import { AstarApi, AstarToken, ChainApi } from './SubstrateApi';
import { addXcmTxHistories } from 'src/modules/xcm/utils';

const { Acala, Astar, Karura, Moonriver, Polkadot, Shiden, Kusama } = xcmChainObj;

export function useXcmBridgeV2(selectedToken: Ref<Asset>) {
  let originChainApi: ChainApi | null = null;
  const srcChain = ref<XcmChain>(Polkadot);
  const destChain = ref<XcmChain>(Astar);
  const destParaId = ref<number>(parachainIds.ASTAR);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const isInputDestAddrManually = ref<boolean>(false);
  const inputtedAddress = ref<string>('');
  const destAddressBalance = ref<number>(0);
  const fromAddressBalance = ref<number>(0);
  const originChainNativeBal = ref<number>(0);
  const isLoadingApi = ref<boolean>(true);

  const { nativeTipPrice } = useGasPrice();
  const { xcmOpponentChain, from, to, isEvmBridge, isTransferPage, reverseChain, tokenSymbol } =
    useTransferRouter();
  const { t } = useI18n();
  const store = useStore();
  const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();
  const { currentAccount } = useAccount();
  const substrateAccounts = computed<SubstrateAccount[]>(
    () => store.getters['general/substrateAccounts']
  );

  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isDeposit = computed<boolean>(() => checkIsDeposit(srcChain.value.name));
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
  const originChain = computed<XcmChain>(() => {
    return xcmChainObj[selectedToken.value.originChain as Chain];
  });

  const isLoadOriginApi = computed<boolean>(
    () => !!(selectedToken.value && selectedToken.value.originChain)
  );

  // Todo: refactoring
  const isMoonbeamWithdrawal = computed<boolean>(() => {
    return destChain.value.name === Chain.MOONRIVER;
  });

  // Todo: refactoring
  const isMoonbeamDeposit = computed<boolean>(() => {
    if (!srcChain.value) return false;
    return srcChain.value.name === Chain.MOONRIVER;
  });

  const { handleResult, handleTransactionError } = useCustomSignature({});
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
    if (!currentAccount.value || !srcChain.value || !originChainApi || isH160.value) {
      return '0';
    }

    const balance = await originChainApi.getNativeBalance(currentAccount.value);
    return balance.toString();
  };

  const setOriginChainNativeBal = async (): Promise<void> => {
    if (
      !originChainApi ||
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
      const decimal = isFromAstar ? ASTAR_DECIMALS : originChainApi.chainProperty?.tokenDecimals[0];
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
    if (isMoonbeamWithdrawal.value || isEvmBridge.value) {
      return isValidEvmAddress(inputtedAddress.value);
    } else {
      const isSubstrateAddress = isValidAddressPolkadotAddress(
        inputtedAddress.value,
        SUBSTRATE_SS58_FORMAT
      );
      const prefix = isDeposit.value
        ? ASTAR_SS58_FORMAT
        : originChainApi?.chainProperty?.ss58Prefix;
      const isValidPrefixAddress = isValidAddressPolkadotAddress(inputtedAddress.value, prefix);
      return isSubstrateAddress || isValidPrefixAddress;
    }
  };

  const setErrMsg = async (): Promise<void> => {
    errMsg.value = '';
    if (isLoadingApi.value || !amount.value) {
      return;
    }
    const sendingAmount = Number(amount.value);
    const selectedTokenRef = selectedToken.value;
    const minBridgeAmount = Number(selectedTokenRef && selectedTokenRef.minBridgeAmount);

    if (sendingAmount > fromAddressBalance.value) {
      errMsg.value = t('warning.insufficientBalance');
    }

    if (sendingAmount && minBridgeAmount > sendingAmount) {
      errMsg.value = t('warning.insufficientBridgeAmount', {
        amount: minBridgeAmount,
        token: selectedTokenRef.metadata.symbol,
      });
    }

    if (inputtedAddress.value && !checkInputtedAddress()) {
      errMsg.value = t('warning.inputtedInvalidDestAddress');
    }

    if (isDeposit.value && !checkIsEnoughMinBal(sendingAmount)) {
      errMsg.value = t('warning.insufficientOriginChainBalance', {
        chain: selectedToken.value.originChain,
        amount: selectedToken.value.minBridgeAmount,
        token: selectedToken.value.metadata.symbol,
      });
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
    const shouldConnectApi = (chains: string[]): boolean => {
      if (isAstarNativeTransfer.value) {
        return chains.includes(srcChain.value.name) || chains.includes(destChain.value.name);
      } else {
        return chains.includes(originChain.value.name);
      }
    };

    const shouldConnectMoonbeam = shouldConnectApi([Moonriver.name]);
    const shouldConnectAcala = shouldConnectApi([Acala.name, Karura.name]);

    try {
      if (!endpoint) return;
      if (shouldConnectMoonbeam) {
        originChainApi = new MoonbeamApi(endpoint);
      } else if (shouldConnectAcala) {
        originChainApi = new AcalaApi(endpoint);
      } else {
        // if: Connect to Relaychain API
        originChainApi = new ChainApi(endpoint);
      }
      await originChainApi.start();
      await originChainApi.isReady;
      isLoadingApi.value = false;
    } catch (err) {
      console.error(err);
    }
  };

  const setDefaultChain = (): void => {
    if (!selectedToken.value) return;
    const astarChain = isAstar.value ? Astar : Shiden;
    destParaId.value = isAstar.value ? parachainIds.ASTAR : parachainIds.SHIDEN;
    // Memo: H160: withdrawal mode
    srcChain.value = isH160.value ? astarChain : opponentChain.value;
    destChain.value = isH160.value ? originChain.value : astarChain;
  };

  const getDestChainBalance = async (address: string): Promise<number> => {
    if (!isLoadOriginApi.value || !address || !originChainApi) return 0;
    if (isH160.value) {
      const balance = await originChainApi.getTokenBalances({
        selectedToken: selectedToken.value,
        address,
        isNativeToken: selectedToken.value.isNativeToken,
      });
      const formattedBalance = ethers.utils
        .formatUnits(balance.toString(), decimals.value)
        .toString();
      return Number(formattedBalance);
    } else {
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
        if (isMoonbeamWithdrawal.value) {
          if (!isValidEvmAddress(inputtedAddress.value)) return 0;
          const tokenAddress = isAstarNativeTransfer.value
            ? MOONBEAM_ASTAR_TOKEN_ID[selectedToken.value.metadata.symbol as AstarToken]
            : selectedToken.value.mappedERC20Addr;
          const balance = await getTokenBal({
            srcChainId: originChainApi!.chainProperty!.ss58Prefix!,
            address: inputtedAddress.value,
            tokenAddress,
            tokenSymbol: selectedToken.value.metadata.symbol,
          });
          return Number(balance);
        } else {
          // if: SS58 Withdraw
          const bal = await originChainApi.getTokenBalances({
            address,
            selectedToken: selectedToken.value,
            isNativeToken: selectedToken.value.isNativeToken,
          });
          return Number(ethers.utils.formatUnits(bal, decimals.value).toString());
        }
      }
    }
  };

  const depositFromMoonbeam = async ({
    recipientAccountId,
    handleFinalizedCallback,
  }: {
    recipientAccountId: string;
    handleFinalizedCallback: (hash: string) => Promise<void>;
  }): Promise<void> => {
    if (!amount.value || !originChainApi) throw Error('Something went wrong');
    showLoading(store.dispatch, true);
    const hash = await originChainApi.evmTransferToParachain({
      toPara: destParaId.value,
      recipientAccountId,
      amount: ethers.utils.parseUnits(amount.value, decimals.value).toString(),
      selectedToken: selectedToken.value,
    });
    if (!isEvmBridge.value) {
      await monitorBalanceIncreasing({
        api: $api!,
        userAddress: currentAccount.value,
        originTokenData: selectedToken.value,
      });
    }
    const msg = t('toast.completedHash', { hash });
    store.dispatch('general/showAlertMsg', {
      msg,
      alertType: 'success',
    });
    showLoading(store.dispatch, false);
    await handleFinalizedCallback(hash);
  };

  const bridge = async (finalizedCallback: () => Promise<void>): Promise<void> => {
    try {
      if (!originChainApi) throw Error('Something went wrong while bridging');
      if (!amount.value) throw Error('Invalid amount');

      const handleFinalizedCallback = async (hash: string) => {
        addXcmTxHistories({
          hash,
          from: srcChain.value.name,
          to: destChain.value.name,
          symbol: selectedToken.value.metadata.symbol,
          amount: amount.value as string,
          address: currentAccount.value,
        });
        await finalizedCallback();
      };
      const destinationAddress = isInputDestAddrManually.value
        ? inputtedAddress.value
        : currentAccount.value;

      if (isDeposit.value) {
        let recipientAccountId = destinationAddress;
        if (isEvmBridge.value) {
          const ss58MappedAddr = evmToAddress(inputtedAddress.value, ASTAR_SS58_FORMAT);
          const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
          recipientAccountId = hexPublicKey;
        }
        if (isMoonbeamDeposit.value) {
          await depositFromMoonbeam({ recipientAccountId, handleFinalizedCallback });
          return;
        }

        const injector = await getInjector(substrateAccounts.value);
        const txCall = originChainApi.transferToParachain({
          toPara: destParaId.value,
          recipientAccountId: recipientAccountId,
          amount: ethers.utils.parseUnits(amount.value, decimals.value).toString(),
          selectedToken: selectedToken.value,
        });

        const callBack = async (hash: string): Promise<void> => {
          if (!isEvmBridge.value) {
            await monitorBalanceIncreasing({
              api: $api!,
              userAddress: currentAccount.value,
              originTokenData: selectedToken.value,
            });
          }
          await handleFinalizedCallback(hash);
        };

        await originChainApi
          .signAndSend({
            account: currentAccount.value,
            signer: injector.signer,
            tx: txCall,
            finalizedCallback: callBack,
            handleResult,
            tip: '1',
          })
          .catch((error: Error) => {
            handleTransactionError(error);
            return;
          });
      } else {
        // if: Withdrawal
        const recipientAccountId = isMoonbeamWithdrawal.value
          ? inputtedAddress.value
          : getPubkeyFromSS58Addr(destinationAddress);
        const injector = await getInjector(substrateAccounts.value);
        const parachainApi = new AstarApi($api!!);

        const txCall = await parachainApi.transferToOriginChain({
          assetId: selectedToken.value.id,
          recipientAccountId,
          amount: ethers.utils.parseUnits(amount.value, decimals.value).toString(),
          isNativeToken: selectedToken.value.isNativeToken,
          paraId: destChain.value.parachainId,
        });

        const tip = ethers.utils.parseEther(nativeTipPrice.value.fast).toString();
        await parachainApi
          .signAndSend({
            account: currentAccount.value,
            signer: injector.signer,
            tx: txCall,
            finalizedCallback: handleFinalizedCallback,
            handleResult,
            tip,
          })
          .catch((error: Error) => {
            handleTransactionError(error);
          });
      }
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
    if (!selectedToken.value || !originChainApi || !isTransferPage.value) {
      return 0;
    }

    try {
      if (isDeposit.value) {
        const fromAddressBalFull = await originChainApi.getTokenBalances({
          address,
          selectedToken: selectedToken.value,
          isNativeToken: selectedToken.value.isNativeToken,
        });

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
    const hasConnectedApi =
      originChainApi &&
      selectedToken.value &&
      originChainApi.chainProperty?.chainName.toLowerCase() === from.value &&
      reset === false;

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

  watchEffect(setErrMsg);
  watchEffect(setIsDisabledBridge);
  watchEffect(updateChain);
  watch([isEvmBridge, isAstar, selectedToken], setDefaultChain, { immediate: true });
  watch([selectedToken, from], resetStates, { immediate: false });
  watch([isInputDestAddrManually], () => {
    inputtedAddress.value = '';
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
      // Memo: 'wait' for just make the 'balance UI' changing values smoothly whenever users click the reverse button
      await wait(100);
      await monitorDestChainBalance(inputtedAddress.value);
    }
  );
  watchEffect(() => {
    if (isH160.value) {
      isInputDestAddrManually.value = true;
    }
  });

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
    isMoonbeamWithdrawal,
    isMoonbeamDeposit,
    isInputDestAddrManually,
    inputHandler,
    bridge,
    resetStates,
    initializeXcmApi,
    reverseChain,
    toggleIsInputDestAddrManually,
  };
}
