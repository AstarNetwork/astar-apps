import {
  BridgeMethod,
  CbridgeToken,
  Chain,
  detectRemoveNetwork,
  EvmChain,
  fetchEstimation,
  getDestTokenInfo,
  getSelectedToken,
  getTokenBalCbridge,
  getTokenInfo,
  getTransferConfigs,
  mintOrBurn,
  poolTransfer,
  pushToSelectableChains,
  Quotation,
  SelectedToken,
  sortChainName,
} from 'src/c-bridge';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { objToArray } from 'src/hooks/helper/common';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { setupNetwork } from 'src/config/web3';
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
// import { calUsdAmount } from './helper/price';

const { Ethereum, Astar, Shiden } = EvmChain;

export function useCbridge() {
  const srcChain = ref<Chain | null>(null);
  const destChain = ref<Chain | null>(null);
  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);
  const selectedNetwork = ref<number>(0);
  const chains = ref<Chain[] | null>(null);
  const tokens = ref<SelectedToken[] | null>(null);
  const tokensObj = ref<any | null>(null);
  const selectedTokenBalance = ref<string>('0');
  const modal = ref<'src' | 'dest' | 'token' | 'history' | null>(null);
  const amount = ref<string | null>(null);
  const tokenIcons = ref<{ symbol: string; icon: string }[]>([]);
  const quotation = ref<Quotation | null>(null);
  const errMsg = ref<string>('');
  const usdValue = ref<number>(0);
  const isDisabledBridge = ref<boolean>(true);
  const destTokenUrl = ref<string>('');
  const destTokenAddress = ref<string>('');
  const isClickReverseButton = ref<boolean>(false);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const selectedToken = computed(() => store.getters['bridge/selectedToken']);

  const resetStates = (): void => {
    isDisabledBridge.value = true;
    quotation.value = null;
    amount.value = null;
    usdValue.value = 0;
  };

  const closeModal = (): boolean => modal.value === null;

  const openModal = (scene: 'src' | 'dest' | 'token' | 'history'): void => {
    modal.value = scene;
  };

  const selectToken = (token: SelectedToken): void => {
    store.commit('bridge/setSelectedToken', token);
    modal.value = null;
    resetStates();
  };

  const getSelectedTokenBal = async (): Promise<string> => {
    if (
      !selectedAddress.value ||
      !srcChain.value ||
      !selectedToken.value ||
      !selectedNetwork.value
    ) {
      return '0';
    }

    return await getTokenBalCbridge({
      address: selectedAddress.value,
      srcChainId: srcChain.value.id,
      selectedToken: selectedToken.value,
    }).catch((error: any) => {
      console.error(error.message);
      return '0';
    });
  };

  const getEstimation = async (): Promise<void> => {
    try {
      if (
        !srcChain.value ||
        !destChain.value ||
        !selectedToken.value ||
        (amount.value && Number(amount.value) === 0)
      ) {
        quotation.value = null;
        return;
      }
      const numAmount = amount.value ? Number(amount.value) : 0.001;
      const isValidAmount = !isNaN(numAmount);
      if (!isValidAmount) {
        throw Error('Invalid amount');
      }

      const address = isH160.value
        ? selectedAddress.value
        : '0xaa47c83316edc05cf9ff7136296b026c5de7eccd'; // random address from docs
      const estimation = await fetchEstimation({
        amount: numAmount,
        srcChainId: srcChain.value.id,
        destChainId: destChain.value.id,
        selectedToken: selectedToken.value,
        address,
      });

      quotation.value = estimation;
      if (0 > Number(estimation.estimated_receive_amt)) {
        errMsg.value = 'The received amount cannot cover fee';
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  // Todo: Fix input bug with debounce
  // const inputHandler = debounce((event) => {
  //   amount.value = event.target.value;
  //   isDisabledBridge.value = true;
  // }, 800);

  const inputHandler = (event: any): void => {
    amount.value = event.target.value;
    isDisabledBridge.value = true;
    errMsg.value = '';
  };

  const toMaxAmount = async (): Promise<void> => {
    if (!isH160.value) return;
    amount.value = await getSelectedTokenBal();
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

  const reverseChain = (): void => {
    isClickReverseButton.value = true;
    const fromChain = srcChain.value;
    srcChain.value = destChain.value;
    destChain.value = fromChain;
    resetStates();
  };

  const updateBridgeConfig = async (): Promise<void> => {
    store.commit('general/setLoading', true);
    const data = await getTransferConfigs(currentNetworkIdx.value);
    const supportChain = data && data.supportChain;
    const tokens = data && data.tokens;
    const tokenIconsData = data && data.tokenIcons;

    if (!supportChain || !tokens || !tokenIconsData) {
      throw Error('Cannot fetch from cBridge API');
    }

    if (currentNetworkIdx.value === endpointKey.ASTAR) {
      srcChain.value = supportChain.find((it) => it.id === Ethereum) as Chain;
      destChain.value = supportChain.find((it) => it.id === Astar) as Chain;
    } else {
      srcChain.value = supportChain.find((it) => it.id === Shiden) as Chain;
      destChain.value = supportChain.find((it) => it.id === Astar) as Chain;
    }
    tokenIcons.value = tokenIconsData;

    sortChainName(supportChain);
    const removeNetworkId = detectRemoveNetwork(currentNetworkIdx.value);
    srcChains.value = supportChain.filter((it) => {
      return it.id !== removeNetworkId;
    });
    chains.value = supportChain;
    tokensObj.value = tokens;
    store.commit('general/setLoading', false);
  };

  const watchSelectableChains = async (): Promise<void> => {
    if (!srcChain.value || !destChain.value || chains.value === null) {
      return;
    }

    if (destChain.value.id === srcChain.value.id) {
      const tokens: CbridgeToken[] = objToArray(tokensObj.value[srcChain.value.id]).find(
        (it) => Object.keys(it).length !== 0
      );
      const firstCanonical = tokens.find(
        (it: CbridgeToken) => it.bridgeMethod === BridgeMethod.canonical
      ) as CbridgeToken;

      if (!firstCanonical || !firstCanonical.canonical) return;
      const chainId =
        srcChain.value.id === firstCanonical.canonical.org_chain_id
          ? firstCanonical.canonical.pegged_chain_id
          : firstCanonical.canonical.org_chain_id;
      destChain.value = chains.value.find((it) => it.id === chainId) as Chain;
    }

    if (srcChain.value.id !== Astar) {
      destChain.value = chains.value.find((it) => it.id === Astar) as Chain;
    }

    const selectableChains: Chain[] = [];
    pushToSelectableChains({
      tokensObj: tokensObj.value,
      srcChainId: srcChain.value.id,
      selectableChains,
      supportChains: chains.value,
    });

    sortChainName(selectableChains);
    destChains.value = selectableChains;
    tokens.value = tokensObj.value[srcChain.value.id][destChain.value.id].map(
      (token: CbridgeToken) => {
        if (!srcChain.value) return;
        return getSelectedToken({
          srcChainId: srcChain.value.id,
          token,
        });
      }
    );

    if (isClickReverseButton.value) {
      isClickReverseButton.value = false;
    } else {
      store.commit('bridge/setSelectedToken', tokens.value && tokens.value[0]);
    }
  };

  const bridge = async (): Promise<void> => {
    try {
      const provider = getEvmProvider();
      if (!isH160.value || !selectedAddress.value) {
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
      if (
        !quotation.value ||
        !quotation.value.estimated_receive_amt ||
        0 >= Number(quotation.value.estimated_receive_amt) ||
        errMsg.value !== ''
      ) {
        throw Error('Invalid estimated receiving amount');
      }

      if (selectedToken.value.bridgeMethod === BridgeMethod.canonical) {
        const hash = await mintOrBurn({
          provider,
          selectedToken: selectedToken.value,
          amount: amount.value,
          srcChainId: srcChain.value.id,
          address: selectedAddress.value,
        });
        const msg = `Transaction submitted at transaction hash #${hash}`;
        store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
      } else {
        const hash = await poolTransfer({
          provider,
          selectedToken: selectedToken.value,
          amount: amount.value,
          srcChainId: srcChain.value.id,
          destChainId: destChain.value.id,
          address: selectedAddress.value,
        });
        const msg = `Transaction submitted at transaction hash #${hash}`;
        store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
      }
      amount.value = null;
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
    }
  };

  watchEffect(async () => {
    if (!currentNetworkIdx.value || currentNetworkIdx.value !== null) {
      await updateBridgeConfig();
    }
  });

  watch(
    [srcChain, destChain, chains],
    async () => {
      await watchSelectableChains();
    },
    { immediate: true }
  );

  watchEffect(() => {
    if (!destChain.value || !selectedToken.value) return;
    const destTokenInfo = getDestTokenInfo({
      destChainId: destChain.value.id,
      selectedToken: selectedToken.value,
    });
    if (destTokenInfo && !destTokenInfo.isNativeToken) {
      destTokenUrl.value = destTokenInfo.url;
      destTokenAddress.value = destTokenInfo.address;
    } else {
      destTokenUrl.value = '';
      destTokenAddress.value = '';
    }
  });

  // Todo: enable after fix the debounce issue
  // watchEffect(async () => {
  //   if (!selectedToken.value || !destChain.value || !srcChain.value || !amount.value) return;
  //   const { symbol } = getTokenInfo({
  //     srcChainId: srcChain.value.id,
  //     selectedToken: selectedToken.value,
  //   });
  //   usdValue.value = await calUsdAmount({
  //     amount: Number(amount.value),
  //     symbol,
  //   });
  // });

  watchEffect(async () => {
    await getEstimation();
  });

  watchEffect(async () => {
    selectedTokenBalance.value = await getSelectedTokenBal();
  });

  watch(
    [srcChain, isH160],
    async () => {
      setTimeout(async () => {
        isH160.value && srcChain.value && (await setupNetwork(srcChain.value.id));
      }, 800);
    },
    { immediate: false }
  );

  watch(
    [quotation, selectedNetwork],
    async () => {
      if (
        !quotation.value ||
        quotation.value === null ||
        !srcChain.value ||
        !selectedToken.value ||
        !amount.value
      ) {
        errMsg.value = '';
        return;
      }

      const { symbol } = getTokenInfo({
        srcChainId: srcChain.value.id,
        selectedToken: selectedToken.value,
      });

      const balance = Number(await getSelectedTokenBal());
      const numAmount = Number(amount.value);
      const { minAmount, maxAmount } = quotation.value;
      if (!minAmount || !maxAmount) return;

      if (srcChain.value.id !== selectedNetwork.value) {
        errMsg.value = 'Selected invalid network in your wallet';
      } else if (numAmount > balance) {
        errMsg.value = 'Insufficient balance';
      } else if (minAmount >= numAmount) {
        errMsg.value = `Amount must be greater than ${minAmount} ${symbol}`;
      } else if (numAmount >= maxAmount) {
        errMsg.value = `Amount must be less than ${maxAmount} ${symbol}`;
      } else {
        errMsg.value = '';
      }
    },
    { immediate: false }
  );

  watchEffect(async () => {
    const provider = getEvmProvider();
    if (!isH160.value || !provider) return;

    const web3 = new Web3(provider as any);
    const chainId = await web3.eth.getChainId();
    selectedNetwork.value = chainId;

    provider &&
      provider.on('chainChanged', (chainId: string) => {
        selectedNetwork.value = Number(chainId);
      });
  });

  watchEffect(() => {
    if (
      quotation.value &&
      quotation.value.maxAmount !== undefined &&
      quotation.value.minAmount !== undefined &&
      Number(amount.value) > 0
    ) {
      isDisabledBridge.value = errMsg.value !== '';
    } else {
      isDisabledBridge.value = true;
    }
  });

  const handleUpdate = setInterval(async () => {
    await getEstimation();
  }, 20 * 1000);

  onUnmounted(() => {
    clearInterval(handleUpdate);
  });

  return {
    destChains,
    srcChains,
    srcChain,
    destChain,
    chains,
    tokens,
    modal,
    selectedTokenBalance,
    amount,
    quotation,
    selectedNetwork,
    isDisabledBridge,
    usdValue,
    tokenIcons,
    errMsg,
    destTokenUrl,
    destTokenAddress,
    currentNetworkIdx,
    reverseChain,
    closeModal,
    openModal,
    selectChain,
    selectToken,
    inputHandler,
    toMaxAmount,
    bridge,
  };
}
