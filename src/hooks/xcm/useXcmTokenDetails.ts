import { getProviderIndex } from 'src/config/chainEndpoints';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { getXcmToken, XcmTokenInformation } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, Ref } from 'vue';

export function useXcmTokenDetails(selectedToken: Ref<ChainAsset>) {
  const store = useStore();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const tokenDetails = computed<XcmTokenInformation | undefined>(() => {
    if (!selectedToken || !selectedToken.value) {
      return undefined;
    }
    const t = getXcmToken({
      symbol: String(selectedToken.value.metadata.symbol),
      currentNetworkIdx: currentNetworkIdx.value,
    });
    return t;
  });

  const tokenImage = computed<string>(() => {
    if (!tokenDetails || !tokenDetails.value) {
      return 'custom-token';
    }
    return tokenDetails.value.logo;
  });

  const isNativeToken = computed<boolean>(() => {
    if (!tokenDetails || !tokenDetails.value) {
      return false;
    }
    return tokenDetails.value.isNativeToken;
  });

  const isXcmCompatible = computed<boolean>(() => {
    if (!tokenDetails.value) return false;
    return tokenDetails.value.isXcmCompatible;
  });

  return {
    tokenImage,
    isNativeToken,
    tokenDetails,
    isXcmCompatible,
  };
}
