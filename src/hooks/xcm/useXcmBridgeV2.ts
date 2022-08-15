import { evmToAddress } from '@polkadot/util-crypto';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import { getTokenBal, isValidEvmAddress } from 'src/config/web3';
import { SubstrateAccount } from 'src/store/general/state';

import {
  useBalance,
  useCustomSignature,
  useNetworkInfo,
  useTransferRouter,
  useGasPrice,
  useAccount,
} from 'src/hooks';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { getInjector } from 'src/hooks/helper/wallet';
import { showLoading } from 'src/modules/extrinsic/utils';
import {
  Chain,
  checkIsDeposit,
  ExistentialDeposit,
  kusamaParachains,
  monitorBalanceIncreasing,
  parachainIds,
  polkadotParachains,
  PREFIX_ASTAR,
  XcmChain,
  xcmChainObj,
} from 'src/modules/xcm';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { isValidAddressPolkadotAddress } from './../helper/plasmUtils';
import { AcalaApi, MoonbeamApi } from './parachainApi';
import { MOONBEAM_ASTAR_TOKEN_ID } from './parachainApi/MoonbeamApi';
import { AstarApi, AstarToken, ChainApi } from './SubstrateApi';

const { Acala, Astar, Karura, Moonriver, Polkadot, Shiden, Kusama } = xcmChainObj;

