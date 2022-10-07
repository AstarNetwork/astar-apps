<template>
  <div
    class="panel"
    :style="`background-image: url('${
      isShiden ? hero_img.shiden_hero : hero_img.astar_hero
    }'); margin-top: 40px;`"
  >
    <div class="wrapper--title">
      <div class="txt--title animate__animated animate__zoomInRight">Build2Earn</div>
      <div class="txt--subtitle animate__animated animate__fadeIn animate__delay-1s">
        An innovative way of Staking
      </div>
    </div>
    <div class="wrapper--cards">
      <div class="card">
        <p>
          TVL in dApps
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">TVL in dApps</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" />
          </div>
          <div v-else class="value">
            {{ item.tvl.toLocaleString() }} ASTR (${{ item.tvlUSD.toLocaleString() }})
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          Current Era
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">Current Era</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" />
          </div>
          <div v-else class="value">
            <div>{{ item.currentEra }}</div>
            <div class="detail-value">(ETA {{ item.currentEraETA }})</div>
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          Current Stakers APR
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">Current Stakers APR</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" />
          </div>
          <div v-else class="value">{{ item.currentAPR.toFixed(2) }}%</div>
        </div>
      </div>
      <div class="card">
        <p>
          Total dApps
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">Total dApps</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" />
          </div>
          <div v-else class="value">{{ item.totalDapps.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { endpointKey } from 'src/config/chainEndpoints';
export default defineComponent({
  setup() {
    const hero_img = {
      astar_hero: require('/src/assets/img/astar_hero.png'),
      shiden_hero: require('/src/assets/img/shiden_hero.png'),
    };
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const item = {
      tvl: 2.933,
      tvlUSD: 139.5,
      currentEra: 120,
      currentEraETA: '06:20 10-Jun',
      currentAPR: 10.23,
      totalDapps: 120,
    };
    const isLoading = ref(true);

    return { hero_img, item, isLoading, isShiden };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/top-metric.scss';
</style>
