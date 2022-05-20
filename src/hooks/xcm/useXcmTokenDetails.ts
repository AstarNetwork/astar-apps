import { getProviderIndex } from 'src/config/chainEndpoints';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { getXcmToken, XcmTokenInformation } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, Ref, ref } from 'vue';

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
      return require('/src/assets/img/ic_coin-placeholder.png');
    }
    return tokenDetails.value.logo;
  });

  const isNativeToken = computed<boolean>(() => {
    if (!tokenDetails || !tokenDetails.value) {
      return false;
    }
    return tokenDetails.value.isNativeToken;
  });

  const isDisplayToken = computed<boolean>(() => {
    // Todo: fetch the balance in relaychain
    const isDisplay =
      Number(selectedToken?.value.userBalance) > 0 || tokenDetails.value?.isXcmCompatible;
    return isDisplay || false;
  });

  const isXcmCompatible = computed<boolean>(() => {
    if (!tokenDetails.value) return false;
    return tokenDetails.value.isXcmCompatible;
  });

  return {
    tokenImage,
    isNativeToken,
    tokenDetails,
    isDisplayToken,
    isXcmCompatible,
  };
}
