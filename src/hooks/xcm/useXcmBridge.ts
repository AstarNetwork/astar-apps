import { ref, watchEffect, computed, onUnmounted } from 'vue';
import { useStore } from 'src/store';
import { useAccount } from 'src/hooks/useAccount';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import Web3 from 'web3';
import { transferToParachain } from './utils';

export interface Chain {
  id: number;
  name: string;
  icon: string;
  block_delay: number;
  gas_token_symbol: string;
  explore_url: string;
  contract_addr: string;
  drop_gas_amt: string;
  drop_gas_cost_amt: string;
  drop_gas_balance_alert: string;
  suggested_gas_cost: string;
}

export function useXcmBridge() {
  const srcChain = ref<Chain | null>(null);
  const destChain = ref<Chain | null>(null);
  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);
  const selectedNetwork = ref<number>(0);
  const chains = ref<Chain[] | null>(null);
  // const tokens = ref<SelectedToken[] | null>(null);
  const tokensObj = ref<any | null>(null);
  const selectedTokenBalance = ref<string>('0');
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const amount = ref<string | null>(null);
  const errMsg = ref<string>('');
  const isDisabledBridge = ref<boolean>(true);
  const destTokenUrl = ref<string>('');
  const destTokenAddress = ref<string>('');

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const { currentAccount } = useAccount();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const selectedToken = computed(() => store.getters['bridge/selectedToken']);

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    amount.value = null;
    // usdValue.value = 0;
  };

  const closeModal = (): boolean => modal.value === null;

  const openModal = (scene: 'src' | 'dest' | 'token'): void => {
    modal.value = scene;
  };

  // const selectToken = (token: SelectedToken): void => {
  //   store.commit('bridge/setSelectedToken', token);
  //   modal.value = null;
  //   resetStates();
  // };

  const getSelectedTokenBal = async (): Promise<string> => {
    if (
      !currentAccount.value ||
      !srcChain.value ||
      !selectedToken.value ||
      !selectedNetwork.value
    ) {
      return '0';
    }

    // return await getTokenBalCbridge({
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
    if (!chains.value) return;
    const isSrcChain = modal.value === 'src';
    const chain = chains.value.find((it) => it.id === chainId);
    if (!chain) return;

    if (isSrcChain) {
      srcChain.value = chain;
    } else {
      destChain.value = chain;
    }
    modal.value = null;
    resetStates();
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

  // const setDestTokenInformation = (): void => {
  //   if (!destChain.value || !selectedToken.value) return;
  //   const destTokenInfo = getDestTokenInfo({
  //     destChainId: destChain.value.id,
  //     selectedToken: selectedToken.value,
  //   });
  //   if (destTokenInfo && !destTokenInfo.isNativeToken) {
  //     destTokenUrl.value = destTokenInfo.url;
  //     destTokenAddress.value = destTokenInfo.address;
  //   } else {
  //     destTokenUrl.value = '';
  //     destTokenAddress.value = '';
  //   }
  // };

  const bridge = async (): Promise<void> => {
    try {
      const provider = getEvmProvider();
      if (!isH160.value || !currentAccount.value) {
        throw Error('Failed loading wallet address');
      }
      if (!provider) {
        throw Error('Failed loading wallet provider');
      }
      if (!selectedToken.value || !srcChain.value || !destChain.value) {
        throw Error('Something went wrong with cBridge API');
      }
      if (!amount.value) {
        throw Error('Invalid amount');
      }

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
    chains,
    closeModal,
    openModal,
    inputHandler,
    selectChain,
    bridge,
  };
}
