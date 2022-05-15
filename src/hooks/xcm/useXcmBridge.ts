import { ref, watch, watchEffect, computed, onUnmounted, Ref } from 'vue';
import { wait } from 'src/hooks/helper/common';
import { useRouter } from 'vue-router';
import { useStore } from 'src/store';
import { useAccount } from 'src/hooks/useAccount';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import {
  endpointKey as xcmEndpointKey,
  providerEndpoints as xcmProviderEndpoints,
  parachainIds,
  PREFIX_ASTAR,
} from 'src/config/xcmChainEndpoints';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import Web3 from 'web3';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { getInjector } from 'src/hooks/helper/wallet';
import { setupNetwork } from 'src/config/web3';
import { transferToParachain } from './utils';
import BN from 'bn.js';
import { useCustomSignature } from 'src/hooks';
import { getEvmMappedSs58Address, getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { evmToAddress } from '@polkadot/util-crypto';
import { RelaychainApi } from './SubstrateApi';
import { useXcmAssets } from 'src/hooks';
import { ethers } from 'ethers';
import { from } from 'rxjs';
import { getXcmToken, XcmTokenInformation } from 'src/modules/xcm';

// MEMO: temporary use :: will change to ChainAsset.
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
  // const selectedNetwork = ref<number>(0);
  const tokens = ref<ChainAsset[] | null>(null);
  // const tokensObj = ref<any | null>(null);
  const selectedTokenBalance = ref<string>('0');
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);

  const store = useStore();
  const router = useRouter();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();
  const { xcmAssets } = useXcmAssets();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  // const selectedToken = computed(() => store.getters['xcm/selectedToken']);
  const { handleResult, handleTransactionError } = useCustomSignature({});
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

    //// TODO - convert it to proper unit
    // const balance = await relayChainApi.getBalance(currentAccount.value);
    // return balance.toString();
    return '0';
  };

  const inputHandler = (event: any): void => {
    amount.value = event.target.value;
    isDisabledBridge.value = true;
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
        // src: 'Kusama',
        // dest: 'Shiden',
        src: 'Kusama Relay Chain',
        dest: 'Shiden Network',
      };
    }
  });

  const formattedSelectedTokenBalance = computed<string>(() => {
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
    const isDisplay =
      Number(formattedSelectedTokenBalance.value) > 0 || tokenDetails.value?.isXcmCompatible;
    if (isDisplay) {
      return true;
    } else {
      return false;
    }
  });

  const isXcmCompatible = computed<boolean>(() => {
    if (!tokenDetails.value) return false;
    return tokenDetails.value.isXcmCompatible;
  });

  const toMaxAmount = (): void => {
    amount.value = formattedSelectedTokenBalance.value;
  };

  const updateBridgeConfig = async (): Promise<void> => {
    const query = router.currentRoute.value.query;
    // TODO : need to bind with query for specific token
    // TODO : add token list by fetching assets
    //const tokens = data && data.tokens;
    tokens.value = xcmAssets.value;

    // MEMO : Temporary: it should be replaced by fetching all assets
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

      try {
        relayChainApi = new RelaychainApi(xcmProviderEndpoints[xcmEndpointKey.POLKADOT].endpoint);
        await relayChainApi.start();
      } catch (err) {
        console.error(err);
      }
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

      try {
        relayChainApi = new RelaychainApi(xcmProviderEndpoints[xcmEndpointKey.KUSAMA].endpoint);
        await relayChainApi.start();
      } catch (err) {
        console.error(err);
      }
    }

    srcChain.value = srcChains.value[0];
    destChain.value = destChains.value[0];
    tokens.value && store.commit('xcm/setSelectedToken', tokens.value[0]);
  };

  // const monitorConnectedNetwork = async (): Promise<void> => {
  //   const provider = getEvmProvider();
  //   if (!isH160.value || !provider) return;

  //   const web3 = new Web3(provider as any);
  //   const chainId = await web3.eth.getChainId();
  //   selectedNetwork.value = chainId;

  //   provider &&
  //     provider.on('chainChanged', (chainId: string) => {
  //       selectedNetwork.value = Number(chainId);
  //     });
  // };

  const bridge = async (): Promise<void> => {
    try {
      // const provider = getEvmProvider();
      if (!currentAccount.value) {
        throw Error('Failed loading wallet address');
      }
      // if (!provider) {
      //   throw Error('Failed loading wallet provider');
      // }
      if (!srcChain.value || !destChain.value || !relayChainApi) {
        throw Error('Something went wrong while bridging');
      }
      if (!amount.value) {
        throw Error('Invalid amount');
      }

      let recipientAccountId = currentAccount.value;
      const injector = await getInjector(substrateAccounts.value);
      // for H160 address, should mapped ss58 address and public key
      if (isH160.value) {
        const ss58MappedAddr = evmToAddress(currentAccount.value, PREFIX_ASTAR);
        console.log('ss58MappedAddr', ss58MappedAddr);
        const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
        console.log('hexPublicKey', hexPublicKey);
        recipientAccountId = hexPublicKey;
      }
      const txCall = await transferToParachain(
        destParaId.value,
        recipientAccountId,
        new BN(amount.value)
      );
      relayChainApi
        .signAndSend(recipientAccountId, injector.signer, txCall, handleResult)
        .catch((error: Error) => {
          handleTransactionError(error);
        });

      // const msg = `Transaction submitted at transaction hash #${hash}`;
      // store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
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
    if (!currentNetworkIdx.value || currentNetworkIdx.value !== null || xcmAssets.value !== null) {
      await updateBridgeConfig();
    }
  });

  // watchEffect(async () => {
  //   await monitorConnectedNetwork();
  // });

  watchEffect(async () => {
    await updateSelectedTokenBal();
  });

  // watch(
  //   [srcChain, isH160],
  //   async () => {
  //     const loadTime = 800;
  //     await wait(loadTime);
  //     isH160.value && srcChain.value && (await setupNetwork(srcChain.value.id));
  //   },
  //   { immediate: false }
  // );

  // watchEffect(() => {
  //   console.log('selectedToken effect', selectedToken && selectedToken.value);
  // });

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
    formattedSelectedTokenBalance,
    chainIcon,
    chainName,
    isDisabledBridge,
    tokenImage,
    isNativeToken,
    tokenDetails,
    isDisplayToken,
    isXcmCompatible,
    closeModal,
    openModal,
    inputHandler,
    selectChain,
    selectToken,
    bridge,
    toMaxAmount,
    resetStates,
  };
}
