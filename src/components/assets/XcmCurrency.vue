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
                <span
                  >{{ $n(Number(formattedSelectedTokenBalance)) }} {{ token.metadata.symbol }}</span
                >
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
import { getProviderIndex } from 'src/config/chainEndpoints';
import { useXcmBridge } from 'src/hooks';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { getXcmToken } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';

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
    const t = computed(() => token);
    const { formattedSelectedTokenBalance } = useXcmBridge(t);

    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    const tokenImage = computed(() => {
      const t = getXcmToken({
        symbol: String(token.metadata.symbol),
        currentNetworkIdx: currentNetworkIdx.value,
      });
      return t ? t.logo : require('/src/assets/img/ic_coin-placeholder.png');
    });

    return {
      tokenImage,
      formattedSelectedTokenBalance,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
