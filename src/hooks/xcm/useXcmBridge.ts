import { evmToAddress } from '@polkadot/util-crypto';
import { ISubmittableResult } from '@polkadot/types/types';
import { ethers } from 'ethers';
import BN from 'bn.js';
import { $web3 } from 'src/boot/api';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { getBalance, isValidEvmAddress } from 'src/config/web3';
import {
  endpointKey as xcmEndpointKey,
  parachainIds,
  PREFIX_ASTAR,
  providerEndpoints as xcmProviderEndpoints,
} from 'src/config/xcmChainEndpoints';
import { useBalance, useCustomSignature, useXcmAssets } from 'src/hooks';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { getInjector } from 'src/hooks/helper/wallet';
import { useAccount } from 'src/hooks/useAccount';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { ExistentialDeposit, getXcmToken, XcmTokenInformation } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, Ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { RelaychainApi } from './SubstrateApi';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { toSS58Address } from 'src/config/web3';
import { signAndSend } from './../helper/wallet';
import { $api } from 'boot/api';
import { useI18n } from 'vue-i18n';

export interface Chain {
  id: number;
  name: string;
}

const CHAINS = [
  {
    id: 1,
    name: 'DOT',
  },
  {
    id: 2,
    name: 'Kusama',
  },
  {
    id: 3,
    name: 'Astar',
  },
  {
    id: 4,
    name: 'Shiden',
  },
];

export const formatDecimals = ({ amount, decimals }: { amount: string; decimals: number }) => {
  return Number(Number(amount).toFixed(decimals));
};

