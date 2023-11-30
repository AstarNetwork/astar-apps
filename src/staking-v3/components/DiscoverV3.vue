<template>
  <div class="wrapper--discover">
    <!-- Todo: Delete -->
    <staking-home />
    <feature-dapp />
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

export default defineComponent({
  components: {
    StakingHome,
    FeatureDapp,
    Ad,
    Dapps,
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use './styles/discover-v3.scss';
</style>
