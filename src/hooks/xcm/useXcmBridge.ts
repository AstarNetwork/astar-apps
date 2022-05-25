import { isValidAddressPolkadotAddress } from './../helper/plasmUtils';
import { evmToAddress } from '@polkadot/util-crypto';
import { ethers } from 'ethers';
import { $web3 } from 'src/boot/api';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { getBalance, isValidEvmAddress } from 'src/config/web3';
import {
  endpointKey as xcmEndpointKey,
  parachainIds,
  PREFIX_ASTAR,
  providerEndpoints as xcmProviderEndpoints,
} from 'src/config/xcmChainEndpoints';
import { useBalance, useCustomSignature, useXcmAssets, useXcmTokenDetails } from 'src/hooks';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { getInjector } from 'src/hooks/helper/wallet';
import { useAccount } from 'src/hooks/useAccount';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import {
  ExistentialDeposit,
  isFromRelayChain,
  Chain,
  XcmChain,
  getChains,
  xcmChains,
} from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, Ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { RelaychainApi } from './SubstrateApi';

const chainPolkadot = xcmChains.find((it) => it.name === Chain.Polkadot) as XcmChain;
const chainAstar = xcmChains.find((it) => it.name === Chain.Astar) as XcmChain;
const chainKusama = xcmChains.find((it) => it.name === Chain.Kusama) as XcmChain;
const chainShiden = xcmChains.find((it) => it.name === Chain.Shiden) as XcmChain;
const initialChains = getChains(endpointKey.ASTAR);

