import { ref, watch, watchEffect, computed, onUnmounted, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/store';
import { isValidEvmAddress, toSS58Address } from 'src/config/web3';
import { useAccount } from 'src/hooks/useAccount';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import {
  endpointKey as xcmEndpointKey,
  providerEndpoints as xcmProviderEndpoints,
  parachainIds,
  PREFIX_ASTAR,
} from 'src/config/xcmChainEndpoints';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { getInjector } from 'src/hooks/helper/wallet';
import BN from 'bn.js';
import { useCustomSignature, useBalance } from 'src/hooks';
import { getEvmMappedSs58Address, getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { evmToAddress } from '@polkadot/util-crypto';
import { RelaychainApi } from './SubstrateApi';
import { useXcmAssets } from 'src/hooks';
import { ethers } from 'ethers';
import { getXcmToken, XcmTokenInformation } from 'src/modules/xcm';
import { $web3 } from 'src/boot/api';
import { getBalance } from 'src/config/web3';

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

  const store = useStore();
  const router = useRouter();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();
  const { xcmAssets } = useXcmAssets();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const { handleResult, handleTransactionError } = useCustomSignature({});
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
        src: 'Polkadot Relay Chain',
        dest: 'Astar Network',
      };
    } else {
      return {
        src: 'Kusama Relay Chain',
        dest: 'Shiden Network',
      };
    }
  });

  // Memo: Relaychain balance
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

  const bridge = async (): Promise<void> => {
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
        throw Error('the balance of recipient account should be above zero');
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
          throw Error('the balance of recipient account should be above zero');
        }
        const ss58MappedAddr = evmToAddress(destEvmAddress.value, PREFIX_ASTAR);
        // console.log('ss58MappedAddr', ss58MappedAddr);
        const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
        // console.log('hexPublicKey', hexPublicKey);
        recipientAccountId = hexPublicKey;
      }

      // console.log('amount', amount.value);
      const decimals = selectedToken.value.metadata.decimals;
      const txCall = await relayChainApi.transferToParachain(
        destParaId.value,
        recipientAccountId,
        new BN(10 ** Number(decimals)).muln(Number(amount.value)) // new BN(10 ** 12).muln(0.01)
      );
      relayChainApi
        .signAndSend(currentAccount.value, injector.signer, txCall, handleResult)
        .catch((error: Error) => {
          handleTransactionError(error);
          isDisabledBridge.value = false;
          return;
        });

      isDisabledBridge.value = true;
      amount.value = null;
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
    }
  };

  const updateSelectedTokenBal = async (): Promise<void> => {
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
      await updateSelectedTokenBal();
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
    await updateSelectedTokenBal();
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
    closeModal,
    openModal,
    inputHandler,
    selectChain,
    selectToken,
    bridge,
    toMaxAmount,
    resetStates,
    setIsNativeBridge,
  };
}
