<template>
  <div v-if="isLoading">
    <q-skeleton class="skeleton--chart" />
  </div>
  <div v-else class="container container--block">
    <div class="row">
      <span class="text--accent container--title--color">{{ $t('dashboard.block.block') }}</span>
    </div>

    <div class="container--block-information">
      <div class="container__box-stats">
        <div class="box--block-information">
          <div class="column-block">
            <div class="column--label">
              <span class="text--accent">{{ $t('dashboard.block.blockHeight') }}</span>
            </div>
            <div class="block__column--value">
              <span class="text--status text-color--neon">
                {{ $n(latestBlock) }}
              </span>
            </div>
          </div>
        </div>

        <div class="box--block-information">
          <div class="column-block">
            <div class="column--label">
              <div class="column--block-time">
                <span class="text--accent">{{ $t('dashboard.block.blockTime') }}</span>
                <div>
                  <q-icon class="icon--tips" :name="outlinedTipsAndUpdates" size="18px" />
                  <q-tooltip>
                    <span class="text--tooltip">{{ $t('dashboard.block.erasAverage') }}</span>
                  </q-tooltip>
                </div>
              </div>
            </div>
            <div class="block__column--value">
              <span class="text--status text-color--neon">
                {{ $n(Number(avgBlockTime)) }}
              </span>
              <span class="text--xlg">{{ $t('dashboard.block.secs') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="progress" class="box--era-information">
        <div class="column--label">
          <span class="text--accent">{{ $t('dashboard.block.era') }}</span>
        </div>
        <div class="block__column--era">
          <div>
            <span class="text--era text-color--neon">
              {{ $n(era) }}
            </span>
          </div>
          <div class="column--bar">
            <div class="bar__top">
              <span class="text--label">
                {{ $t('dashboard.block.progress', { value: progress }) }}
              </span>
              <span class="text--label">
                {{ $t('dashboard.block.eta', { value: etaNextEra }) }}
              </span>
            </div>
            <div class="bar__bottom">
              <q-linear-progress rounded size="12px" :value="progress * 0.01"> </q-linear-progress>
              <div class="row--block-next-era">
                <div class="column--block-next-era">
                  <span>
                    {{ $n(blocksUntilNextEra) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span class="text--era text-color--neon">
              {{ $n(era + 1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { outlinedTipsAndUpdates } from '@quasar/extras/material-icons-outlined';
import { useAvgBlockTime } from 'src/hooks';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const { isLoading, avgBlockTime, latestBlock, era, blocksUntilNextEra, progress, etaNextEra } =
      useAvgBlockTime();

    return {
      avgBlockTime,
      latestBlock,
      era,
      blocksUntilNextEra,
      progress,
      etaNextEra,
      isLoading,
      outlinedTipsAndUpdates,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/block-panel.scss';
</style>
