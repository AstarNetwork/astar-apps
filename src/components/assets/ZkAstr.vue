<template>
  <div data-testid="evm-native-token">
    <div class="row row--transferable row--transferable-evm">
      <div class="row__info">
        <div class="column--token-name">
          <img class="token-logo" :src="astrTokenImg" :alt="astrTokenSymbol" />
          <template v-if="astrTokenSymbol">
            <span class="text--title">{{ astrTokenSymbol }}</span>
          </template>
          <template v-else>
            <q-skeleton animation="fade" class="skeleton--md" />
          </template>
        </div>
        <div class="column--balance">
          <span class="column--amount text--amount">
            {{ isTruncate ? $n(truncate(bal, 3)) : Number(bal) }}
          </span>
          <span class="column--symbol text--symbol">{{ astrTokenSymbol }}</span>
        </div>
      </div>

      <div class="row__actions">
        <router-link to="/">
          <button class="btn btn--icon" :disabled="true">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </router-link>

        <router-link to="/">
          <button class="btn btn--icon" :disabled="true">
            <astar-icon-transfer />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getUsdBySymbol, truncate } from '@astar-network/astar-sdk-core';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import { useNetworkInfo } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {},
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

    const isTruncate = !astrTokenSymbol.value.toUpperCase().includes('BTC');

    return {
      astrTokenImg,
      astrTokenSymbol,
      networkNameSubstrate,
      bal,
      balUsd,
      isTruncate,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
