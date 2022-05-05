<template>
  <div v-if="isStaker" class="wrapper--user-rewards-container">
    <div class="container user-rewards-container dark:tw-bg-darkGray-800">
      <div class="row">
        <span class="title container--title--color">Your Rewards</span>
      </div>
      <div class="user-rewards-panel">
        <ClaimAll />
        <CompoundReward />
        <Withdraw :show-unbonded-funds="true" />
        <Withdraw :show-unbonded-funds="false" :show-unbonding-chunks="true" />
      </div>
    </div>
  </div>
</template>

<script>
import CompoundReward from 'src/components/dapp-staking/statistics/CompoundReward.vue';
import ClaimAll from 'src/components/dapp-staking/ClaimAll.vue';
import Withdraw from 'src/components/dapp-staking/statistics/Withdraw.vue';
import { useCompoundRewards } from 'src/hooks/dapps-staking/useCompoundRewards';

export default {
  components: {
    CompoundReward,
    ClaimAll,
    Withdraw,
  },
  setup() {
    const { isStaker } = useCompoundRewards();

    return {
      isStaker,
    };
  },
};
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards.scss';
</style>
