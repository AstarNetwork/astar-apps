import {
  astarChain,
  ASTAR_CHAIN,
  ASTAR_EVM_NETWORK_IDX,
  ASTAR_NATIVE_TOKEN,
  ASTAR_NETWORK_IDX,
} from 'src/config/chain';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed } from 'vue';
import { polkadotJsUrl } from 'src/links';
import { endpointKey } from 'src/config/chainEndpoints';

export function isCustomNetwork(network: string) {
  return network === 'custom-network';
}

export function useNetworkInfo() {
  const store = useStore();

  const isMainnet = computed<boolean>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const network = chainInfo ? chainInfo.chain : '';
    const isTestnet = network === astarChain.DEVELOPMENT || network === astarChain.SHIBUYA;
    return !isTestnet;
  });

  const currentNetworkChain = computed<ASTAR_CHAIN>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return chain;
  });

  const currentNetworkIdx = computed<ASTAR_NETWORK_IDX>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const evmNetworkIdx = computed<ASTAR_EVM_NETWORK_IDX>(() => {
    return Number(providerEndpoints[currentNetworkIdx.value].evmChainId) as ASTAR_EVM_NETWORK_IDX;
  });

  const currentNetworkName = computed<string>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return chain === astarChain.SHIBUYA
      ? 'Shibuya'
      : chain === astarChain.ROCSTAR
      ? 'Rocstar'
      : chain;
  });

  const nativeTokenSymbol = computed<ASTAR_NATIVE_TOKEN>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const isSupportXvmTransfer = computed<boolean>(() => {
    return !isMainnet.value;
  });

  const polkadotJsLink = computed<string>(() => {
    const { astar, shiden, shibuya } = polkadotJsUrl.settings;
    return currentNetworkIdx.value === endpointKey.ASTAR
      ? astar
      : currentNetworkIdx.value === endpointKey.SHIDEN
      ? shiden
      : shibuya;
  });

  // Memo: delete it after runtime updating on Astar
  const isEvmDappStaking = computed<boolean>(() => {
    return currentNetworkIdx.value === endpointKey.SHIBUYA;
  });

  return {
    isMainnet,
    currentNetworkChain,
    currentNetworkIdx,
    evmNetworkIdx,
    currentNetworkName,
    nativeTokenSymbol,
    isSupportXvmTransfer,
    polkadotJsLink,
    isEvmDappStaking,
  };
}
