<template>
  <div class="wrapper--discover">
    <!-- Todo: Delete -->
    <staking-home />
    <feature-dapp />
    <leaderboard />
    <ad />
    <dapps />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StakingHome from './StakingHome.vue';
import FeatureDapp from './FeatureDapp.vue';
import Ad from './Ad.vue';
import Dapps from './Dapps.vue';
import Leaderboard from './leaderboard/Leaderboard.vue';

export default defineComponent({
  components: {
    StakingHome,
    FeatureDapp,
    Ad,
    Dapps,
    Leaderboard,
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use './styles/discover-v3.scss';
</style>
