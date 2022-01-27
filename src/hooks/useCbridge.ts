import { cbridgeInitialState, getTransferConfigs } from 'src/c-bridge';
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
  const modal = ref<'src' | 'dest' | 'token' | null>(null);
  const tokensObj = ref<any | null>(null);

  const closeModal = () => modal.value === null;
  const openModal = (scene: 'src' | 'dest' | 'token') => (modal.value = scene);

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
    console.log('supportChain', supportChain);
    console.log('tokens', tokens);

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

    const isSrcAstarOrShiden = isAstarOrShiden(srcChain.value.id);
    const lookChain = isSrcAstarOrShiden ? destChain.value.id : srcChain.value.id;
    // const lookChain = srcChain.value.id;
    const selectableChains: Chain[] = [];

    pushToSelectableChains({
      tokensObj: tokensObj.value[Shiden],
      chainId: Shiden,
      lookChain,
      selectableChains,
      supportChains: chains.value,
    });

    pushToSelectableChains({
      tokensObj: tokensObj.value[Astar],
      chainId: Astar,
      lookChain,
      selectableChains,
      supportChains: chains.value,
    });

    console.log('tokensObj.value', tokensObj.value);
    console.log('tokensObj.value[Shiden]', tokensObj.value[Shiden]);
    console.log('selectableChains', selectableChains);

    destChains.value = selectableChains;
  };

  // watch([srcChain],()=>{
  //   if (!srcChain.value || !destChain.value || chains.value === null) {
  //     return;
  //   }

  //   const isSrcAstarOrShiden = isAstarOrShiden(srcChain.value.id);
  //   const lookChain = isSrcAstarOrShiden ? destChain.value.id : srcChain.value.id;
  //   const selectableChains: Chain[] = [];

  //   pushToSelectableChains({
  //     tokensObj: tokensObj.value[Shiden],
  //     chainId: Shiden,
  //     lookChain,
  //     selectableChains,
  //     supportChains: chains.value,
  //   });

  //   pushToSelectableChains({
  //     tokensObj: tokensObj.value[Astar],
  //     chainId: Astar,
  //     lookChain,
  //     selectableChains,
  //     supportChains: chains.value,
  //   });
  // },{immediate:false})

  watchEffect(() => {
    watchSelectableChains();
  });

  return {
    srcChain,
    destChain,
    chains,
    closeModal,
    openModal,
    modal,
    destChains,
    srcChains,
    selectChain,
  };
}
