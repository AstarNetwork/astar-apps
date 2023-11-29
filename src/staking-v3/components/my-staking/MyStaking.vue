<template>
  <div class="wrapper--my-staking">
    <my-staking-card :caption="$t('stakingV3.basicRewards')" :amount="rewards?.staker" />
    <my-staking-card :caption="$t('stakingV3.bonusRewards')" :amount="rewards?.bonus" />
    <my-staking-card
      class="total--rewards"
      :caption="$t('stakingV3.totalEstimatedRewards')"
      :amount="totalStakerRewards"
    />
    <astar-button
      class="stake--button"
      :disabled="!hasStakerRewards && !hasBonusRewards"
      :width="160"
      @click="claimStakerAndBonusRewards()"
      >{{ $t('stakingV3.claim') }}</astar-button
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDappStaking } from '../../hooks';
import MyStakingCard from './MyStakingCard.vue';

export default defineComponent({
  components: {
    MyStakingCard,
  },
  setup() {
    const {
      rewards,
      hasStakerRewards,
      hasBonusRewards,
      totalStakerRewards,
      claimStakerAndBonusRewards,
    } = useDappStaking();

    return {
      rewards,
      totalStakerRewards,
      hasStakerRewards,
      hasBonusRewards,
      claimStakerAndBonusRewards,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--my-staking {
  width: 100%;
  display: flex;
  column-gap: 16px;

  div {
    flex-basis: 0;
    flex-grow: 1;
  }
}

.total--rewards {
  background-color: $gray-1;
}

.stake--button {
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
}
</style>
