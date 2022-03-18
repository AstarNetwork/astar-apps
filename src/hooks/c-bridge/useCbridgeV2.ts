import {
  CbridgeToken,
  EvmChain,
  getSelectedToken,
  getTransferConfigs,
  SelectedToken,
} from 'src/c-bridge';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { objToArray } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';

const { Astar, Shiden } = EvmChain;

export function useCbridgeV2() {
  const tokens = ref<SelectedToken[] | null>(null);
  const store = useStore();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const updateBridgeConfig = async (srcChainId: EvmChain): Promise<void> => {
    const data = await getTransferConfigs(currentNetworkIdx.value);
    if (!data || !data.tokens) {
      throw Error('Cannot fetch from cBridge API');
    }
    tokens.value = await Promise.all(
      objToArray(data.tokens[srcChainId])
        .flat()
        .map((token: CbridgeToken) => {
          return getSelectedToken({ srcChainId, token });
        }) as SelectedToken[]
    );
  };

  watchEffect(async () => {
    if (
      currentNetworkIdx.value === endpointKey.ASTAR ||
      currentNetworkIdx.value === endpointKey.SHIDEN
    ) {
      const srcChainId = currentNetworkIdx.value === endpointKey.ASTAR ? Astar : Shiden;
      await updateBridgeConfig(srcChainId);
    }
  });

  return { tokens };
}
