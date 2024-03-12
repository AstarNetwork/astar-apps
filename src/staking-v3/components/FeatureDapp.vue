<template>
  <div :class="`wrapper--promo ${isVotingPeriod && 'voting-period'}`">
    <div class="wrapper--promo__inner">
      <div class="row--title">
        <span class="text--promo-title">{{
          isVotingPeriod ? $t('stakingV3.votingNow') : $t('stakingV3.buildAndEarn')
        }}</span>
      </div>
      <div v-if="isVotingPeriod" class="row--countdown">
        <span>{{ timeLeftFormatted }}</span>
      </div>
      <div class="text--promo-description">
        <span>{{
          isVotingPeriod ? $t('stakingV3.voteToday') : $t('stakingV3.innovativeWayOfStaking')
        }}</span>
      </div>

      <!-- MEMO: temporary show the general hero -->
      <div v-if="false" class="row--button">
        <astar-button
          v-if="!isVotingPeriod"
          class="button--link outlined--button"
          @click="navigateToVote(promotedDapp?.address)"
        >
          {{ $t('stakingV3.stakeOn', { name: promotedDapp?.name }) }}
          <astar-icon-arrow-up-right />
        </astar-button>
      </div>

      <div class="row--data">
        <button v-if="isVotingPeriod" class="button--vote-stake" @click="navigateToVote()">
          <span>{{ $t('stakingV3.voteStakeToday') }}</span>
          <vote-stake-button-bg />
        </button>
        <kpi-card :title="periodName" :description="$t('stakingV3.periodDescription')">
          <span class="text--value">{{ periodCurrentDay }}</span>
          <span class="text--value-small">/ {{ periodDuration }}</span>
        </kpi-card>
        <kpi-card
          :title="$t('stakingV3.basicRewards')"
          :description="$t('stakingV3.basicRewardsDescription')"
        >
          <span class="text--value">{{ stakerApr ? $n(truncate(stakerApr, 2)) : '-' }}</span>
          <span class="text--value-small">%</span>
        </kpi-card>
        <kpi-card
          :title="$t('stakingV3.bonusRewards')"
          :description="$t('stakingV3.bonusRewardsDescription')"
        >
          <span class="text--value">{{ bonusApr ? $n(truncate(bonusApr, 2)) : '-' }}</span>
          <span class="text--value-small">%</span>
        </kpi-card>
        <div v-if="!isVotingPeriod" class="row--start-staking">
          <button class="button--vote-stake" @click="navigateToVote()">
            <span>{{ $t('stakingV3.startStakingNow') }}</span>
            <vote-stake-button-bg />
          </button>
        </div>
      </div>
    </div>
    <div v-if="isVotingPeriod" class="bg--voting-period">
      <img :src="require('/src/staking-v3/assets/vote_hero_bg.webp')" alt="" />
    </div>
  </div>
</template>

<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { Campaign } from 'src/v2/models';
import { computed, defineComponent } from 'vue';
import {
  useAprV3,
  useCampaign,
  useDappStaking,
  useDappStakingNavigation,
  useDapps,
  usePeriod,
  useVotingCountdown,
} from '../hooks';
import KpiCard from './KpiCard.vue';
import VoteStakeButtonBg from './VoteStakeButtonBg.vue';

export default defineComponent({
  components: {
    KpiCard,
    VoteStakeButtonBg,
  },
  setup() {
    const { constants, isVotingPeriod } = useDappStaking();
    const { stakerApr, bonusApr } = useAprV3({ isWatch: true });
    const { registeredDapps } = useDapps();
    const { newListings } = useCampaign();
    const { navigateToVote } = useDappStakingNavigation();
    const { periodCurrentDay, periodDuration, periodName } = usePeriod();
    const { timeLeftFormatted } = useVotingCountdown();

    const promotedDapp = computed<Campaign | undefined>(() =>
      newListings.value.length ? newListings.value[0] : undefined
    );

    return {
      constants,
      registeredDapps,
      promotedDapp,
      isVotingPeriod,
      periodCurrentDay,
      periodDuration,
      periodName,
      stakerApr,
      bonusApr,
      timeLeftFormatted,
      navigateToVote,
      truncate,
    };
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>
