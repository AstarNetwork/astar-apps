import { evmToAddress } from '@polkadot/util-crypto';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import {
  ASTAR_NATIVE_TOKEN,
  endpointKey,
  getProviderIndex,
  providerEndpoints,
} from 'src/config/chainEndpoints';
import { getTokenBal, isValidEvmAddress } from 'src/config/web3';
import {
  parachainIds,
  PREFIX_ASTAR,
  providerEndpoints as xcmProviderEndpoints,
} from 'src/config/xcmChainEndpoints';
import { useBalance, useCustomSignature } from 'src/hooks';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { getInjector } from 'src/hooks/helper/wallet';
import { useAccount } from 'src/hooks/useAccount';
import { useGasPrice } from 'src/hooks/useGasPrice';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import {
  Chain,
  checkIsFromRelayChain,
  ExistentialDeposit,
  XcmChain,
  xcmChains,
} from 'src/modules/xcm';
import { xcmAstarNativeToken } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { wait } from '../helper/common';
import { isValidAddressPolkadotAddress } from './../helper/plasmUtils';
import { AcalaApi } from './parachainApi/AcalaApi';
import { ParachainApi, RelaychainApi } from './SubstrateApi';

const chainPolkadot = xcmChains.find((it) => it.name === Chain.Polkadot) as XcmChain;
const chainAstar = xcmChains.find((it) => it.name === Chain.Astar) as XcmChain;
const chainShiden = xcmChains.find((it) => it.name === Chain.Shiden) as XcmChain;
const chainKarura = xcmChains.find((it) => it.name === Chain.Karura) as XcmChain;

