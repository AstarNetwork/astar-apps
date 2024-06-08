<template>
  <div v-if="protocolState?.periodInfo.subperiod === PeriodType.Voting" class="wrapper-info">
    <div class="wrapper-info-inner">
      <div class="left-panel panel">
        <div class="header">
          <div class="title">
            <span>{{ protocolState?.periodInfo.number.toString().padStart(3, '0') ?? '--' }}</span>
            <span>{{ $t('stakingV3.votingOpen') }}</span>
          </div>
          <div>
            <div class="subtitle">{{ $t('stakingV3.stakeToday') }}</div>
            <div class="time-left">{{ timeLeftFormatted }}</div>
          </div>
        </div>
        <div>{{ $t('stakingV3.votingOpenText') }}</div>
      </div>
      <div class="right-panel panel">
        <div class="estimated-rewards">{{ $t('stakingV3.estimatedRewards') }}</div>
        <div>{{ $t('stakingV3.basicPlusBonus') }}</div>
        <div class="percentage">
          <span>15</span>
          <span>% +</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDappStaking, useVotingCountdown } from '../hooks';
import { PeriodType } from 'src/staking-v3/logic';

export default defineComponent({
  setup() {
    const { protocolState } = useDappStaking();
    const { timeLeftFormatted } = useVotingCountdown();

    return { protocolState, timeLeftFormatted, PeriodType };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/period-info.scss';
</style>
