import { History } from './../c-bridge/index';
import { MaxUint256 } from '@ethersproject/constants';
import axios from 'axios';
import { ethers } from 'ethers';
import ABI from 'src/c-bridge/abi/ERC20.json';
import { AbiItem } from 'web3-utils';
// import debounce from 'lodash.debounce'; Todo: Add debounce to inputHandler
import { stringifyUrl } from 'query-string';
import {
  approve,
  BridgeMethod,
  cBridgeEndpoint,
  CbridgeToken,
  Chain,
  EvmChain,
  formatDecimals,
  getTokenBalCbridge,
  getTokenInfo,
  getTransferConfigs,
  mintOrBurn,
  pushToSelectableChains,
  Quotation,
  SelectedToken,
  sortChainName,
  getHistory,
  pendingStatus,
} from 'src/c-bridge';
import { getSelectedToken } from 'src/c-bridge/utils';
import { useStore } from 'src/store';
import { nativeCurrency, setupNetwork } from 'src/web3';
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
import {
  getMinAndMaxAmount,
  getMinimalMaxSlippage,
  poolTransfer,
} from './../c-bridge/utils/contract/index';
import { objToArray } from './helper/common';
import { calUsdAmount } from './helper/price';
import { getEvmProvider } from './helper/wallet';

const { Ethereum, Astar } = EvmChain;

