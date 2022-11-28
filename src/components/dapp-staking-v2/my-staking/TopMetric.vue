<template>
  <div
    class="panel"
    :style="`background-image: url('${isShiden ? hero_img.shiden_hero : hero_img.astar_hero}');`"
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
        </p>
        <div class="row--data">
          <div v-if="!tvl" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="column--tvl">
            <div class="txt--tvl">
              {{ formatNumber(tvl.tvlDefaultUnit, 2) }} {{ nativeTokenSymbol }}
            </div>
            <div>(${{ formatNumber(tvl.tvlUsd, 1) }})</div>
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          {{ $t('topMetric.currentEra') }}
        </p>
        <div class="row--data">
          <div v-if="!currentEra" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">
            <div>{{ currentEra.toString() }}</div>
            <!-- <div class="detail-value">(ETA {{ item.currentEraETA }})</div> -->
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          {{ $t('topMetric.currentStakersApr') }}
        </p>
        <div class="row--data">
          <div v-if="!aprPercent" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">{{ aprPercent }}%</div>
        </div>
      </div>
      <!-- <div class="card">
        <p>
          {{ $t('topMetric.currentBlock') }}
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('topMetric.currentBlock') }}</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div v-if="!currentBlock" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">{{ currentBlock }}</div>
        </div>
      </div> -->
      <div class="card">
        <p>
          {{ $t('topMetric.totalDapps') }}
        </p>
        <div class="row--data">
          <div v-if="!dappsCount" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">{{ dappsCount.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useNetworkInfo, useApr } from 'src/hooks';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { TvlModel } from 'src/v2/models';
import { endpointKey } from 'src/config/chainEndpoints';
import { formatNumber } from 'src/modules/token-api';

export default defineComponent({
  setup() {
    const store = useStore();
    const { stakerApr } = useApr();
    const dappsCount = computed<DappCombinedInfo[]>(
      () => store.getters['dapps/getRegisteredDapps']().length
    );
    const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);
    const currentEra = computed<number>(() => store.getters['dapps/getCurrentEra']);
    const tvl = computed<TvlModel>(() => store.getters['dapps/getTvl']);
    const aprPercent = computed(() => Number(stakerApr.value).toFixed(1));

    const hero_img = {
      astar_hero: require('/src/assets/img/astar_hero.png'),
      shiden_hero: require('/src/assets/img/shiden_hero.png'),
    };
    const { currentNetworkIdx, nativeTokenSymbol } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const isLoading = ref(true);

    return {
      hero_img,
      isLoading,
      isShiden,
      dappsCount,
      currentBlock,
      currentEra,
      aprPercent,
      tvl,
      formatNumber,
      nativeTokenSymbol,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/top-metric.scss';
</style>
