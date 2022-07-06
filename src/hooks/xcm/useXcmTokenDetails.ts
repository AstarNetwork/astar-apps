import { getProviderIndex } from 'src/config/chainEndpoints';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { getXcmToken, XcmTokenInformation } from 'src/modules/xcm';
import { SDN } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { computed, Ref } from 'vue';

export function useXcmTokenDetails(selectedToken: Ref<ChainAsset>) {
  const store = useStore();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const isAstarNativeTransfer = computed<boolean>(() => {
    const symbol = String(selectedToken.value.metadata.symbol);
    return symbol === 'SDN' || symbol === 'ASTR';
  });

  const tokenDetails = computed<XcmTokenInformation | undefined>(() => {
    if (!selectedToken || !selectedToken.value) {
      return undefined;
    }
    if (isAstarNativeTransfer.value) {
      return SDN;
    } else {
      const t = getXcmToken({
        id: selectedToken.value.id,
        currentNetworkIdx: currentNetworkIdx.value,
      });
      return t;
    }
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