export function useXcmBridge(selectedToken: Ref<ChainAsset>) {
  let originChainApi: RelaychainApi | null = null;
  const srcChain = ref<XcmChain>(chainPolkadot);
  const destChain = ref<XcmChain>(chainAstar);
  const destParaId = ref<number>(parachainIds.ASTAR);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const isNativeBridge = ref<boolean>(false);
  const existentialDeposit = ref<ExistentialDeposit | null>(null);
  const { nativeTipPrice } = useGasPrice();

  // Format: SS58(withdrawal) or H160(deposit)
  const evmDestAddress = ref<string>('');
  const evmDestAddressBalance = ref<number>(0);
  const fromAddressBalance = ref<number>(0);
  const originChainNativeBal = ref<number>(0);
  const isLoadingApi = ref<boolean>(false);

  const { t } = useI18n();
  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();

  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isDeposit = computed(() => checkIsFromRelayChain(srcChain.value.name));
  const isAstar = computed(() => currentNetworkIdx.value === endpointKey.ASTAR);

  const isAstarNativeTransfer = computed<boolean>(() => {
    const symbol = String(selectedToken.value.metadata.symbol);
    return symbol === 'SDN' || symbol === 'ASTR';
  });

  const chains = computed<XcmChain[]>(() => {
    if (isAstarNativeTransfer.value) {
      return [astarChain.value, chainKarura];
    } else {
      return [astarChain.value, originChain.value];
    }
  });
  const decimals = computed<number>(() => Number(String(selectedToken.value.metadata.decimals)));
  const originChain = computed<XcmChain>(() => {
    return xcmChains.find((it) => it.name === selectedToken.value.originChain)!;
  });

  const astarChain = computed<XcmChain>(() => {
    return xcmChains.find((it) =>
      currentNetworkIdx.value === endpointKey.ASTAR
        ? it.name === Chain.Astar
        : it.name === Chain.Shiden
    )!;
  });

  const currentNetworkIdx = computed<endpointKey>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const evmNetworkIdx = computed<number>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    const networkIdx = getProviderIndex(chain);
    return Number(providerEndpoints[networkIdx].evmChainId);
  });

  const isLoadOriginApi = computed<boolean>(
    () => !!(selectedToken.value && selectedToken.value.originChain)
  );

  const { handleResult, handleTransactionError } = useCustomSignature({});
  const { accountData } = useBalance(currentAccount);

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
    errMsg.value = '';
    evmDestAddress.value = '';
  };

  const setSrcChain = (chain: XcmChain): void => {
    srcChain.value = chain;
    // Todo: refactor to make it more scalable
    const firstParachain = chainKarura;
    const origin = isAstarNativeTransfer.value ? firstParachain : originChain.value;
    if (chain.name === destChain.value.name) {
      if (isAstar.value) {
        destChain.value = destChain.value.name === chainAstar.name ? origin : chainAstar;
      } else {
        destChain.value = destChain.value.name === chainShiden.name ? origin : chainShiden;
      }
    }
  };

  const setDestChain = (chain: XcmChain): void => {
    destChain.value = chain;
    // Todo: refactor to make it more scalable
    const firstParachain = chainKarura;
    const origin = isAstarNativeTransfer.value ? firstParachain : originChain.value;
    if (chain.name === srcChain.value.name) {
      if (isAstar.value) {
        srcChain.value = srcChain.value.name === chainAstar.name ? origin : chainAstar;
      } else {
        srcChain.value = srcChain.value.name === chainShiden.name ? origin : chainShiden;
      }
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
    const originChainMinBal = existentialDeposit.value?.originChainMinBal;
    if (!originChainMinBal) return false;

    if (isDeposit.value) {
      // Memo: ED is no longer required for the deposit transaction
      return true;
    } else {
      // Memo: wait for updating relaychainNativeBalance
      await wait(500);
      const originChainNativeBalance = isH160.value
        ? evmDestAddressBalance.value
        : originChainNativeBal.value;

      return originChainNativeBalance > originChainMinBal;
    }
  };

  const checkIsEvmDestAddress = (): boolean => {
    const isEvmWithdraw = isH160.value && !isDeposit.value;
    if (isEvmWithdraw && !evmDestAddress.value) {
      return true;
    }

    return isH160.value
      ? isValidAddressPolkadotAddress(evmDestAddress.value)
      : isValidEvmAddress(evmDestAddress.value);
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
        token: String(selectedTokenRef.metadata.symbol),
      });
    }
    if (isH160.value || !isNativeBridge.value) {
      // Memo: withdrawal from EVM || Deposit from native to EVM

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
      // Memo: deposit / withdrawal in native to native

      if (Number(amount.value) > fromAddressBalance.value) {
        errMsg.value = t('warning.insufficientBalance');
      } else if (!(await checkIsEnoughEd(Number(amount.value)))) {
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
    const endpoint = xcmProviderEndpoints.find((it) => {
      if (isAstarNativeTransfer.value) {
        const symbol = String(selectedToken.value.metadata.symbol) as ASTAR_NATIVE_TOKEN;
        const defaultParachain = xcmAstarNativeToken[symbol].parachains![0];
        return it.networkAlias.toLowerCase() === defaultParachain.toLowerCase();
      } else {
        return it.networkAlias.toLowerCase() === selectedToken.value.originChain.toLowerCase();
      }
    })?.endpoint as string;

    try {
      if (
        originChain.value.name === 'Karura' ||
        originChain.value.name === 'Acala' ||
        isAstarNativeTransfer.value // Todo: refactor when support other parachains
      ) {
        originChainApi = new AcalaApi(endpoint);
      } else {
        originChainApi = new RelaychainApi(endpoint);
      }
      await originChainApi.start();
    } catch (err) {
      console.error(err);
    }
  };

  const setDefaultChain = (): void => {
    if (!selectedToken.value) return;
    if (isAstar.value) {
      destParaId.value = parachainIds.ASTAR;
      // Memo: withdrawal mode for H160 accounts
      srcChain.value = isH160.value ? chainAstar : originChain.value;
      destChain.value = isH160.value ? originChain.value : chainAstar;
    } else {
      if (isAstarNativeTransfer.value) {
        destParaId.value = parachainIds.SHIDEN;
        srcChain.value = chainKarura;
        destChain.value = chainShiden;
      } else {
        destParaId.value = parachainIds.SHIDEN;
        srcChain.value = isH160.value ? chainShiden : originChain.value;
        destChain.value = isH160.value ? originChain.value : chainShiden;
      }
    }
  };

  // Memo: update the `balance` displayed on the 'destination wallet address' in 'EVM' tab on the XCM bridge modal
  const setEvmDestAddressBalance = async (): Promise<void> => {
    if (!isLoadOriginApi.value) return;
    const address = evmDestAddress.value;

    if (isH160.value) {
      //Memo: Withdraw to Parachain
      if (!isValidAddressPolkadotAddress(address) || !originChainApi) {
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
      // Memo: Deposit to Astar/Shiden EVM
      if (!isValidEvmAddress(address)) {
        evmDestAddressBalance.value = 0;
        return;
      }

      const balance = await getTokenBal({
        srcChainId: evmNetworkIdx.value,
        address,
        tokenAddress: selectedToken.value.mappedERC20Addr,
        tokenSymbol: String(selectedToken.value.metadata.symbol),
      });
      evmDestAddressBalance.value = Number(balance);
    }
  };

  const bridge = async (finalizedCallback: () => Promise<void>): Promise<void> => {
    try {
      if (!currentAccount.value) {
        throw Error('Failed loading wallet address');
      }
      if (!srcChain.value || !destChain.value || !selectedToken?.value || !originChainApi) {
        throw Error('Something went wrong while bridging');
      }
      if (!amount.value) {
        throw Error('Invalid amount');
      }

      if (isDeposit.value) {
        let recipientAccountId = currentAccount.value;
        const injector = await getInjector(substrateAccounts.value);
        // for H160 address, should mapped ss58 address and public key
        if (!isNativeBridge.value) {
          if (!isValidEvmAddress(evmDestAddress.value)) {
            throw Error('Invalid evm destination address');
          }
          const ss58MappedAddr = evmToAddress(evmDestAddress.value, PREFIX_ASTAR);
          const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
          recipientAccountId = hexPublicKey;
        }

        const txCall = originChainApi.transferToParachain({
          toPara: destParaId.value,
          recipientAccountId: recipientAccountId,
          amount: ethers.utils.parseUnits(amount.value, decimals.value).toString(),
          selectedToken: selectedToken.value,
        });

        await originChainApi
          .signAndSend({
            account: currentAccount.value,
            signer: injector.signer,
            tx: txCall,
            finalizedCallback,
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
        // Withdrawal (native parachains -> relaychain)
        let recipientAccountId = getPubkeyFromSS58Addr(currentAccount.value);
        const injector = await getInjector(substrateAccounts.value);
        const parachainApi = new ParachainApi($api!!);

        // Todo: change to transferToOriginChain
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
          tokenSymbol: String(selectedToken.value.metadata.symbol),
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

  const initializeXcmApi = async (): Promise<void> => {
    const hasConnectedApi =
      originChainApi &&
      selectedToken.value &&
      originChainApi.chainProperty?.chainName === selectedToken.value.originChain;
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

  watch([currentNetworkIdx, selectedToken], initializeXcmApi);
  watch([isNativeBridge, isAstar, selectedToken], setDefaultChain);
  watchEffect(setErrMsg);
  watchEffect(setIsDisabledBridge);
  watchEffect(setEvmDestAddressBalance);
  watchEffect(monitorBalances);

  watchEffect(() => {
    if (selectedToken.value && isAstarNativeTransfer.value) {
      isNativeBridge.value = true;
    }
  });

  return {
    amount,
    errMsg,
    srcChain,
    destChain,
    isDisabledBridge,
    isNativeBridge,
    evmDestAddress,
    existentialDeposit,
    chains,
    isH160,
    evmDestAddressBalance,
    fromAddressBalance,
    isDeposit,
    isLoadingApi,
    isAstarNativeTransfer,
    inputHandler,
    bridge,
    resetStates,
    setIsNativeBridge,
    setSrcChain,
    setDestChain,
  };
}
