import { nativeCurrency } from './../web3/index';
import { MaxUint256 } from '@ethersproject/constants';
import axios from 'axios';
import { ethers } from 'ethers';
import ABI from 'human-standard-token-abi';
import debounce from 'lodash.debounce';
import { stringifyUrl } from 'query-string';
import {
  approve,
  cBridgeEndpoint,
  cbridgeInitialState,
  Chain,
  EvmChain,
  formatDecimals,
  getTokenBalCbridge,
  getTokenInfo,
  getTransferConfigs,
  PeggedPairConfig,
  pushToSelectableChains,
  Quotation,
  sortChainName,
} from 'src/c-bridge';
import { useStore } from 'src/store';
import { setupNetwork } from 'src/web3';
import { computed, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
import { objToArray } from './helper/common';

const { Ethereum, BSC, Astar, Shiden } = EvmChain;

export function useCbridge() {
  const srcChain = ref<Chain | null>(cbridgeInitialState[Ethereum]);
  const destChain = ref<Chain | null>(cbridgeInitialState[Astar]);
  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);
  const chains = ref<Chain[] | null>(null);
  const tokens = ref<PeggedPairConfig[] | null>(null);
  const selectedToken = ref<PeggedPairConfig | null>(null);
  const selectedTokenBalance = ref<string | null>(null);
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const tokensObj = ref<any | null>(null);
  const amount = ref<string | null>(null);
  const quotation = ref<Quotation | null>(null);
  const selectedNetwork = ref<number | null>(null);
  const isApprovalNeeded = ref<boolean | null>(null);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);

  const handleApprove = async () => {
    if (!selectedToken.value || !selectedToken.value || !srcChain.value) return;
    if (srcChain.value.id !== selectedNetwork.value) {
      throw Error('invalid network');
    }
    await approve({
      address: selectedAddress.value,
      selectedToken: selectedToken.value,
      srcChainId: srcChain.value.id,
    });
  };

  const closeModal = () => modal.value === null;
  const openModal = (scene: 'src' | 'dest' | 'token') => (modal.value = scene);
  const selectToken = (token: PeggedPairConfig) => {
    selectedToken.value = token;
    console.log('selectedToken.value', selectedToken.value);
    modal.value = null;
  };

  const getSelectedTokenBal = async () => {
    if (!selectedAddress.value || !srcChain.value || !selectedToken.value) return '0';

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
      if (!srcChain.value || !destChain.value || !selectedToken.value || !amount.value) return;
      const numAmount = Number(amount.value);
      const isValidAmount = !isNaN(numAmount);
      if (!isValidAmount) return;

      const tokenInfo = getTokenInfo({
        srcChainId: srcChain.value.id,
        selectedToken: selectedToken.value,
      });

      const token_symbol = tokenInfo.token.symbol;
      const amt = ethers.utils.parseUnits(numAmount.toString(), tokenInfo.token.decimal).toString();

      const usr_addr = isH160.value
        ? selectedAddress.value
        : '0xaa47c83316edc05cf9ff7136296b026c5de7eccd';

      // Memo: dummy due to slippage is not be effective to `is_pagged: true`
      const slippage_tolerance = 3000;

      const url = stringifyUrl({
        url: cBridgeEndpoint + '/estimateAmt',
        query: {
          src_chain_id: srcChain.value.id,
          dst_chain_id: destChain.value.id,
          token_symbol,
          amt,
          usr_addr,
          slippage_tolerance,
          is_pegged: true,
        },
      });
      const { data } = await axios.get<Quotation>(url);

      const baseFee = formatDecimals({
        amount: ethers.utils.formatUnits(data.base_fee, tokenInfo.token.decimal).toString(),
        decimals: 8,
      });

      const estimatedReceiveAmount = formatDecimals({
        amount: ethers.utils
          .formatUnits(data.estimated_receive_amt, tokenInfo.token.decimal)
          .toString(),
        decimals: 6,
      });

      quotation.value = {
        ...data,
        base_fee: String(baseFee),
        estimated_receive_amt: String(estimatedReceiveAmount),
      };
    } catch (error) {
      console.log(error);
    }
  };

  const inputHandler = debounce((event) => {
    amount.value = event.target.value;
  }, 500);

  const toMaxAmount = async () => {
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
  };

  const reverseChain = () => {
    const fromChain = srcChain.value;
    srcChain.value = destChain.value;
    destChain.value = fromChain;
  };

  const updateBridgeConfig = async () => {
    const data = await getTransferConfigs();
    const supportChain = data && data.supportChain;
    const tokens = data && data.tokens;

    if (!supportChain || !tokens) return;
    srcChain.value = supportChain.find((it) => it.id === Ethereum) as Chain;
    destChain.value = supportChain.find((it) => it.id === Astar) as Chain;

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
      const tokens = objToArray(tokensObj.value[srcChain.value.id]).find(
        (it) => Object.keys(it).length !== 0
      );
      const chainId =
        srcChain.value.id === tokens[0].org_chain_id
          ? tokens[0].pegged_chain_id
          : tokens[0].org_chain_id;
      destChain.value = chains.value.find((it) => it.id === chainId) as Chain;
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
    tokens.value = tokensObj.value[srcChain.value.id][destChain.value.id];
    selectedToken.value = tokens.value && tokens.value[0];
  };

  watchEffect(async () => {
    await updateBridgeConfig();
  });

  watchEffect(() => {
    watchSelectableChains();
  });

  watchEffect(async () => {
    getEstimation();
    console.log('isApprovalNeeded', isApprovalNeeded.value);
  });

  watch(
    [srcChain, selectedToken, selectedAddress, selectedNetwork],
    async () => {
      selectedTokenBalance.value = String(
        formatDecimals({
          amount: await getSelectedTokenBal(),
          decimals: 6,
        })
      );
    },
    { immediate: true }
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

  watchEffect(() => {
    if (!isH160.value) return;
    const ethereum = typeof window !== 'undefined' && window.ethereum;

    ethereum &&
      ethereum.on('chainChanged', (chainId: string) => {
        selectedNetwork.value = Number(chainId);
      });
  });

  // Memo: Check approval
  watchEffect(() => {
    let cancelled = false;
    const provider = typeof window !== 'undefined' && window.ethereum;
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
    const tokenInfo = getTokenInfo({
      srcChainId: srcChain.value.id,
      selectedToken: selectedToken.value,
    });
    const token = tokenInfo.token.address;
    const spender =
      selectedToken.value.org_chain_id === selectedNetwork.value
        ? selectedToken.value.pegged_deposit_contract_addr
        : selectedToken.value.pegged_burn_contract_addr;

    const checkIsApproved = async (): Promise<boolean | null> => {
      if (!token) return null;
      try {
        const web3 = new Web3(provider as any);
        const contract = new web3.eth.Contract(ABI, token);
        const allowance = await contract.methods.allowance(address, spender).call();
        return allowance === MaxUint256.toString();
      } catch (err: any) {
        console.error(err.message);
        return null;
      }
    };

    const checkPeriodically = async () => {
      if (cancelled || !srcChain.value || isApprovalNeeded.value === false) return;

      if (nativeCurrency[srcChain.value.id].name === tokenInfo.token.symbol) {
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
    reverseChain,
    closeModal,
    openModal,
    selectChain,
    selectToken,
    inputHandler,
    toMaxAmount,
    handleApprove,
    isApprovalNeeded,
    selectedNetwork,
  };
}
