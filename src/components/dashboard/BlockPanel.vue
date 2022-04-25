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
              <vue-odometer
                class="text--status text-color--neon"
                format=",ddd"
                animation="smooth"
                :value="latestBlock"
              />
            </div>
          </div>
        </div>

        <div class="box--block-information">
          <div class="column-block">
            <div class="column--label">
              <div class="column--block-time">
                <span class="text--accent">{{ $t('dashboard.block.blockTime') }}</span>
                <div>
                  <div>
                    <span class="material-symbols-outlined icon--help"> help </span>
                  </div>
                  <q-tooltip>
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
                            <span class="text--tooltip">{{
                              $t('dashboard.block.thirtyEras')
                            }}</span>
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

      <div v-if="progress" class="box--era-information">
        <div class="column--label">
          <span class="text--accent">{{ $t('dashboard.block.era') }}</span>
        </div>
        <div class="block__column--era">
          <div>
            <span class="text--label text-color--neon">
              {{ $n(era) }}
            </span>
          </div>
          <div class="column--bar">
            <div class="bar__top">
              <q-linear-progress rounded size="12px" :value="progress * 0.01"> </q-linear-progress>
              <div class="row--block-next-era">
                <div class="column--block-next-era">
                  <span>
                    {{ $n(blocksUntilNextEra) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="bar__bottom">
              <span class="text--status text-color--neon">
                {{ $t('dashboard.block.progress', { value: progress }) }}
              </span>
              <span class="text--label">
                {{ $t('dashboard.block.eta', { value: etaNextEra }) }}
              </span>
            </div>
          </div>
          <div>
            <span class="text--label">
              {{ $n(era + 1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAvgBlockTime } from 'src/hooks';
import VueOdometer from 'v-odometer/src';
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    'vue-odometer': VueOdometer,
  },
  setup() {
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[1]);
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
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/block-panel.scss';
</style>
