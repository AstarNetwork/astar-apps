import { cbridgeInitialState, getTransferConfigs } from 'src/c-bridge';
import { useStore } from 'src/store';
import { setupNetwork } from 'src/web3';
import { computed, ref, watch, watchEffect } from 'vue';
import { Chain, EvmChain } from './../c-bridge';
import { PeggedPairConfig } from './../c-bridge/index';
import { pushToSelectableChains, sortChainName } from './../c-bridge/utils/index';
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
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const tokensObj = ref<any | null>(null);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const closeModal = () => modal.value === null;
  const openModal = (scene: 'src' | 'dest' | 'token') => (modal.value = scene);
  const selectToken = (token: PeggedPairConfig) => {
    selectedToken.value = token;
    modal.value = null;
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

    sortChainName(selectableChains);
    destChains.value = selectableChains;
    tokens.value = tokensObj.value[srcChain.value.id][destChain.value.id];
    selectedToken.value = tokens.value && tokens.value[0];
  };

  watchEffect(() => {
    watchSelectableChains();
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

  return {
    destChains,
    srcChains,
    srcChain,
    destChain,
    chains,
    tokens,
    modal,
    selectedToken,
    reverseChain,
    closeModal,
    openModal,
    selectChain,
    selectToken,
  };
}
