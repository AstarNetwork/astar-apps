<template>
  <div :class="`wrapper--promo ${isVotingPeriod && 'voting-period'}`">
    <div class="wrapper--promo__inner">
      <div class="row--title">
        <span class="text--promo-title">{{
          isVotingPeriod ? $t('stakingV3.votingNow') : $t('stakingV3.newDappPromotion')
        }}</span>
      </div>
      <div v-if="isVotingPeriod" class="row--countdown">
        <span>{{ timeLeftFormatted }}</span>
      </div>
      <div class="text--promo-description">
        <span>{{
          isVotingPeriod ? $t('stakingV3.voteToday') : promotedDapp?.shortDescription
        }}</span>
      </div>
      <div class="row--button">
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
        <kpi-card :title="periodName.toUpperCase()">
          <span class="text--value">{{ periodCurrentDay }}</span>
          <span class="text--value-small">/{{ periodDuration }}</span>
        </kpi-card>
        <kpi-card v-if="!isVotingPeriod" :title="$t('stakingV3.basicRewards')">-- %</kpi-card>
        <kpi-card :title="$t('stakingV3.bonusRewards')">-- %</kpi-card>
        <kpi-card :title="$t('dashboard.tvl')">
          <format-balance :balance="currentEraInfo?.totalLocked?.toString() ?? ''" />
        </kpi-card>
        <div v-if="!isVotingPeriod" class="row--start-staking">
          <button class="button--vote-stake" @click="navigateToVote()">
            <span>{{ $t('stakingV3.startStakingNow') }}</span>
            <vote-stake-button-bg />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import {
  useDappStaking,
  useDapps,
  useCampaign,
  useDappStakingNavigation,
  usePeriod,
  useVotingCountdown,
} from '../hooks';
import { Campaign } from 'src/v2/models';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import KpiCard from './KpiCard.vue';
import VoteStakeButtonBg from './VoteStakeButtonBg.vue';

export default defineComponent({
  components: {
    FormatBalance,
    KpiCard,
    VoteStakeButtonBg,
  },
  setup() {
    const { constants, currentEraInfo, isVotingPeriod } = useDappStaking();
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
      currentEraInfo,
      isVotingPeriod,
      periodCurrentDay,
      periodDuration,
      periodName,
      timeLeftFormatted,
      navigateToVote,
    };
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>
