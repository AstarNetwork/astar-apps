<template>
  <div class="wrapper--discover">
    <!-- Todo: Delete -->
    <!-- <staking-home /> -->
    <feature-dapp />
    <!-- <staking /> -->
    <leaderboard />
    <!-- <ad /> -->
    <dynamic-ads-area />

    <div class="container--dapps-data">
      <div class="row--dapps-data-header">
        <toggle-buttons
          :captions="[$t('stakingV3.ourDapps'), $t('stakingV3.ourData')]"
          @button-selected="toggleDapps"
        />
        <div v-if="displayIndex === 0">
          <input
            v-model="searchText"
            type="text"
            :placeholder="$t('stakingV3.searchDapps')"
            class="input--search"
          />
        </div>
      </div>
      <dapps v-if="displayIndex === 0" :search="searchText" />
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
import Staking from './my-staking/Staking.vue';
import DataList from './data/DataList.vue';
import DynamicAdsArea from './DynamicAdsArea.vue';
import ToggleButtons from './ToggleButtons.vue';

export default defineComponent({
  components: {
    FeatureDapp,
    // Ad,
    Dapps,
    Leaderboard,
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