export function useCbridge() {
  const srcChain = ref<Chain | null>(null);
  const destChain = ref<Chain | null>(null);
  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);
  const selectedNetwork = ref<number>(0);
  const chains = ref<Chain[] | null>(null);
  const tokens = ref<CbridgeToken[] | null>(null);
  const tokensObj = ref<any | null>(null);
  const selectedToken = ref<SelectedToken | null>(null);
  const selectedTokenBalance = ref<string>('0');
  const modal = ref<'src' | 'dest' | 'token' | 'history' | null>(null);
  const amount = ref<string | null>(null);
  const histories = ref<History[] | []>([]);
  const tokenIcons = ref<{ symbol: string; icon: string }[]>([]);
  const isPendingTx = ref<boolean>(false);
  const isUpdatingHistories = ref<boolean>(false);
  const quotation = ref<Quotation | null>(null);
  const usdValue = ref<number>(0);
  const isApprovalNeeded = ref<boolean>(true);
  const isDisabledBridge = ref<boolean>(true);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);

  const fetchHistory = async () => {
    if (!isH160.value || !selectedAddress.value) return;
    const { histories: historyArray, isPending } = await getHistory(selectedAddress.value);

    if (histories.value.length === 0) {
      histories.value = historyArray;
      isPendingTx.value = isPending;
    }

    if (histories.value.length === 0) return;

    const isFirstItemPending = pendingStatus.find((it) => it === histories.value[0].status);
    // Memo: update history items on the modal UI
    if (isFirstItemPending || isPending) {
      isUpdatingHistories.value = true;
      histories.value = [];
      const { histories: historyArray, isPending } = await getHistory(selectedAddress.value);
      histories.value = historyArray;
      isPendingTx.value = isPending;
      setTimeout(() => {
        isUpdatingHistories.value = false;
      }, 500);
    }
  };

  const resetStates = () => {
    isApprovalNeeded.value = true;
    isDisabledBridge.value = true;
    quotation.value = null;
    amount.value = null;
    usdValue.value = 0;
  };

  const handleApprove = async () => {
    try {
      const provider = getEvmProvider();
      if (!selectedToken.value || !selectedToken.value || !srcChain.value || !provider) return;
      if (srcChain.value.id !== selectedNetwork.value) {
        throw Error('invalid network');
      }

      const hash = await approve({
        address: selectedAddress.value,
        selectedToken: selectedToken.value,
        srcChainId: srcChain.value.id,
        provider,
      });
      const msg = `Transaction submitted at transaction hash #${hash}`;
      store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
    } catch (error: any) {
      console.error(error.message);
      store.dispatch('general/showAlertMsg', {
        msg: error.message || 'Something went wrong',
        alertType: 'error',
      });
    }
  };

  const closeModal = () => modal.value === null;
  const openModal = (scene: 'src' | 'dest' | 'token' | 'history') => (modal.value = scene);
  const selectToken = (token: CbridgeToken) => {
    if (!srcChain.value) return;
    const formattedToken = getSelectedToken({
      srcChainId: srcChain.value.id,
      token,
    });
    if (formattedToken) {
      selectedToken.value = formattedToken;
    }
    modal.value = null;
    resetStates();
  };

  const getSelectedTokenBal = async () => {
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

  const getEstimation = async () => {
    try {
      if (!srcChain.value || !destChain.value || !selectedToken.value) return;
      const numAmount = amount.value ? Number(amount.value) : 0.001;
      const isValidAmount = !isNaN(numAmount);
      if (!isValidAmount) return;

      const { symbol, decimals } = getTokenInfo({
        srcChainId: srcChain.value.id,
        selectedToken: selectedToken.value,
      });

      const token_symbol = symbol;
      const amt = ethers.utils.parseUnits(numAmount.toString(), decimals).toString();
      const is_pegged = selectedToken.value.bridgeMethod === BridgeMethod.canonical;
      const usr_addr = isH160.value
        ? selectedAddress.value
        : '0xaa47c83316edc05cf9ff7136296b026c5de7eccd'; // random address from docs

      // Memo: 3000 -> 0.3%
      let slippage_tolerance = 3000;

      if (!is_pegged) {
        const minimalMaxSlippage = await getMinimalMaxSlippage({
          srcChainId: srcChain.value.id,
          selectedToken: selectedToken.value,
        });
        slippage_tolerance =
          slippage_tolerance > minimalMaxSlippage ? slippage_tolerance : minimalMaxSlippage;
      }

      const url = stringifyUrl({
        url: cBridgeEndpoint.Quotation,
        query: {
          src_chain_id: srcChain.value.id,
          dst_chain_id: destChain.value.id,
          token_symbol,
          amt,
          usr_addr,
          slippage_tolerance,
          is_pegged,
        },
      });
      const { data } = await axios.get<Quotation>(url);

      const baseFee = formatDecimals({
        amount: ethers.utils.formatUnits(data.base_fee, decimals).toString(),
        decimals: 8,
      });

      const estimatedReceiveAmount = formatDecimals({
        amount: ethers.utils.formatUnits(data.estimated_receive_amt, decimals).toString(),
        decimals: 6,
      });

      const { min, max } = await getMinAndMaxAmount({
        srcChainId: srcChain.value.id,
        selectedToken: selectedToken.value,
      });

      quotation.value = {
        ...data,
        bridge_rate: formatDecimals({
          amount: String(data.bridge_rate),
          decimals: 2,
        }),
        base_fee: String(baseFee),
        estimated_receive_amt: String(estimatedReceiveAmount),
        minAmount: min,
        maxAmount: max,
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Todo: Fix input bug with debounce
  // const inputHandler = debounce((event) => {
  //   amount.value = event.target.value;
  //   isDisabledBridge.value = true;
  // }, 800);

  const inputHandler = (event: any) => {
    amount.value = event.target.value;
    isDisabledBridge.value = true;
  };

  const toMaxAmount = async () => {
    if (!isH160.value) return;
    amount.value = await getSelectedTokenBal();
  };

  const selectChain = async (chainId: number) => {
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

  const reverseChain = () => {
    const fromChain = srcChain.value;
    srcChain.value = destChain.value;
    destChain.value = fromChain;
    resetStates();
  };

  const updateBridgeConfig = async () => {
    const data = await getTransferConfigs();
    const supportChain = data && data.supportChain;
    const tokens = data && data.tokens;
    const tokenIconsData = data && data.tokenIcons;

    if (!supportChain || !tokens || !tokenIconsData) return;
    srcChain.value = supportChain.find((it) => it.id === Ethereum) as Chain;
    destChain.value = supportChain.find((it) => it.id === Astar) as Chain;
    tokenIcons.value = tokenIconsData;

    sortChainName(supportChain);
    srcChains.value = supportChain;
    chains.value = supportChain;
    tokensObj.value = tokens;
  };

  const watchSelectableChains = () => {
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
    tokens.value = tokensObj.value[srcChain.value.id][destChain.value.id] as CbridgeToken[];

    const formattedToken = getSelectedToken({
      srcChainId: srcChain.value.id,
      token: tokens.value && tokens.value[0],
    });
    if (formattedToken) {
      selectedToken.value = formattedToken;
    }
    isApprovalNeeded.value = true;
  };

  const bridge = async () => {
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
    await updateBridgeConfig();
  });

  watchEffect(() => {
    watchSelectableChains();
  });

  watchEffect(async () => {
    if (!selectedToken.value || !destChain.value || !srcChain.value || !amount.value) return;
    const { symbol } = getTokenInfo({
      srcChainId: srcChain.value.id,
      selectedToken: selectedToken.value,
    });
    usdValue.value = await calUsdAmount({
      amount: Number(amount.value),
      symbol,
    });
  });

  watchEffect(async () => {
    await getEstimation();
  });

  watchEffect(async () => {
    await fetchHistory();
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
    [srcChain, isH160],
    async () => {
      setTimeout(async () => {
        isH160.value && srcChain.value && (await setupNetwork(srcChain.value.id));
      }, 800);
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
      !quotation.value ||
      !srcChain.value ||
      !quotation.value.minAmount ||
      !quotation.value.maxAmount ||
      selectedNetwork.value !== srcChain.value.id ||
      0 >= Number(quotation.value.estimated_receive_amt) ||
      Number(amount.value) > Number(selectedTokenBalance.value)
    ) {
      isDisabledBridge.value = true;
      return;
    }

    if (
      quotation.value.maxAmount > Number(amount.value) &&
      Number(amount.value) > quotation.value.minAmount
    ) {
      isDisabledBridge.value = false;
      return;
    }
  });

  // Memo: Check approval
  watchEffect(() => {
    let cancelled = false;
    const provider = getEvmProvider();
    if (
      !isH160.value ||
      !srcChain.value ||
      !selectedToken.value ||
      !selectedAddress.value ||
      !provider
    ) {
      return;
    }

    const address = selectedAddress.value;
    const { tokenAddress, symbol, contractAddress } = getTokenInfo({
      srcChainId: srcChain.value.id,
      selectedToken: selectedToken.value,
    });

    const checkIsApproved = async (): Promise<boolean | null> => {
      if (!tokenAddress) return null;
      if (!tokenAddress || !symbol || !contractAddress) {
        throw Error('Cannot find token information');
      }
      const web3 = new Web3(provider as any);
      const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);
      const allowance = await contract.methods
        .allowance(address, contractAddress)
        .call()
        .catch((error: any) => {
          return '0';
        });
      return Number(allowance) === Number(MaxUint256.toString());
    };

    const checkPeriodically = async () => {
      if (cancelled || !srcChain.value || isApprovalNeeded.value === false) return;
      isApprovalNeeded.value = true;
      if (nativeCurrency[srcChain.value.id].name === symbol) {
        isApprovalNeeded.value = false;
        return;
      }

      const result = await checkIsApproved();
      if (cancelled) return;
      isApprovalNeeded.value = !!!result;
      setTimeout(checkPeriodically, 15000);
    };

    checkPeriodically();

    return () => {
      cancelled = true;
    };
  });

  const handleUpdate = setInterval(async () => {
    await getEstimation();
    await fetchHistory();
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
    selectedToken,
    selectedTokenBalance,
    amount,
    quotation,
    isApprovalNeeded,
    selectedNetwork,
    isDisabledBridge,
    usdValue,
    histories,
    isUpdatingHistories,
    isPendingTx,
    tokenIcons,
    reverseChain,
    closeModal,
    openModal,
    selectChain,
    selectToken,
    inputHandler,
    toMaxAmount,
    handleApprove,
    bridge,
  };
}
