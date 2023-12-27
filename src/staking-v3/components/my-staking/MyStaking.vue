<template>
  <div>
    <div>
      <div class="column--my-staking amounts">
        <div class="amount--row">
          <div class="cell">{{ $t('stakingV3.unstakedAmount') }}</div>
          <div class="cell">
            <token-balance-native :balance="lockedButUnstaked.toString()" />
          </div>
          <div class="buttons cell">
            <astar-button :width="100" @click="unlock(lockedButUnstaked)">{{
              $t('stakingV3.unlock')
            }}</astar-button>
            <astar-button :width="100" @click="navigateToVote()">{{
              protocolState?.periodInfo.subperiod === PeriodType.Voting
                ? $t('stakingV3.vote')
                : $t('stakingV3.stake')
            }}</astar-button>
          </div>
        </div>
        <div class="amount--row">
          <div class="cell">{{ $t('stakingV3.stakedAmount') }}</div>
          <div class="cell">
            <token-balance-native :balance="totalStake.toString()" />
          </div>
          <div class="cell"></div>
        </div>
      </div>
    </div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDappStakingNavigation } from '../../hooks';
import MyStakingCard from './MyStakingCard.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { PeriodType } from 'src/staking-v3/logic';

export default defineComponent({
  components: {
    MyStakingCard,
    TokenBalanceNative,
  },
  setup() {
    const {
      rewards,
      hasStakerRewards,
      hasBonusRewards,
      totalStakerRewards,
      ledger,
      totalStake,
      protocolState,
      claimStakerAndBonusRewards,
      unlock,
    } = useDappStaking();

    const { navigateToVote } = useDappStakingNavigation();

    const lockedButUnstaked = computed<bigint>(() => {
      return ledger.value ? ledger.value.locked - totalStake.value : BigInt(0);
    });

    return {
      rewards,
      totalStakerRewards,
      hasStakerRewards,
      hasBonusRewards,
      lockedButUnstaked,
      totalStake,
      protocolState,
      claimStakerAndBonusRewards,
      navigateToVote,
      unlock,
      PeriodType,
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

.amounts {
  background-color: transparent;
  margin-bottom: 16px;
}

.amount--row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
}

.buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  @media (min-width: $sm) {
    flex-direction: row;
  }
}

.cell {
  flex: 1;
}
</style>
