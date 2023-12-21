<template>
  <div class="wrapper--discover">
    <!-- Todo: Delete -->
    <!-- <staking-home /> -->
    <feature-dapp />
    <!-- <staking /> -->
    <leaderboard />
    <leaderboard-vote />
    <!-- <ad /> -->
    <dynamic-ads-area />

    <div class="container--dapps-data">
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
        <dapps category="DeFi" :search="searchText" />
        <dapps category="NFT" :search="searchText" />
        <dapps category="Tooling" :search="searchText" />
        <dapps category="Utility" :search="searchText" />
        <dapps category="Others" :search="searchText" />
      </div>
      <data-list v-if="displayIndex === 1" />
    </div>

    <div class="bg--discover" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FeatureDapp from './FeatureDapp.vue';
// import Ad from './Ad.vue';
import Dapps from './Dapps.vue';
import Leaderboard from './leaderboard/Leaderboard.vue';
import LeaderboardVote from './leaderboard/LeaderboardVote.vue';
// import Staking from './my-staking/Staking.vue';
import DataList from './data/DataList.vue';
import DynamicAdsArea from './DynamicAdsArea.vue';
import ToggleButtons from './ToggleButtons.vue';

export default defineComponent({
  components: {
    FeatureDapp,
    // Ad,
    Dapps,
    Leaderboard,
    LeaderboardVote,
    // Staking,
    DataList,
    DynamicAdsArea,
    ToggleButtons,
  },
  setup() {
    const displayIndex = ref<number>(0);

    const toggleDapps = (index: number): void => {
      displayIndex.value = index;
    };

    const searchText = ref('');

    return { displayIndex, searchText, toggleDapps };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/discover-v3.scss';
</style>
