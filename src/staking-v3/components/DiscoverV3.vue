<template>
  <div>
    <div class="wrapper--discover">
      <period-info-vote />
      <period-info-build />
      <div class="wrapper--voting--wizard">
        <voting-wizard />
      </div>
      <leaderboard />
      <!-- <leaderboard-vote /> -->
      <div v-if="isVotingPeriod" class="v-spacer"></div>
      <dynamic-ads-area />

      <div
        class="container--dapps-data"
        :style="{ backgroundImage: `url(${require('src/staking-v3/assets/grid_bg.svg')})` }"
      >
        <div class="container--dapps-data__inner">
          <div class="row--dapps-data-header">
            <toggle-buttons
              :captions="[$t('stakingV3.ourDapps'), $t('stakingV3.ourData')]"
              @button-selected="toggleDapps"
            />
            <input
              v-if="displayIndex === 0"
              v-model="searchText"
              type="text"
              :placeholder="$t('stakingV3.searchDapps')"
              class="input--search"
            />
          </div>
          <div v-if="displayIndex === 0" class="dapps">
            <dapps category="defi" :search="searchText" />
            <dapps category="nft" :search="searchText" />
            <dapps category="tooling" :search="searchText" />
            <dapps category="utility" :search="searchText" />
            <dapps category="others" :search="searchText" />
            <dapps category="unstoppable-grants" :search="searchText" />
          </div>
          <div v-if="displayIndex === 1">
            <period-stats :period="previousPeriod" />
            <data-list />
          </div>
        </div>
      </div>
    </div>
    <div
      class="bg--discover"
      :style="{
        backgroundImage: `url(${require('src/staking-v3/assets/dapp_staking_period002_bg.webp')})`,
      }"
    />
    <maintenance-mode />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { useDappStaking } from '../hooks';
import Dapps from './Dapps.vue';
import DynamicAdsArea from './DynamicAdsArea.vue';
import DataList from './data/DataList.vue';
import Leaderboard from './leaderboard/Leaderboard.vue';
import PeriodInfoVote from './PeriodInfoVote.vue';
import PeriodInfoBuild from './PeriodInfoBuild.vue';
import VotingWizard from './vote/VotingWizard.vue';
import PeriodStats from './PeriodStats.vue';
import ToggleButtons from './ToggleButtons.vue';
import MaintenanceMode from './MaintenanceMode.vue';

export default defineComponent({
  components: {
    Dapps,
    Leaderboard,
    DataList,
    DynamicAdsArea,
    PeriodInfoVote,
    PeriodInfoBuild,
    VotingWizard,
    PeriodStats,
    ToggleButtons,
    MaintenanceMode,
  },
  setup() {
    const { isZkEvm, isAstarZkEvm, currentNetworkIdx } = useNetworkInfo();
    const { protocolState, isVotingPeriod } = useDappStaking();
    const { t } = useI18n();
    const store = useStore();

    const displayIndex = ref<number>(0);

    const previousPeriod = computed<number>(() =>
      protocolState.value ? Math.max(1, protocolState.value.periodInfo.number - 1) : 1
    );

    const toggleDapps = (index: number): void => {
      displayIndex.value = index;
    };

    const searchText = ref<string>('');

    watch(
      [isZkEvm],
      () => {
        if (isZkEvm.value) {
          const networkSupport = isAstarZkEvm ? 'Astar EVM' : 'Shibuya EVM';
          const networkNotSupport = providerEndpoints[currentNetworkIdx.value].displayName;
          store.dispatch('general/showAlertMsg', {
            msg: t('warning.stakingNotSupportZkEvm', { networkNotSupport, networkSupport }),
            alertType: 'error',
          });
        }
      },
      { immediate: true }
    );

    return { searchText, previousPeriod, displayIndex, toggleDapps, isVotingPeriod };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/discover-v3.scss';

.v-spacer {
  width: 100%;
  position: relative;
  background-color: $navy-1;
  background-size: 100% auto;
  height: 40px;
  margin-bottom: 0px;

  @media (min-width: $lg) {
    height: 100px;
  }
}
</style>
