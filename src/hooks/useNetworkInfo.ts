import {
  ASTAR_EVM_NETWORK_IDX,
  ASTAR_NATIVE_TOKEN,
  ASTAR_NETWORK_IDX,
  getProviderIndex,
  providerEndpoints,
} from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed } from 'vue';

export function useNetworkInfo() {
  const store = useStore();

  const isMainnet = computed<boolean>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const network = chainInfo ? chainInfo.chain : '';
    const isTestnet = network === 'Development' || network === 'Shibuya Testnet';
    return !isTestnet;
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
    return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
  });

  const nativeTokenSymbol = computed<ASTAR_NATIVE_TOKEN>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  return {
    isMainnet,
    currentNetworkIdx,
    evmNetworkIdx,
    currentNetworkName,
    nativeTokenSymbol,
  };
}
