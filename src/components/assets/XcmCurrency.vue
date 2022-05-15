<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img :src="tokenImage" alt="logo" class="token-logo" />
            <div class="column--ticker">
              <span class="text--title">{{ token.metadata.symbol }}</span>
              <span class="text--label">{{ token.metadata.name }}</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>{{ token.deposit }} {{ token.metadata.symbol }}</span>
              </div>
              <!-- <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div> -->
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--native">
            <button
              class="btn btn--sm"
              @click="
                handleModalXcmTransfer({
                  isOpen: true,
                  currency: token,
                })
              "
            >
              {{ $t('assets.transfer') }}
            </button>
            <div>
              <button
                class="btn btn--sm"
                @click="
                  handleModalXcmBridge({
                    isOpen: true,
                    currency: token,
                  })
                "
              >
                {{ $t('assets.xcm') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { addToEvmWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { XcmTokenInformation, xcmToken } from 'src/modules/xcm';

export default defineComponent({
  props: {
    token: {
      type: Object as PropType<ChainAsset>,
      required: true,
    },
    handleModalXcmTransfer: {
      type: Function,
      required: true,
    },
    handleModalXcmBridge: {
      type: Function,
      required: true,
    },
  },
  setup({ token }) {
    const store = useStore();
    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    const tokenImage = computed(() => {
      const symbol = String(token.metadata.symbol);
      type typeNetworkIdx = endpointKey.ASTAR | endpointKey.SHIDEN | endpointKey.SHIBUYA;
      const networkIdx = currentNetworkIdx.value as typeNetworkIdx;
      const t = xcmToken[networkIdx].find((it: XcmTokenInformation) => it.symbol === symbol);
      return t ? t.logo : require('/src/assets/img/ic_coin-placeholder.png');
    });

    return {
      addToEvmWallet,
      nativeTokenSymbol,
      tokenImage,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
