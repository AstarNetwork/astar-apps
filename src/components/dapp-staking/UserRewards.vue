<template>
  <div class="container user-rewards-container">
    <div class="row">
      <span class="title container--title--color">Your Rewards</span>
    </div>
    <div class="user-rewards-panel">
      <CompoundReward />
      <ClaimAll />
      <Withdraw :show-unbonded-funds="true" />
      <Withdraw :show-unbonded-funds="false" :show-unbonding-chunks="true" />
    </div>
  </div>
</template>

<script>
import CompoundReward from 'src/components/dapp-staking/statistics/CompoundReward.vue';
import ClaimAll from 'src/components/dapp-staking/ClaimAll.vue';
import Withdraw from 'src/components/dapp-staking/statistics/Withdraw.vue';

export default {
  components: {
    CompoundReward,
    ClaimAll,
    Withdraw,
  },
  setup() {},
};
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards.scss';
</style>