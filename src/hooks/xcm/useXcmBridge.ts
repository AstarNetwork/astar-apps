import { ref, watchEffect, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/store';
import { useAccount } from 'src/hooks/useAccount';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import Web3 from 'web3';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { transferToParachain } from './utils';

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

export function useXcmBridge() {
  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);

  const srcChain = ref<Chain | null>(null);
  const destChain = ref<Chain | null>(null);
  const selectedNetwork = ref<number>(0);
  const selectedTokenBalance = ref<string>('0');
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);

  const store = useStore();
  const router = useRouter();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const { currentAccount } = useAccount();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
  };

  const closeModal = (): boolean => modal.value === null;

  const openModal = (scene: 'src' | 'dest' | 'token'): void => {
    modal.value = scene;
  };

  const getSelectedTokenBal = async (): Promise<string> => {
    if (!currentAccount.value || !srcChain.value || !selectedNetwork.value) {
      return '0';
    }

    //// TODO
    // return await getTokenBal({
    //   address: currentAccount.value,
    //   srcChainId: srcChain.value.id,
    //   selectedToken: selectedToken.value,
    // }).catch((error: any) => {
    //   console.error(error.message);
    //   return '0';
    // });
    return '0';
  };

  const inputHandler = (event: any): void => {
    amount.value = event.target.value;
    isDisabledBridge.value = true;
    errMsg.value = '';
  };

  const selectChain = (chainId: number): void => {
    const isSrcChain = modal.value === 'src';
    const chain = destChain.value;

    if (isSrcChain) {
      srcChain.value = chain;
    } else {
      destChain.value = chain;
    }
    modal.value = null;
    resetStates();
  };

  const updateBridgeConfig = async (): Promise<void> => {
    store.commit('general/setLoading', true);
    const query = router.currentRoute.value.query;

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
    }

    srcChain.value = srcChains.value[0];
    destChain.value = destChains.value[0];

    store.commit('general/setLoading', false);
  };

  const monitorConnectedNetwork = async (): Promise<void> => {
    const provider = getEvmProvider();
    if (!isH160.value || !provider) return;

    const web3 = new Web3(provider as any);
    const chainId = await web3.eth.getChainId();
    selectedNetwork.value = chainId;

    provider &&
      provider.on('chainChanged', (chainId: string) => {
        selectedNetwork.value = Number(chainId);
      });
  };

  const bridge = async (): Promise<void> => {
    try {
      const provider = getEvmProvider();
      if (!isH160.value || !currentAccount.value) {
        throw Error('Failed loading wallet address');
      }
      if (!provider) {
        throw Error('Failed loading wallet provider');
      }
      if (!srcChain.value || !destChain.value) {
        throw Error('Something went wrong while bridging');
      }
      if (!amount.value) {
        throw Error('Invalid amount');
      }

      // TODO:
      // const hash = await transferToParachain({
      //   provider,
      //   selectedToken: selectedToken.value,
      //   amount: amount.value,
      //   srcChainId: srcChain.value.id,
      //   address: currentAccount.value,
      // });
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

  watchEffect(async () => {
    if (!currentNetworkIdx.value || currentNetworkIdx.value !== null) {
      await updateBridgeConfig();
    }
  });

  watchEffect(async () => {
    await monitorConnectedNetwork();
  });

  const handleUpdate = setInterval(async () => {
    await updateSelectedTokenBal();
  }, 20 * 1000);

  onUnmounted(() => {
    clearInterval(handleUpdate);
  });

  return {
    srcChain,
    destChain,
    srcChains,
    destChains,
    closeModal,
    openModal,
    inputHandler,
    selectChain,
    bridge,
  };
}
