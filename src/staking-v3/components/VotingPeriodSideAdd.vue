<template>
  <div v-if="isVotingPeriod" class="add-container">
    <div class="top-text">
      <div>{{ $t('stakingV3.title') }}</div>
      <div>{{ $t('stakingV3.newVotingPeriod') }}</div>
      <div>{{ $t('stakingV3.bonusPeriodEnds', { eras: remainingEras }) }}</div>
    </div>
    <div>
      <button :disabled="isZkEvm" class="button--vote-stake" @click="navigateToVote()">
        <span>
          {{ $t('stakingV3.stakeTodayFormatted') }}
        </span>
        <vote-stake-button-bg />
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useDappStaking, useDappStakingNavigation, usePeriod } from '../hooks';
import { useNetworkInfo } from 'src/hooks';
import VoteStakeButtonBg from './VoteStakeButtonBg.vue';

export default defineComponent({
  components: {
    VoteStakeButtonBg,
  },
  setup() {
    const { isVotingPeriod } = useDappStaking();
    const { navigateToVote } = useDappStakingNavigation();
    const { remainingEras } = usePeriod();
    const { isZkEvm } = useNetworkInfo();

    return { isVotingPeriod, remainingEras, isZkEvm, navigateToVote };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.add-container {
  background-color: $white;
  background-image: url('assets/dapp_staking_period002_bg.webp');
  background-position: center bottom;
  background-size: 180% auto;
  border-radius: 16px;
  padding: 8px;
  color: $navy-1;
  border: 1px solid $gray-2;
}

.top-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  line-height: normal;

  div:first-child {
    font-size: 14px;
    font-style: italic;
    font-weight: 900;
  }

  div:nth-child(2) {
    font-size: 24px;
    font-weight: 900;
  }
}

.button--vote-stake {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 24px;
  font-size: 24px;
  font-weight: 700;
  text-align: left;
  box-shadow: 0px 0px 6.88px 1.376px rgba(0, 0, 0, 0.3);
  color: white;
  line-height: 1.25;
  transition: all 0.2s ease;
  background-color: #0048e6;
  width: 100%;
  height: 180px;

  &:hover {
    filter: brightness(1.2);
  }

  span {
    position: relative;
    display: block;
    z-index: 1;
    white-space: pre;
  }

  #iframe {
    position: absolute;
    z-index: 0;
    transform-origin: top left;
    top: 0;
    left: 0;
    pointer-events: none;
    @media (min-width: $sm) {
      scale: 50%;
    }
  }
}
</style>
