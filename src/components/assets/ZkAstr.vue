<template>
  <div data-testid="evm-native-token">
    <!-- Total balance -->
    <div class="row--header">
      <div class="row--header__left">
        <div class="column--token-name">
          <img class="token-logo" :src="astrTokenImg" :alt="astrTokenSymbol" />
          <template v-if="astrTokenSymbol">
            <span class="text--title">{{ astrTokenSymbol }}</span>
          </template>
          <template v-else>
            <q-skeleton animation="fade" class="skeleton--md" />
          </template>
        </div>
      </div>
      <div class="row--header__right">
        <div class="column--balance">
          <span class="column--amount text--amount">
            <token-balance :balance="String(bal)" :symbol="astrTokenSymbol" />
          </span>
        </div>
      </div>
    </div>

    <div class="separator" />

    <!-- Transferable -->
    <div class="row row--transferable">
      <div class="row__info">
        <div class="column--label text--label">{{ $t('assets.transferable') }}</div>
        <div class="column--balance">
          <token-balance :balance="String(bal)" :symbol="astrTokenSymbol" />
        </div>
      </div>

      <div class="row__actions">
        <router-link to="/">
          <button class="btn btn--icon" :disabled="true">
            <astar-icon-bridge />
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </router-link>

        <router-link to="/">
          <button class="btn btn--icon" :disabled="true">
            <astar-icon-transfer />
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>
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