export function useXcmBridge(selectedToken?: Ref<ChainAsset>) {
  // Todo: remove unused states

  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);

  const srcChain = ref<Chain | null>(null);
  const destChain = ref<Chain | null>(null);
  const destParaId = ref<number>(parachainIds.SDN);
  const tokens = ref<ChainAsset[] | null>(null);
  const selectedTokenBalance = ref<string>('0');
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const isNativeBridge = ref<boolean>(true);
  const destEvmAddress = ref<string>('');
  const existentialDeposit = ref<ExistentialDeposit | null>(null);

  const { t } = useI18n();
  const store = useStore();
  const router = useRouter();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();
  const { xcmAssets, handleUpdateTokenBalances } = useXcmAssets();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const { handleResult, handleTransactionError, handleCustomExtrinsic } = useCustomSignature({});
  const { balance } = useBalance(currentAccount);
  let relayChainApi: RelaychainApi | null = null;

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
    errMsg.value = '';
  };

  const closeModal = (): boolean => modal.value === null;

  const openModal = (scene: 'src' | 'dest' | 'token'): void => {
    modal.value = scene;
  };

  const selectToken = (token: ChainAsset): void => {
    store.commit('xcm/setSelectedToken', token);
    modal.value = null;
    resetStates();
  };

  const getSelectedTokenBal = async (): Promise<string> => {
    if (!currentAccount.value || !srcChain.value || !relayChainApi) {
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

  const selectChain = (chainId: number): void => {
    const isSrcChain = modal.value === 'src';
    const chain = CHAINS.find((it) => it.id === chainId);
    if (!chain) return;

    if (isSrcChain) {
      srcChain.value = chain;
    } else {
      destChain.value = chain;
    }
    modal.value = null;
    resetStates();
  };

  const chainIcon = computed<{ src: string; dest: string }>(() => {
    if (currentNetworkIdx.value === endpointKey.ASTAR) {
      return {
        src: require('/src/assets/img/ic_polkadot.png'),
        dest: require('/src/assets/img/ic_astar.png'),
      };
    } else {
      return {
        src: require('/src/assets/img/ic_kusama.png'),
        dest: require('/src/assets/img/ic_shiden.png'),
      };
    }
  });

  const chainName = computed<{ src: string; dest: string }>(() => {
    if (currentNetworkIdx.value === endpointKey.ASTAR) {
      return {
        src: 'Polkadot',
        dest: 'Astar Network',
      };
    } else {
      return {
        src: 'Kusama',
        dest: 'Shiden Network',
      };
    }
  });

  const formattedRelayChainBalance = computed<string>(() => {
    if (!selectedToken || !selectedToken.value) return '0';
    const decimals = Number(String(selectedToken.value.metadata.decimals));
    const balance = ethers.utils.formatUnits(selectedTokenBalance.value, decimals).toString();
    return balance;
  });

  const tokenDetails = computed<XcmTokenInformation | undefined>(() => {
    if (!selectedToken || !selectedToken.value) {
      return undefined;
    }
    const t = getXcmToken({
      symbol: String(selectedToken.value.metadata.symbol),
      currentNetworkIdx: currentNetworkIdx.value,
    });
    return t;
  });

  const tokenImage = computed<string>(() => {
    if (!tokenDetails || !tokenDetails.value) {
      return require('/src/assets/img/ic_coin-placeholder.png');
    }
    return tokenDetails.value.logo;
  });

  const isNativeToken = computed<boolean>(() => {
    if (!tokenDetails || !tokenDetails.value) {
      return false;
    }
    return tokenDetails.value.isNativeToken;
  });

  const isDisplayToken = computed<boolean>(() => {
    // Todo: fetch the balance in relaychain
    const isDisplay =
      Number(selectedToken?.value.userBalance) > 0 || tokenDetails.value?.isXcmCompatible;
    return isDisplay || false;
  });

  const isXcmCompatible = computed<boolean>(() => {
    if (!tokenDetails.value) return false;
    return tokenDetails.value.isXcmCompatible;
  });

  const toMaxAmount = (): void => {
    amount.value = String(selectedToken?.value.userBalance);
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

    if (currentNetworkIdx.value === endpointKey.ASTAR) {
      srcChains.value = [
        {
          id: 1,
          name: 'Polkadot',
        },
      ];
      destChains.value = [
        {
          id: 3,
          name: 'Astar',
        },
      ];
      destParaId.value = parachainIds.ASTAR;
    } else {
      srcChains.value = [
        {
          id: 2,
          name: 'Kusama',
        },
      ];
      destChains.value = [
        {
          id: 4,
          name: 'Shiden',
        },
      ];
      destParaId.value = parachainIds.SDN;
    }

    srcChain.value = srcChains.value[0];
    destChain.value = destChains.value[0];
    tokens.value && store.commit('xcm/setSelectedToken', tokens.value[0]);
  };

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

      let recipientAccountId = currentAccount.value;
      const injector = await getInjector(substrateAccounts.value);
      // for H160 address, should mapped ss58 address and public key
      if (!isNativeBridge.value) {
        if (!isValidEvmAddress(destEvmAddress.value)) {
          throw Error('Invalid evm destination address');
        }
        const balWei = await getBalance($web3.value!, destEvmAddress.value);
        if (Number(ethers.utils.formatEther(balWei)) === 0) {
          throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
        }
        const ss58MappedAddr = evmToAddress(destEvmAddress.value, PREFIX_ASTAR);
        // console.log('ss58MappedAddr', ss58MappedAddr);
        const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
        // console.log('hexPublicKey', hexPublicKey);
        recipientAccountId = hexPublicKey;
      }
      const decimals = Number(selectedToken.value.metadata.decimals);
      const txCall = await relayChainApi.transferToParachain(
        destParaId.value,
        recipientAccountId,
        ethers.utils.parseUnits(amount.value, decimals).toString()
      );
      relayChainApi
        .signAndSend(currentAccount.value, injector.signer, txCall, finalizedCallback, handleResult)
        .catch((error: Error) => {
          handleTransactionError(error);
          isDisabledBridge.value = false;
          return;
        })
        .finally(async () => {
          isDisabledBridge.value = true;
          amount.value = null;
        });
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
    }
  };

  const transferAsset = async (transferAmt: number, toAddress: string): Promise<void> => {
    try {
      if (!selectedToken?.value) {
        throw Error('Token is not selected');
      }

      const isValidSS58Address =
        isValidAddressPolkadotAddress(currentAccount.value) &&
        isValidAddressPolkadotAddress(toAddress);

      if (!isValidSS58Address && !isValidEvmAddress(toAddress)) {
        store.dispatch('general/showAlertMsg', {
          msg: 'assets.invalidAddress',
          alertType: 'error',
        });
        return;
      }

      // check if recipient account has non-zero native asset. (it cannot be transferred to an account with 0 nonce)
      if (isValidEvmAddress(toAddress)) {
        const balWei = await getBalance($web3.value!, toAddress);
        if (Number(ethers.utils.formatEther(balWei)) === 0) {
          throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
        }
      } else {
        const balData = ((await $api!.query.system.account(toAddress)) as any).data;
        if (balData.free.toBn().eqn(0)) {
          throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
        }
      }

      const receivingAddress = isValidEvmAddress(toAddress) ? toSS58Address(toAddress) : toAddress;

      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        const res = await handleResult(result);
        await handleUpdateTokenBalances();
        return res;
      };

      const decimals = Number(selectedToken.value.metadata.decimals);
      const amount = ethers.utils.parseUnits(String(transferAmt), decimals).toString();
      const transaction = $api!.tx.assets.transfer(
        new BN(selectedToken.value.id),
        receivingAddress,
        amount
      );

      await signAndSend({
        transaction,
        senderAddress: currentAccount.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: false, // isEthWallet.value - ATM we can't send assets from EVM account,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
      });
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message || 'Something went wrong during asset transfer.',
        alertType: 'error',
      });
    }
  };

  const updateRelayChainTokenBal = async (): Promise<void> => {
    selectedTokenBalance.value = await getSelectedTokenBal();
  };

  const setTokenByQueyParams = (): void => {
    if (!tokens.value) return;
    const query = router.currentRoute.value.query;
    if (query.symbol) {
      const token = tokens.value?.find((it) => it.metadata.symbol.toString() === query.symbol);
      token && store.commit('xcm/setSelectedToken', token);
    }
  };

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

  watch(
    [tokens],
    () => {
      setTokenByQueyParams();
    },
    { immediate: false }
  );

  const handleUpdate = setInterval(async () => {
    await updateRelayChainTokenBal();
  }, 20 * 1000);

  onUnmounted(() => {
    clearInterval(handleUpdate);
  });

  return {
    amount,
    srcChain,
    destChain,
    srcChains,
    destChains,
    modal,
    tokens,
    errMsg,
    selectedTokenBalance,
    chainIcon,
    chainName,
    isDisabledBridge,
    tokenImage,
    isNativeToken,
    tokenDetails,
    isDisplayToken,
    isXcmCompatible,
    isNativeBridge,
    destEvmAddress,
    formattedRelayChainBalance,
    existentialDeposit,
    closeModal,
    openModal,
    inputHandler,
    selectChain,
    selectToken,
    bridge,
    toMaxAmount,
    resetStates,
    setIsNativeBridge,
    transferAsset,
    updateRelayChainTokenBal,
  };
}
