<template>
  <div data-testid="evm-native-token">
    <div class="border--separator border--margin" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img class="token-logo" :src="astrTokenImg" :alt="astrTokenSymbol" />
            <div v-if="astrTokenSymbol && networkNameSubstrate" class="column--ticker">
              <span class="text--title">{{ astrTokenSymbol }}</span>
              <span class="text--label">{{ networkNameSubstrate }}</span>
            </div>
            <div v-else>
              <q-skeleton animation="fade" class="skeleton--md" />
            </div>
          </div>
        </div>
        <div class="row__right row__right--evm-native-token">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <token-balance :balance="String(bal)" :symbol="astrTokenSymbol" />
              </div>
              <div class="text--label">
                <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--native-token">
            <router-link to="/">
              <button class="btn btn--sm" :disabled="true">
                {{ $t('assets.bridge') }}
              </button>
            </router-link>
            <router-link to="/">
              <button class="btn btn--sm" :disabled="true">
                {{ $t('assets.transfer') }}
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getUsdBySymbol } from '@astar-network/astar-sdk-core';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import { useNetworkInfo } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: { TokenBalance },
  setup() {
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);

    const { networkNameSubstrate, isMainnet } = useNetworkInfo();
    const store = useStore();

    const astrTokenSymbol = computed<ASTAR_NATIVE_TOKEN>(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const astrTokenImg = computed<string>(() =>
      getTokenImage({
        isNativeToken: true,
        symbol: astrTokenSymbol.value,
        isZkEvm: false,
      })
    );

    // Todo: fetch balance after wrapped tokens are deployed
    const handleAstrPrice = async () => {
      const tokenSymbolRef = astrTokenSymbol.value;
      if (!tokenSymbolRef) return;
      try {
        if (isMainnet.value) {
          const price = await getUsdBySymbol(tokenSymbolRef);
          balUsd.value = bal.value * price;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    watchEffect(handleAstrPrice);

    return {
      astrTokenImg,
      astrTokenSymbol,
      networkNameSubstrate,
      bal,
      balUsd,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
