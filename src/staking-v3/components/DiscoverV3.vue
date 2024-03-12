<template>
  <div>
    <div class="wrapper--discover">
      <feature-dapp />
      <leaderboard />
      <leaderboard-vote />
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
          <data-list v-if="displayIndex === 1" />
        </div>
      </div>
    </div>
    <div class="bg--discover" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import Dapps from './Dapps.vue';
import FeatureDapp from './FeatureDapp.vue';
import Leaderboard from './leaderboard/Leaderboard.vue';
import LeaderboardVote from './leaderboard/LeaderboardVote.vue';
import DynamicAdsArea from './DynamicAdsArea.vue';
import ToggleButtons from './ToggleButtons.vue';
import DataList from './data/DataList.vue';
import { useDappStaking } from '../hooks';

export default defineComponent({
  components: {
    FeatureDapp,
    Dapps,
    Leaderboard,
    LeaderboardVote,
    DataList,
    DynamicAdsArea,
    ToggleButtons,
  },
  setup() {
    const displayIndex = ref<number>(0);
    const { warnIfLedger } = useDappStaking();

    const toggleDapps = (index: number): void => {
      displayIndex.value = index;
    };

    const searchText = ref<string>('');

    onMounted(() => {
      warnIfLedger();
    });

    return { displayIndex, searchText, toggleDapps };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/discover-v3.scss';
</style>
