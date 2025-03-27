import {
  ASTAR_CHAIN,
  ASTAR_EVM_NETWORK_IDX,
  ASTAR_NATIVE_TOKEN,
  ASTAR_NETWORK_IDX,
  astarChain,
} from 'src/config/chain';
import { endpointKey, getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { polkadotJsUrl } from 'src/links';
import { CcipNetworkParam } from 'src/modules/ccip-bridge';
import { getTokenImage } from 'src/modules/token';
import { buildCcipBridgePageLink } from 'src/router/utils';
import { useStore } from 'src/store';
import { computed } from 'vue';

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

  const isZkEvm = computed<boolean>(
    () =>
      currentNetworkIdx.value === endpointKey.ZKYOTO ||
      currentNetworkIdx.value === endpointKey.ASTAR_ZKEVM
  );

  const isAstarZkEvm = computed<boolean>(() => currentNetworkIdx.value === endpointKey.ASTAR_ZKEVM);
  const isAstar = computed<boolean>(() => currentNetworkIdx.value === endpointKey.ASTAR);
  const isShibuya = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIBUYA);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isShibuyaEvm = computed<boolean>(() => {
    return isH160.value && isShibuya.value;
  });
  const isAstarEvm = computed<boolean>(() => {
    return isH160.value && isAstar.value;
  });

  const currentNetworkChain = computed<ASTAR_CHAIN>(() => {
    if (isZkEvm.value) {
      return providerEndpoints[currentNetworkIdx.value].displayName;
    }
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return chain;
  });

  const currentNetworkIdx = computed<ASTAR_NETWORK_IDX>(() => {
    const networkIdx = store.getters['general/networkIdx'];
    if (networkIdx === endpointKey.ZKYOTO || networkIdx === endpointKey.ASTAR_ZKEVM) {
      return networkIdx;
    }
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const evmNetworkIdx = computed<ASTAR_EVM_NETWORK_IDX>(() => {
    return Number(providerEndpoints[currentNetworkIdx.value].evmChainId) as ASTAR_EVM_NETWORK_IDX;
  });

  // Memo: for showing substrate data if users connect to zkEVM network
  const networkNameSubstrate = computed<string>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return chain === astarChain.SHIBUYA
      ? 'Shibuya'
      : chain === astarChain.ROCSTAR
      ? 'Rocstar'
      : chain;
  });

  const dappStakingCurrency = computed<string>(() => {
    // Memo: avoid displaying 'ETH'
    if (isZkEvm.value) {
      return isAstarZkEvm.value ? 'ASTR' : 'SBY';
    } else {
      return nativeTokenSymbol.value;
    }
  });

  const currentNetworkName = computed<string>(() => {
    if (isZkEvm.value) {
      return providerEndpoints[currentNetworkIdx.value].displayName.replace(' Network', '');
    } else {
      return networkNameSubstrate.value;
    }
  });

  const nativeTokenSymbol = computed<ASTAR_NATIVE_TOKEN>(() => {
    if (isZkEvm.value) {
      return 'ETH';
    }
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const nativeTokenImg = computed<string>(() =>
    getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
  );

  const isSupportAuTransfer = computed<boolean>(() => {
    return !isMainnet.value && !isZkEvm.value;
  });

  const polkadotJsLink = computed<string>(() => {
    const { astar, shiden, shibuya } = polkadotJsUrl.settings;
    return currentNetworkIdx.value === endpointKey.ASTAR
      ? astar
      : currentNetworkIdx.value === endpointKey.SHIDEN
      ? shiden
      : shibuya;
  });

  const ccipSoneiumLink = computed<string>(() => {
    return buildCcipBridgePageLink(
      isShibuyaEvm.value
        ? { from: CcipNetworkParam.ShibuyaEvm, to: CcipNetworkParam.SoneiumMinato }
        : { from: CcipNetworkParam.AstarEvm, to: CcipNetworkParam.Soneium }
    );
  });

  const ccipEthereumLink = computed<string>(() => {
    return buildCcipBridgePageLink(
      isShibuyaEvm.value
        ? { from: CcipNetworkParam.ShibuyaEvm, to: CcipNetworkParam.Sepolia }
        : { from: CcipNetworkParam.AstarEvm, to: CcipNetworkParam.Ethereum }
    );
  });

  return {
    isMainnet,
    currentNetworkChain,
    currentNetworkIdx,
    evmNetworkIdx,
    currentNetworkName,
    nativeTokenSymbol,
    isSupportAuTransfer,
    polkadotJsLink,
    isZkEvm,
    networkNameSubstrate,
    isAstarZkEvm,
    isAstar,
    dappStakingCurrency,
    isH160,
    nativeTokenImg,
    isShibuya,
    isShibuyaEvm,
    isAstarEvm,
    ccipSoneiumLink,
    ccipEthereumLink,
  };
}
