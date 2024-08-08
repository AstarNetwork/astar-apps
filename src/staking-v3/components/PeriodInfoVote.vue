<template>
  <div v-if="protocolState?.periodInfo.subperiod === PeriodType.Voting" class="wrapper-info">
    <div class="wrapper-info-inner">
      <div class="left-panel panel vote-panel">
        <div class="header vote-header">
          <div class="title">
            <span>{{ protocolState?.periodInfo.number.toString().padStart(3, '0') ?? '--' }}</span>
            <span>{{ $t('stakingV3.votingOpen') }}</span>
          </div>
          <div class="remaining-eras">
            <div class="subtitle">{{ $t('stakingV3.stakeToday') }}</div>
            <div class="time-left">{{ timeLeftFormatted }}</div>
          </div>
        </div>
        <div>{{ $t('stakingV3.votingOpenText') }}</div>
      </div>
      <div class="right-panel panel vote-panel">
        <div class="header">
          <div class="title no-separator">
            {{ $t('stakingV3.rewards') }}
          </div>
          <div @click="navigateToAssets()">
            {{ $t('stakingV3.manageStakingAssets') }} <astar-icon-arrow-right />
          </div>
        </div>
        <div class="reward-info">
          <div class="reward-label">
            <div>{{ $t('stakingV3.unclaimedRewards') }}</div>
            <div>{{ $t('stakingV3.rewardsClaimedOnStake') }}</div>
          </div>
          <div class="reward-options">
            <token-balance-native class="balance" :balance="totalStakerRewards.toString()" />
            <claim-and-restake-button :claim-type="ClaimType.Both" />
          </div>
        </div>
        <div class="reward-info">
          <div class="reward-label">
            <div>{{ $t('stakingV3.estimatedRewards') }}</div>
            <div>{{ $t('stakingV3.ifYouStakeNow') }}</div>
          </div>
          <div class="percentage">
            <span>{{ totalApr.toFixed(1) }}<small>%</small></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useAprV3, useDappStaking, useDappStakingNavigation, useVotingCountdown } from '../hooks';
import { PeriodType, ClaimType } from 'src/staking-v3/logic';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import ClaimAndRestakeButton from './ClaimAndRestakeButton.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
    ClaimAndRestakeButton,
  },
  setup() {
    const { protocolState, totalStakerRewards } = useDappStaking();
    const { navigateToAssets } = useDappStakingNavigation();
    const { timeLeftFormatted } = useVotingCountdown();
    const { stakerApr, bonusApr } = useAprV3({ isWatch: true });

    const totalApr = computed<number>(() => stakerApr.value + bonusApr.value);

    return {
      PeriodType,
      ClaimType,
      protocolState,
      timeLeftFormatted,
      totalStakerRewards,
      totalApr,
      navigateToAssets,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/period-info.scss';

.vote-panel {
  flex: 1;
  gap: 16px;
}

.vote-header {
  flex-direction: column;
  align-items: flex-start !important;
  gap: 16px;
}

.remaining-eras {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: $lg) {
    flex-direction: row;
    align-items: baseline;

    div:last-child {
      margin-left: auto;
    }
  }
}

.header {
  align-items: center;

  div:last-child {
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
}

.reward-label {
  div:first-child {
    font-size: 16px;
    font-weight: 700;
    line-height: normal;
  }

  div:last-child {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 400;
    color: $gray-3;
  }
}

.reward-info {
  display: flex;
  flex-direction: column;
  gap: 8px;

  div:last-child {
    margin-left: auto;
  }

  @media (min-width: $lg) {
    flex-direction: row;
    align-items: center;
  }
}

.reward-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;

  .balance {
    font-size: 16px;
    font-weight: 800;
  }
}
</style>