export function useXcmBridgeV2(selectedToken: Ref<Asset>) {
  let originChainApi: ChainApi | null = null;
  const srcChain = ref<XcmChain>(Polkadot);
  const destChain = ref<XcmChain>(Astar);
  const destParaId = ref<number>(parachainIds.ASTAR);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const isNativeBridge = ref<boolean>(true);
  const existentialDeposit = ref<ExistentialDeposit | null>(null);
  const { nativeTipPrice } = useGasPrice();
  const { xcmOpponentChain, chainFrom, chainTo, isTransferPage } = useTransferRouter();

  // Format: SS58(withdrawal) or H160(deposit)
  const evmDestAddress = ref<string>('');
  const evmDestAddressBalance = ref<number>(0);
  const fromAddressBalance = ref<number>(0);
  const originChainNativeBal = ref<number>(0);
  const isLoadingApi = ref<boolean>(false);

  const { t } = useI18n();
  const store = useStore();
  const substrateAccounts = computed<SubstrateAccount[]>(
    () => store.getters['general/substrateAccounts']
  );
  const { currentAccount } = useAccount();

  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isDeposit = computed<boolean>(() => checkIsDeposit(srcChain.value.name));
  const isAstar = computed<boolean>(() => currentNetworkIdx.value === endpointKey.ASTAR);

  const isAstarNativeTransfer = computed<boolean>(() => {
    const symbol = selectedToken.value ? selectedToken.value.metadata.symbol : '';
    if (!selectedToken.value) return false;
    return symbol === 'SDN' || symbol === 'ASTR';
  });

  const opponentChain = computed<XcmChain>(() => {
    try {
      return xcmChainObj[xcmOpponentChain.value as keyof typeof xcmChainObj];
    } catch (error) {
      console.error(error);
      return isAstar.value ? Acala : Karura;
    }
  });

  // const chains = computed<XcmChain[]>(() => {
  //   if (isAstarNativeTransfer.value) {
  //     return isAstar.value ? polkadotParachains : kusamaParachains;
  //   } else {
  //     return [astarChain.value, originChain.value];
  //   }
  // });

  const decimals = computed<number>(() =>
    selectedToken.value ? Number(selectedToken.value.metadata.decimals) : 0
  );
  const originChain = computed<XcmChain>(() => {
    return xcmChainObj[selectedToken.value.originChain as Chain];
  });

  const astarChain = computed<XcmChain>(() => {
    const astarChainName =
      currentNetworkIdx.value === endpointKey.ASTAR ? Chain.ASTAR : Chain.SHIDEN;
    return xcmChainObj[astarChainName];
  });

  const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();

  const isLoadOriginApi = computed<boolean>(
    () => !!(selectedToken.value && selectedToken.value.originChain)
  );

  const isMoonbeamWithdrawal = computed<boolean>(() => {
    return destChain.value.name === Chain.MOONRIVER || destChain.value.name === Chain.MOONBEAM;
  });

  const isMoonbeamDeposit = computed<boolean>(() => {
    return srcChain.value.name === Chain.MOONRIVER || srcChain.value.name === Chain.MOONBEAM;
  });

  const { handleResult, handleTransactionError } = useCustomSignature({});
  const { accountData } = useBalance(currentAccount);

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
    errMsg.value = '';
    evmDestAddress.value = '';
    evmDestAddressBalance.value = 0;
  };

  const reverseChain = (): void => {
    const newSrcChain = destChain.value;
    const newDestChain = srcChain.value;
    srcChain.value = newSrcChain;
    destChain.value = newDestChain;
  };

  // Checked
  const setSrcChain = (chain: XcmChain): void => {
    srcChain.value = chain;
    if (chain.name === destChain.value.name) {
      if (isAstar.value) {
        destChain.value = destChain.value.name === Astar.name ? opponentChain.value : Astar;
      } else {
        destChain.value = destChain.value.name === Shiden.name ? opponentChain.value : Shiden;
      }
    }
  };

  // Checked
  const setDestChain = (chain: XcmChain): void => {
    destChain.value = chain;
    if (chain.name === srcChain.value.name) {
      if (isAstar.value) {
        srcChain.value = srcChain.value.name === Astar.name ? opponentChain.value : Astar;
      } else {
        srcChain.value = srcChain.value.name === Shiden.name ? opponentChain.value : Shiden;
      }
    }
  };

  // Memo: to avoid without selecting Astar/SDN e.g.: Karura <-> Moonriver
  const setDestChainToAstar = (): void => {
    if (!destChain.value || !srcChain.value) return;
    const astarChains = [Astar.name, Shiden.name];
    const isAstarDeposit = astarChains.includes(srcChain.value.name);
    const isAstarWithdrawal = astarChains.includes(destChain.value.name);
    const isAstrOrSdn = isAstarDeposit || isAstarWithdrawal;
    if (!isAstrOrSdn) {
      destChain.value = isAstar.value ? Astar : Shiden;
    }
  };

  const getOriginChainNativeBal = async (): Promise<string> => {
    if (!currentAccount.value || !srcChain.value || !originChainApi || isH160.value) {
      return '0';
    }

    const balance = await originChainApi.getNativeBalance(currentAccount.value);
    return balance.toString();
  };

  const getExistentialDeposit = async (): Promise<void> => {
    if (!originChainApi) return;
    await originChainApi.isReady();
    const result = await originChainApi.getExistentialDeposit();
    existentialDeposit.value = result;
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
    const rawBalance = isAstarNativeTransfer.value
      ? accountData.value!.getUsableTransactionBalance().toString()
      : await getOriginChainNativeBal();
    const balance = ethers.utils.formatUnits(rawBalance, decimals.value).toString();
    originChainNativeBal.value = Number(balance);
  };

  const checkIsEnoughEd = async (amount: number): Promise<boolean> => {
    const originChainMinBal =
      destChain.value.name === Kusama.name
        ? existentialDeposit.value?.originChainMinBal
        : existentialDeposit.value?.amount;

    const fetchMoonbeamNativeBal = async (): Promise<number> => {
      const bal = (await originChainApi?.getNativeBalance(evmDestAddress.value)) || '0';
      return Number(ethers.utils.formatEther(bal.toString()));
    };

    const fromOriginChainNativeBal = isMoonbeamWithdrawal.value
      ? await fetchMoonbeamNativeBal()
      : originChainNativeBal.value;

    let originChainNativeBalance = 0;
    if (isH160.value) {
      // Memo: withdraw mode
      const destNativeBal = await originChainApi?.getNativeBalance(evmDestAddress.value);
      const formattedNativeBal = (destNativeBal || '0').toString();
      const nativeTokenDecimals = originChainApi?.chainProperty?.tokenDecimals[0];
      originChainNativeBalance = Number(
        ethers.utils.formatUnits(formattedNativeBal, nativeTokenDecimals)
      );
    } else {
      originChainNativeBalance = fromOriginChainNativeBal;
    }
    const isCountSendingAmount =
      isDeposit.value && selectedToken.value && selectedToken.value.isNativeToken;
    const sendingAmount = isCountSendingAmount ? amount : 0;
    return originChainNativeBalance - sendingAmount > (originChainMinBal || 0);
  };

  const checkIsEvmDestAddress = (): boolean => {
    const isEvmWithdraw = isH160.value && !isDeposit.value;
    if (isEvmWithdraw && !evmDestAddress.value) {
      return true;
    }

    if (isMoonbeamWithdrawal.value) {
      return isValidEvmAddress(evmDestAddress.value);
    } else {
      return isH160.value
        ? isValidAddressPolkadotAddress(evmDestAddress.value)
        : isValidEvmAddress(evmDestAddress.value);
    }
  };

  const setErrMsg = async (): Promise<void> => {
    if (isLoadingApi.value) return;
    errMsg.value = '';
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
    if (isH160.value || !isNativeBridge.value) {
      // if: withdrawal from EVM or Deposit from native to EVM

      if (!evmDestAddress.value) {
        errMsg.value = '';
      }
      if (sendingAmount > fromAddressBalance.value) {
        errMsg.value = t('warning.insufficientBalance');
      } else if (!evmDestAddress.value) {
        return;
      } else if (!checkIsEvmDestAddress()) {
        errMsg.value = t('warning.inputtedInvalidDestAddress');
      } else if (!(await checkIsEnoughEd(sendingAmount))) {
        errMsg.value = t('warning.insufficientExistentialDeposit', {
          network: existentialDeposit.value?.chain,
        });
      }
    } else {
      // if: deposit / withdrawal from native to native

      const isEnoughEd = await checkIsEnoughEd(sendingAmount);
      if (sendingAmount > fromAddressBalance.value) {
        errMsg.value = t('warning.insufficientBalance');
      } else if (!isEnoughEd) {
        errMsg.value = t('warning.insufficientExistentialDeposit', {
          network: existentialDeposit.value?.chain,
        });
      }
    }
  };

  const inputHandler = (event: any): void => {
    amount.value = event.target.value;
  };

  const setIsDisabledBridge = (): void => {
    const isRequiredInputAddress = isH160.value || (!isH160.value && !isNativeBridge.value);
    const isFulfilledAddress =
      !isRequiredInputAddress || (isRequiredInputAddress && evmDestAddress.value);

    // check if recipient account has non-zero native asset. (it cannot be transferred to an account with 0 nonce)
    isDisabledBridge.value =
      !amount.value || Number(amount.value) === 0 || errMsg.value !== '' || !isFulfilledAddress;
  };

  const setIsNativeBridge = (isNative: boolean): void => {
    resetStates();
    isNativeBridge.value = isNative;
  };

  const connectOriginChain = async (): Promise<void> => {
    let endpoint = '';

    if (isAstarNativeTransfer.value) {
      const isFromAstar = srcChain.value.name === Astar.name || srcChain.value.name === Shiden.name;
      const chainName = isFromAstar ? destChain.value.name : srcChain.value.name;
      const defaultParachainEndpoint = xcmChainObj[chainName];
      endpoint = defaultParachainEndpoint.endpoint as string;
    } else {
      endpoint = originChain.value.endpoint!;
    }

    const shouldConnectApi = (chains: string[]): boolean => {
      if (isAstarNativeTransfer.value) {
        return chains.includes(srcChain.value.name) || chains.includes(destChain.value.name);
      } else {
        return chains.includes(originChain.value.name);
      }
    };

    // Todo: add Moonbeam
    const shouldConnectMoonbeam = shouldConnectApi([Moonriver.name]);
    const shouldConnectAcala = shouldConnectApi([Acala.name, Karura.name]);

    try {
      if (shouldConnectMoonbeam) {
        originChainApi = new MoonbeamApi(endpoint);
      } else if (shouldConnectAcala) {
        originChainApi = new AcalaApi(endpoint);
      } else {
        // if: Connect to Relaychain API
        originChainApi = new ChainApi(endpoint);
      }
      await originChainApi.start();
    } catch (err) {
      console.error(err);
    }
  };

  const setDefaultChain = (): void => {
    if (!selectedToken.value) return;
    const astarChain = isAstar.value ? Astar : Shiden;

    // const nativeSourceChain = isAstarNativeTransfer.value // memo: ASTR/SDN
    //   ? defaultNativeTokenTransferChain.value // Karura or Acala
    //   : originChain.value;

    destParaId.value = isAstar.value ? parachainIds.ASTAR : parachainIds.SHIDEN;
    // Memo: H160: withdrawal mode
    srcChain.value = isH160.value ? astarChain : opponentChain.value;
    destChain.value = isH160.value ? originChain.value : astarChain;
  };

  // Memo: update the `balance` displayed on the 'destination wallet address' in 'EVM' tab on the XCM bridge modal
  const setEvmDestAddressBalance = async (): Promise<void> => {
    if (!isLoadOriginApi.value) return;
    const address = evmDestAddress.value;
    if (isH160.value && address) {
      if (!originChainApi) {
        evmDestAddressBalance.value = 0;
        return;
      }
      const balance = await originChainApi.getTokenBalances({
        selectedToken: selectedToken.value,
        address,
        isNativeToken: selectedToken.value.isNativeToken,
      });
      const formattedBalance = ethers.utils
        .formatUnits(balance.toString(), decimals.value)
        .toString();
      evmDestAddressBalance.value = Number(formattedBalance);
    } else {
      // Memo: Deposit to Astar/Shiden EVM or withdraw to Moonbeam/Moonriver
      if (!isValidEvmAddress(address)) {
        evmDestAddressBalance.value = 0;
        return;
      }

      const srcChainId = isMoonbeamWithdrawal.value
        ? originChainApi!.chainProperty!.ss58Prefix!
        : evmNetworkIdx.value;

      const isWithdrawAstrToMoonbeam = isAstarNativeTransfer.value && isMoonbeamWithdrawal.value;
      const tokenAddress = isWithdrawAstrToMoonbeam
        ? MOONBEAM_ASTAR_TOKEN_ID[selectedToken.value.metadata.symbol as AstarToken]
        : selectedToken.value.mappedERC20Addr;

      const balance = await getTokenBal({
        srcChainId,
        address,
        tokenAddress,
        tokenSymbol: selectedToken.value.metadata.symbol,
      });
      evmDestAddressBalance.value = Number(balance);
    }
  };

  const bridge = async (finalizedCallback: () => Promise<void>): Promise<void> => {
    try {
      if (!originChainApi) {
        throw Error('Something went wrong while bridging');
      }
      if (!amount.value) throw Error('Invalid amount');

      if (isDeposit.value) {
        let recipientAccountId = currentAccount.value;
        // for H160 address, should mapped ss58 address and public key
        if (!isNativeBridge.value) {
          if (!isValidEvmAddress(evmDestAddress.value)) {
            throw Error('Invalid evm destination address');
          }
          const ss58MappedAddr = evmToAddress(evmDestAddress.value, PREFIX_ASTAR);
          const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
          recipientAccountId = hexPublicKey;
        }

        if (isMoonbeamDeposit.value) {
          showLoading(store.dispatch, true);
          const hash = await originChainApi.evmTransferToParachain({
            toPara: destParaId.value,
            recipientAccountId: recipientAccountId,
            amount: ethers.utils.parseUnits(amount.value, decimals.value).toString(),
            selectedToken: selectedToken.value,
          });
          if (isNativeBridge.value) {
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
          isDisabledBridge.value = true;
          amount.value = null;
          await finalizedCallback();
          return;
        }

        const injector = await getInjector(substrateAccounts.value);

        const txCall = originChainApi.transferToParachain({
          toPara: destParaId.value,
          recipientAccountId: recipientAccountId,
          amount: ethers.utils.parseUnits(amount.value, decimals.value).toString(),
          selectedToken: selectedToken.value,
        });

        const callBack = async (): Promise<void> => {
          if (isNativeBridge.value) {
            await monitorBalanceIncreasing({
              api: $api!,
              userAddress: currentAccount.value,
              originTokenData: selectedToken.value,
            });
          }
          await finalizedCallback();
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
            isDisabledBridge.value = false;
            return;
          })
          .finally(async () => {
            isDisabledBridge.value = true;
            amount.value = null;
          });
      } else {
        // if: Withdrawal
        let recipientAccountId = isMoonbeamWithdrawal.value
          ? evmDestAddress.value
          : getPubkeyFromSS58Addr(currentAccount.value);
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
            finalizedCallback,
            handleResult,
            tip,
          })
          .catch((error: Error) => {
            handleTransactionError(error);
            isDisabledBridge.value = false;
          })
          .finally(async () => {
            isDisabledBridge.value = true;
            amount.value = null;
          });
      }

      store.dispatch('assets/getAssets', currentAccount.value);
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
      showLoading(store.dispatch, false);
    }
  };

  const updateFromAddressBalance = async (): Promise<void> => {
    if (!selectedToken.value || !originChainApi || isLoadingApi.value) return;

    if (isDeposit.value) {
      const fromAddressBalFull = await originChainApi.getTokenBalances({
        address: currentAccount.value,
        selectedToken: selectedToken.value,
        isNativeToken: selectedToken.value.isNativeToken,
      });

      fromAddressBalance.value = Number(
        ethers.utils.formatUnits(fromAddressBalFull, decimals.value).toString()
      );
    } else {
      const address = currentAccount.value;
      // Memo: Withdraw
      if (isH160.value) {
        // Memo: EVM balance
        const balance = await getTokenBal({
          srcChainId: evmNetworkIdx.value,
          address,
          tokenAddress: selectedToken.value.mappedERC20Addr,
          tokenSymbol: selectedToken.value.metadata.symbol,
        });
        fromAddressBalance.value = Number(balance);
      } else {
        if (isAstarNativeTransfer.value) {
          const formattedBalance = ethers.utils
            .formatUnits(
              accountData.value!.getUsableTransactionBalance().toString(),
              decimals.value
            )
            .toString();
          fromAddressBalance.value = Number(formattedBalance);
        } else {
          // Memo: Native balance
          fromAddressBalance.value = Number(selectedToken.value.userBalance);
        }
      }
    }
  };

  const initializeXcmApi = async (reset = false): Promise<void> => {
    const hasConnectedApi =
      originChainApi &&
      selectedToken.value &&
      originChainApi.chainProperty?.chainName === selectedToken.value.originChain &&
      reset === false;
    if (!isLoadOriginApi.value || hasConnectedApi) return;

    isLoadingApi.value = true;
    try {
      await connectOriginChain();
      await originChainApi?.isReady;
      await getExistentialDeposit();
      isLoadingApi.value = false;
    } catch (error) {
      console.error(error);
    }
  };

  const monitorBalances = async (): Promise<void> => {
    await Promise.all([updateFromAddressBalance(), setOriginChainNativeBal()]);
  };

  watchEffect(async () => {
    await initializeXcmApi();
  });

  watchEffect(setErrMsg);
  watchEffect(setIsDisabledBridge);
  watchEffect(setEvmDestAddressBalance);
  watchEffect(monitorBalances);
  watchEffect(setDestChainToAstar);
  watch([isNativeBridge, isAstar, selectedToken], setDefaultChain, { immediate: true });

  watchEffect(() => {
    // console.log('useXcmBridgeV2');
    // console.log('srcChain', srcChain.value);
    // if (selectedToken.value && isAstarNativeTransfer.value) {
    // isNativeBridge.value = true;
    // }
  });

  const updateChain = (): void => {
    if (!isTransferPage.value) return;
    setSrcChain(xcmChainObj[chainFrom.value]);
    setDestChain(xcmChainObj[chainTo.value]);
  };
  watchEffect(updateChain);

  return {
    amount,
    errMsg,
    srcChain,
    destChain,
    isDisabledBridge,
    isNativeBridge,
    evmDestAddress,
    existentialDeposit,
    isH160,
    evmDestAddressBalance,
    fromAddressBalance,
    isDeposit,
    isLoadingApi,
    isAstarNativeTransfer,
    isMoonbeamWithdrawal,
    isMoonbeamDeposit,
    inputHandler,
    bridge,
    resetStates,
    setIsNativeBridge,
    initializeXcmApi,
    reverseChain,
  };
}
