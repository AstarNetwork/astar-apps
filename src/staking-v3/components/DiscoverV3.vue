<template>
  <div class="wrapper--discover">
    <!-- Todo: Delete -->
    <!-- <staking-home /> -->
    <feature-dapp />
    <staking />
    <leaderboard />
    <ad />
    <dapps />
    <data-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FeatureDapp from './FeatureDapp.vue';
import Ad from './Ad.vue';
import Dapps from './Dapps.vue';
import Leaderboard from './leaderboard/Leaderboard.vue';
import Staking from './my-staking/Staking.vue';
import DataList from './data/DataList.vue';

export default defineComponent({
  components: {
    FeatureDapp,
    Ad,
    Dapps,
    Leaderboard,
    Staking,
    DataList,
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use './styles/discover-v3.scss';
</style>