export function useXcmBridge(selectedToken: Ref<ChainAsset>) {
  const chains = ref<XcmChain[]>(initialChains);
  const srcChain = ref<XcmChain>(chainPolkadot);
  const destChain = ref<XcmChain>(chainAstar);
  const destParaId = ref<number>(parachainIds.ASTAR);
  const tokens = ref<ChainAsset[] | null>(null);
  const relayChainNativeBalance = ref<string>('0');
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const isNativeBridge = ref<boolean>(true);
  const existentialDeposit = ref<ExistentialDeposit | null>(null);

  // Format: SS58(withdrawal) or H160(deposit)
  const evmDestAddress = ref<string>('');

  const { t } = useI18n();
  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();
  const { xcmAssets } = useXcmAssets();

  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const isAstar = computed(() => {
    return currentNetworkIdx.value === endpointKey.ASTAR;
  });

  const isDepositToEvm = computed(() => {
    return isFromRelayChain(srcChain.value.name);
  });

  const { handleResult, handleTransactionError } = useCustomSignature({});
  const { balance } = useBalance(currentAccount);
  const { tokenImage, isNativeToken } = useXcmTokenDetails(selectedToken);

  let relayChainApi: RelaychainApi | null = null;

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
    errMsg.value = '';
  };

  const setSrcChain = (chain: XcmChain): void => {
    srcChain.value = chain;
    if (chain.name === destChain.value.name) {
      if (isAstar.value) {
        destChain.value = destChain.value.name === chainAstar.name ? chainPolkadot : chainAstar;
      } else {
        destChain.value = destChain.value.name === chainShiden.name ? chainKusama : chainShiden;
      }
    }
  };

  const setDestChain = (chain: XcmChain): void => {
    destChain.value = chain;
    if (chain.name === srcChain.value.name) {
      if (isAstar.value) {
        srcChain.value = srcChain.value.name === chainAstar.name ? chainPolkadot : chainAstar;
      } else {
        srcChain.value = srcChain.value.name === chainShiden.name ? chainKusama : chainShiden;
      }
    }
  };

  const getRelayChainNativeBal = async (): Promise<string> => {
    if (!currentAccount.value || !srcChain.value || !relayChainApi || isH160.value) {
      return '0';
    }

    const balance = await relayChainApi.getBalance(currentAccount.value);
    return balance.toString();
  };

  const getExistentialDeposit = async () => {
    if (!relayChainApi) return;
    const result = await relayChainApi.getExistentialDeposit();
    existentialDeposit.value = result;
  };

  const inputHandler = (event: any): void => {
    amount.value = event.target.value;
    // check if recipient account has non-zero native asset. (it cannot be transferred to an account with 0 nonce)
    isDisabledBridge.value =
      !amount.value ||
      Number(amount.value) === 0 ||
      Number(amount.value) > Number(formattedRelayChainBalance.value) ||
      balance.value.lten(0);
    errMsg.value = '';
  };

  const formattedRelayChainBalance = computed<string>(() => {
    if (!selectedToken.value) return '0';
    const decimals = Number(String(selectedToken.value.metadata.decimals));
    const balance = ethers.utils.formatUnits(relayChainNativeBalance.value, decimals).toString();
    return balance;
  });

  const toMaxAmount = (): void => {
    amount.value = String(selectedToken.value.userBalance);
  };

  const setIsNativeBridge = (isNative: boolean): void => {
    resetStates();
    isNativeBridge.value = isNative;
  };

  const connectRelaychain = async (): Promise<void> => {
    let endpoint;
    if (currentNetworkIdx.value === endpointKey.ASTAR) {
      endpoint = xcmProviderEndpoints[xcmEndpointKey.POLKADOT].endpoint;
    } else {
      endpoint = xcmProviderEndpoints[xcmEndpointKey.KUSAMA].endpoint;
    }

    try {
      relayChainApi = new RelaychainApi(endpoint);
      await relayChainApi.start();
    } catch (err) {
      console.error(err);
    }
  };

  const updateBridgeConfig = async (): Promise<void> => {
    tokens.value = xcmAssets.value;
    const networkChains = getChains(currentNetworkIdx.value);
    chains.value = networkChains;

    if (isAstar.value) {
      destParaId.value = parachainIds.ASTAR;
      // Memo: withdrawal mode for H160 accounts
      srcChain.value = isH160.value ? chainAstar : chainPolkadot;
      destChain.value = isH160.value ? chainPolkadot : chainAstar;
    } else {
      destParaId.value = parachainIds.SDN;
      srcChain.value = isH160.value ? chainShiden : chainKusama;
      destChain.value = isH160.value ? chainKusama : chainShiden;
    }
  };

  // const setToAddressBalance = async (): Promise<void> => {
  //   const address = toAddress.value;
  //   const srcChainId = evmNetworkIdx.value;
  //   if (!address || !srcChainId) return;
  //   if (isNativeToken.value) {
  //     toAddressBalance.value = await getNativeTokenBalance(address);
  //   }
  //   if (!isNativeToken.value) {
  //     if (isH160.value) {
  //       const balance = await getTokenBal({
  //         srcChainId,
  //         address,
  //         tokenAddress: props.token.address,
  //         tokenSymbol: props.token.symbol,
  //       });
  //       toAddressBalance.value = Number(balance);
  //     }
  //   }
  // };

  const bridge = async (finalizedCallback: () => Promise<void>): Promise<void> => {
    try {
      if (!currentAccount.value) {
        throw Error('Failed loading wallet address');
      }
      if (!srcChain.value || !destChain.value || !selectedToken?.value || !relayChainApi) {
        throw Error('Something went wrong while bridging');
      }
      if (!amount.value) {
        throw Error('Invalid amount');
      }
      // check if recipient account has non-zero native asset. (it cannot be transferred to an account with 0 nonce)
      if (balance.value.eqn(0)) {
        throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
      }

      if (isFromRelayChain(srcChain.value.name)) {
        let recipientAccountId = currentAccount.value;
        const injector = await getInjector(substrateAccounts.value);
        // for H160 address, should mapped ss58 address and public key
        if (!isNativeBridge.value) {
          if (!isValidEvmAddress(evmDestAddress.value)) {
            throw Error('Invalid evm destination address');
          }
          const balWei = await getBalance($web3.value!, evmDestAddress.value);
          if (Number(ethers.utils.formatEther(balWei)) === 0) {
            throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
          }
          const ss58MappedAddr = evmToAddress(evmDestAddress.value, PREFIX_ASTAR);
          const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
          recipientAccountId = hexPublicKey;
        }

        const decimals = Number(selectedToken.value.metadata.decimals);
        const txCall = relayChainApi.transferToParachain(
          destParaId.value,
          recipientAccountId,
          ethers.utils.parseUnits(amount.value, decimals).toString()
        );

        await relayChainApi
          .signAndSend(
            currentAccount.value,
            injector.signer,
            txCall,
            finalizedCallback,
            handleResult
          )
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
        // Todo: Implement the withdrawal logic here
        if (!isNativeBridge.value) {
          if (!isValidAddressPolkadotAddress(evmDestAddress.value)) {
            throw Error('Invalid destination address');
          }
          console.log('Send assets from Parachain(EVM)');
        } else {
          console.log('Send assets from Parachain');
        }
      }
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
    }
  };

  const updateRelayChainTokenBal = async (): Promise<void> => {
    relayChainNativeBalance.value = await getRelayChainNativeBal();
  };

  watchEffect(() => {
    if (isH160.value) {
      isNativeBridge.value = false;
    }
  });

  watchEffect(async () => {
    if (!currentNetworkIdx.value || currentNetworkIdx.value !== null) {
      await connectRelaychain();
    }
  });

  watchEffect(async () => {
    if (!currentNetworkIdx.value || currentNetworkIdx.value !== null || xcmAssets.value !== null) {
      await updateBridgeConfig();
      if (relayChainApi) {
        await relayChainApi.isReady();
        await Promise.all([updateRelayChainTokenBal(), getExistentialDeposit()]);
      }
    }
  });

  const handleUpdate = setInterval(async () => {
    await updateRelayChainTokenBal();
  }, 20 * 1000);

  onUnmounted(() => {
    clearInterval(handleUpdate);
  });

  return {
    amount,
    errMsg,
    srcChain,
    destChain,
    isDisabledBridge,
    tokenImage,
    isNativeToken,
    isNativeBridge,
    evmDestAddress,
    formattedRelayChainBalance,
    existentialDeposit,
    chains,
    isDepositToEvm,
    isH160,
    inputHandler,
    bridge,
    toMaxAmount,
    resetStates,
    setIsNativeBridge,
    updateRelayChainTokenBal,
    setSrcChain,
    setDestChain,
  };
}
