<template>
  <div
    class="panel"
    :style="`background-image: url('${
      isShiden ? hero_img.shiden_hero : hero_img.astar_hero
    }'); margin-top: 40px;`"
  >
    <div class="wrapper--title">
      <div class="txt--title animate__animated animate__zoomInRight">
        {{ $t('topMetric.build2earn') }}
      </div>
      <div class="txt--subtitle animate__animated animate__fadeIn animate__delay-1s">
        {{ $t('topMetric.wayOfStaking') }}
      </div>
    </div>
    <div class="wrapper--cards">
      <div class="card">
        <p>
          {{ $t('topMetric.tvlInDapps') }}
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('topMetric.tvlInDapps') }}</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="!tvl" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">
            {{ formatNumber(tvl.tvlDefaultUnit, 2) }} ASTR (${{ formatNumber(tvl.tvlUsd, 1) }})
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          {{ $t('topMetric.currentEra') }}
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('topMetric.currentEra') }}</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">
            <div>{{ item.currentEra }}</div>
            <div class="detail-value">(ETA {{ item.currentEraETA }})</div>
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          {{ $t('topMetric.currentStakersApr') }}
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('topMetric.currentStakersApr') }}</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">{{ item.currentAPR.toFixed(2) }}%</div>
        </div>
      </div>
      <div class="card">
        <p>
          {{ $t('topMetric.totalDapps') }}
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('topMetric.totalDapps') }}</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" animation="fade" />
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
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { TvlModel } from 'src/v2/models';
import { endpointKey } from 'src/config/chainEndpoints';
import { formatNumber } from 'src/modules/token-api';

export default defineComponent({
  setup() {
    const store = useStore();
    const dappsCount = computed<DappCombinedInfo[]>(
      () => store.getters['dapps/getRegisteredDapps']().length
    );
    const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);
    const currentEra = computed<number>(() => store.getters['dapps/getCurrentEra']);
    const tvl = computed<TvlModel>(() => store.getters['dapps/getTvl']);

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

    return {
      hero_img,
      item,
      isLoading,
      isShiden,
      dappsCount,
      currentBlock,
      currentEra,
      tvl,
      formatNumber,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/top-metric.scss';
</style>
