<template>
  <div v-if="isLoading">
    <q-skeleton class="skeleton--chart" />
  </div>
  <div v-else class="container--block">
    <div class="left-panel">
      <div class="value-panel">
        <div class="column--label">
          <span class="text--md">{{ $t('dashboard.block.blockHeight') }}</span>
        </div>
        <div class="block__column--value">
          <vue-odometer
            class="text--status text-color--neon"
            format=",ddd"
            animation="smooth"
            :value="latestBlock"
          />
        </div>
      </div>
      <div class="box--block-information value-panel">
        <div class="column-block">
          <div class="column--label">
            <div class="column--block-time">
              <span class="text--md">{{ $t('dashboard.block.blockTime') }}</span>
              <div v-click-away="setIsMobileDisplayTooltip" @click="setIsMobileDisplayTooltip">
                <astar-icon-help size="18" />
                <q-tooltip
                  v-model="isDisplayTooltip"
                  anchor="top middle"
                  self="bottom middle"
                  class="box--tooltip width-auto"
                >
                  <div>
                    <div>
                      <span class="text--tooltip">{{ $t('dashboard.block.avgBlockTime') }}</span>
                    </div>
                    <div>
                      <div class="box--avg-time">
                        <div class="row--avg-era">
                          <span class="text--tooltip">{{ $t('dashboard.block.oneEra') }}</span>
                          <span class="text--tooltip"> {{ $n(avgBlockTime1Era) }}</span>
                        </div>
                        <div class="row--avg-era">
                          <span class="text--tooltip">{{ $t('dashboard.block.sevenEras') }}</span>
                          <span class="text--tooltip"> {{ $n(avgBlockTime7Eras) }} </span>
                        </div>
                        <div class="row--avg-era">
                          <span class="text--tooltip">{{ $t('dashboard.block.thirtyEras') }}</span>
                          <span class="text--tooltip">{{ $n(avgBlockTime30Eras) }} </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-tooltip>
              </div>
            </div>
          </div>
          <div class="block__column--value">
            <span class="text--status text-color--neon">
              {{ $n(Number(avgBlockTime1Era)) }}
            </span>
            <span class="text--xlg">{{ $t('dashboard.block.secs') }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="box--era-information value-panel">
      <div class="column--label">
        <span class="text--md">{{ $t('dashboard.block.era') }}</span>
      </div>
      <div class="block__column--value">
        <vue-odometer class="text--status text-color--neon" animation="smooth" :value="era" />
      </div>
      <div>
        <div class="era-chart">
          <q-circular-progress
            show-value
            :value="progress"
            :thickness="0.25"
            color="blue-10"
            :track-color="isDarkTheme ? 'indigo-10' : 'grey-2'"
            size="100px"
            font-size="16px"
          >
            {{ progress }}%
          </q-circular-progress>
        </div>
        <div class="eta">
          {{ $t('dashboard.block.eta', { value: etaNextEra }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useAvgBlockTime, useTooltip } from 'src/hooks';
import VueOdometer from 'v-odometer/src';
import { useRouter } from 'vue-router';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    'vue-odometer': VueOdometer,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[1]);
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const {
      isLoading,
      avgBlockTime1Era,
      avgBlockTime7Eras,
      avgBlockTime30Eras,
      latestBlock,
      era,
      blocksUntilNextEra,
      progress,
      etaNextEra,
    } = useAvgBlockTime(path.value);

    return {
      avgBlockTime1Era,
      latestBlock,
      era,
      blocksUntilNextEra,
      progress,
      etaNextEra,
      isLoading,
      avgBlockTime7Eras,
      avgBlockTime30Eras,
      isDisplayTooltip,
      isDarkTheme,
      setIsMobileDisplayTooltip,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/block-panel.scss';
</style>
