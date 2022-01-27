import { PeggedPairConfig } from './../c-bridge/index';
import { cbridgeInitialState, getTransferConfigs, initialStateWeth } from 'src/c-bridge';
import { ref, watchEffect, watch } from 'vue';
import { Chain, EvmChain } from './../c-bridge';
import { isAstarOrShiden, pushToSelectableChains } from './../c-bridge/utils/index';
import { objToArray } from './helper/common';

const { Ethereum, BSC, Astar, Shiden } = EvmChain;

// Todo:
// address: start from '0x'
// useConnectWallet: add {option: EVM} parameter

export function useCbridge() {
  const srcChain = ref<Chain | null>(cbridgeInitialState[Ethereum]);
  const destChain = ref<Chain | null>(cbridgeInitialState[Astar]);
  const srcChains = ref<Chain[] | null>(null);
  const destChains = ref<Chain[] | null>(null);
  const chains = ref<Chain[] | null>(null);
  const tokens = ref<PeggedPairConfig[] | null>(null);
  const selectedToken = ref<PeggedPairConfig | null>(null);
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const tokensObj = ref<any | null>(null);

  const closeModal = () => modal.value === null;
  const openModal = (scene: 'src' | 'dest' | 'token') => (modal.value = scene);
  const selectToken = (token: PeggedPairConfig) => {
    selectedToken.value = token;
    console.log(' selectedToken.value ', selectedToken.value);
    modal.value = null;
  };

  const selectChain = (chainId: number) => {
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

  const updateBridgeConfig = async () => {
    const data = await getTransferConfigs();
    const supportChain = data && data.supportChain;
    const tokens = data && data.tokens;

    if (!supportChain || !tokens) return;
    srcChain.value = supportChain.find((it) => it.id === Ethereum) as Chain;
    destChain.value = supportChain.find((it) => it.id === Astar) as Chain;
    srcChains.value = supportChain;
    chains.value = supportChain;
    tokensObj.value = tokens;
  };

  watchEffect(async () => {
    await updateBridgeConfig();
  });

  const watchSelectableChains = () => {
    if (!srcChain.value || !destChain.value || chains.value === null) {
      return;
    }

    if (destChain.value.id === srcChain.value.id) {
      const chainId = objToArray(tokensObj.value[srcChain.value.id])[0][0].org_chain_id;
      destChain.value = chains.value.find((it) => it.id === chainId) as Chain;
    }

    const selectableChains: Chain[] = [];
    pushToSelectableChains({
      tokensObj: tokensObj.value,
      srcChainId: srcChain.value.id,
      selectableChains,
      supportChains: chains.value,
    });

    destChains.value = selectableChains;
    tokens.value = tokensObj.value[srcChain.value.id][destChain.value.id];
    console.log('tokens', tokens.value);
    selectedToken.value = tokens.value && tokens.value[0];
  };

  watchEffect(() => {
    watchSelectableChains();
  });

  return {
    srcChain,
    destChain,
    chains,
    tokens,
    modal,
    destChains,
    srcChains,
    selectedToken,
    closeModal,
    openModal,
    selectChain,
    selectToken,
  };
}
