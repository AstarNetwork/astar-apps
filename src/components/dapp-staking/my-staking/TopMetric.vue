<template>
  <div class="panel">
    <div class="wrapper--title">
      <div class="txt--title animate__animated animate__zoomInRight">
        {{ $t('topMetric.build2earn') }}
      </div>
      <div class="txt--subtitle animate__animated animate__fadeIn animate__delay-1s">
        {{ $t('topMetric.wayOfStaking') }}
      </div>
    </div>

    <div class="wrapper--cards">
      <div class="cards">
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
            {{ $t('topMetric.stakersRewards') }}
          </p>
          <div class="row--data">
            <div v-if="!percentage" class="loading">
              <q-skeleton type="rect" animation="fade" />
            </div>
            <div v-else class="value">
              <div class="column--apr-apy">
                <div :class="isApr ? 'button--active' : 'button--not-active'" @click="isApr = true">
                  <span> {{ $t('topMetric.apr') }}</span>
                </div>
                <div
                  :class="!isApr ? 'button--active' : 'button--not-active'"
                  @click="isApr = false"
                >
                  <span> {{ $t('topMetric.apy') }}</span>
                </div>
              </div>
              <div>
                <span>{{ percentage }}%</span>
              </div>
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
              <div class="row--era-info">
                <div class="column--era-info">
                  <div>{{ currentEra.toString() }}</div>
                  <div v-if="etaNextEra" class="text--eta-next-era">
                    {{ $t('topMetric.eraInfo', { eta: etaNextEra }) }}
                  </div>
                </div>
                <div v-if="etaNextEra && !isLoading" class="box-pie-chart">
                  <pie-chart
                    :percentage="progress"
                    bold="3px"
                    width="44px"
                    color="#0085ff"
                    font-size="11px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
  </div>
</template>
<script lang="ts">
import { formatNumber } from '@astar-network/astar-sdk-core';
import { BN } from '@polkadot/util';
import { $api } from 'src/boot/api';
import PieChart from 'src/components/common/PieChart.vue';
import { endpointKey } from 'src/config/chainEndpoints';
import {
  AccountLedger,
  RewardDestination,
  useAccount,
  useAprFromApi,
  useAvgBlockTimeApi,
  useCurrentEra,
  useNetworkInfo,
} from 'src/hooks';
import { useStore } from 'src/store';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, SmartContractState } from 'src/v2/models/DappsStaking';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: { PieChart },
  setup() {
    const store = useStore();
    const { stakerApr, stakerApy } = useAprFromApi();
    const { senderSs58Account } = useAccount();
    const dappsCount = computed<number>(
      () =>
        store.getters['dapps/getRegisteredDapps']().filter(
          (x: DappCombinedInfo) => x.contract.state === SmartContractState.Registered
        ).length
    );
    const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);
    const currentEra = computed<number>(() => store.getters['dapps/getCurrentEra']);
    const tvl = computed<TvlModel>(() => store.getters['dapps/getTvl']);
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[1]);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const { progress } = useCurrentEra();
    const { etaNextEra } = useAvgBlockTimeApi(path.value);

    const hero_img = {
      astar_hero: require('/src/assets/img/astar_hero.svg'),
      shiden_hero: require('/src/assets/img/shiden_hero.png'),
    };
    const { currentNetworkIdx, nativeTokenSymbol } = useNetworkInfo();
    const isShiden = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIDEN);

    const isApr = ref<boolean>(true);
    const percentage = computed(() =>
      Number((isApr.value ? stakerApr.value : stakerApy.value).toFixed(1))
    );

    const checkIsCompoundingAccount = async (): Promise<void> => {
      try {
        const ledger = await $api?.query.dappsStaking.ledger<AccountLedger>(
          senderSs58Account.value
        );
        const isStaker = ledger && !ledger.locked.eq(new BN(0));
        const isCompounding = ledger?.toJSON().rewardDestination === RewardDestination.StakeBalance;
        isApr.value = isStaker ? !isCompounding : true;
      } catch (error) {
        console.error(error);
      }
    };

    watch(
      [senderSs58Account],
      async () => {
        if (!senderSs58Account.value) return;
        await checkIsCompoundingAccount();
      },
      { immediate: false }
    );

    return {
      hero_img,
      isShiden,
      dappsCount,
      currentBlock,
      currentEra,
      tvl,
      formatNumber,
      nativeTokenSymbol,
      progress,
      etaNextEra,
      isApr,
      percentage,
      isLoading,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/top-metric.scss';
</style>
