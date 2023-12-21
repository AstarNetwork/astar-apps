<template>
  <div class="wrapper--my-staking">
    <div class="column--my-staking">
      <my-staking-card :caption="$t('stakingV3.basicRewards')" :amount="rewards?.staker" />
      <my-staking-card :caption="$t('stakingV3.bonusRewards')" :amount="rewards?.bonus" />
      <my-staking-card
        :caption="$t('stakingV3.totalEstimatedRewards')"
        :amount="totalStakerRewards"
      />
    </div>
    <button
      class="stake--button"
      :disabled="!hasStakerRewards && !hasBonusRewards"
      :width="160"
      @click="claimStakerAndBonusRewards()"
    >
      {{ $t('stakingV3.claim') }}
    </button>
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
  display: flex;
  gap: 16px;
  flex-direction: column;
  @media (min-width: $sm) {
    flex-direction: row;
  }
}

.column--my-staking {
  flex: 1;
  background-color: $gray-1;
  gap: 16px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  padding: 16px 24px;
}

.stake--button {
  background: linear-gradient(100.62deg, #0297fb 50.27%, #0070eb 88.26%, #0ae2ff 173.42%);
  padding: 16px, 8px, 16px, 8px;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.2s ease;
  height: 60px;
  @media (min-width: $sm) {
    width: 128px;
    height: auto;
  }
}
.stake--button:enabled {
  &:hover {
    filter: brightness(110%);
  }
}

.body--dark {
  .column--my-staking {
    background-color: $navy-3;
  }
}
</style>
