<template>
  <div class="wrapper--promo">
    <div class="row--title">
      <span class="text--promo-title">{{
        isVotingPeriod ? $t('stakingV3.votingNow') : $t('stakingV3.newDappPromotion')
      }}</span>
    </div>
    <div class="text--promo-description">
      <span>{{ isVotingPeriod ? $t('stakingV3.voteToday') : promotedDapp?.shortDescription }}</span>
    </div>
    <div class="row--button">
      <astar-button
        v-if="isVotingPeriod"
        class="button--link pink--button"
        @click="navigateToVote()"
      >
        {{ $t('stakingV3.voteNow') }}
        <!-- TODO: will move to AstarUI -->
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.2504 7.8L6.95039 17.125C6.80039 17.275 6.62139 17.35 6.41339 17.35C6.20472 17.35 6.02539 17.275 5.87539 17.125C5.72539 16.975 5.65039 16.7957 5.65039 16.587C5.65039 16.379 5.72539 16.2 5.87539 16.05L15.2004 6.75H7.00039C6.78372 6.75 6.60472 6.679 6.46339 6.537C6.32139 6.39567 6.25039 6.21667 6.25039 6C6.25039 5.78333 6.32139 5.60433 6.46339 5.463C6.60472 5.321 6.78372 5.25 7.00039 5.25H16.8504C17.1004 5.25 17.3131 5.33733 17.4884 5.512C17.6631 5.68733 17.7504 5.9 17.7504 6.15V16C17.7504 16.2167 17.6797 16.396 17.5384 16.538C17.3964 16.6793 17.2171 16.75 17.0004 16.75C16.7837 16.75 16.6044 16.6793 16.4624 16.538C16.3211 16.396 16.2504 16.2167 16.2504 16V7.8Z"
            fill="currentColor"
          />
        </svg>
      </astar-button>
      <astar-button
        v-else
        class="button--link outlined--button"
        @click="navigateToVote(promotedDapp?.address)"
      >
        {{ $t('stakingV3.stakeOn', { name: promotedDapp?.name }) }}
        <!-- TODO: will move to AstarUI -->
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.2504 7.8L6.95039 17.125C6.80039 17.275 6.62139 17.35 6.41339 17.35C6.20472 17.35 6.02539 17.275 5.87539 17.125C5.72539 16.975 5.65039 16.7957 5.65039 16.587C5.65039 16.379 5.72539 16.2 5.87539 16.05L15.2004 6.75H7.00039C6.78372 6.75 6.60472 6.679 6.46339 6.537C6.32139 6.39567 6.25039 6.21667 6.25039 6C6.25039 5.78333 6.32139 5.60433 6.46339 5.463C6.60472 5.321 6.78372 5.25 7.00039 5.25H16.8504C17.1004 5.25 17.3131 5.33733 17.4884 5.512C17.6631 5.68733 17.7504 5.9 17.7504 6.15V16C17.7504 16.2167 17.6797 16.396 17.5384 16.538C17.3964 16.6793 17.2171 16.75 17.0004 16.75C16.7837 16.75 16.6044 16.6793 16.4624 16.538C16.3211 16.396 16.2504 16.2167 16.2504 16V7.8Z"
            fill="currentColor"
          />
        </svg>
      </astar-button>
    </div>
    <div class="row--data">
      <kpi-card v-if="!isVotingPeriod" :title="$t('stakingV3.build').toUpperCase()">
        <span class="text--value">{{ registeredDapps.length }}</span>
        <span class="text--value-small">/{{ constants?.maxNumberOfContracts ?? '-' }}</span>
      </kpi-card>
      <kpi-card v-if="isVotingPeriod" :title="$t('stakingV3.vote')">
        <span class="text--value">2</span>
        <span class="text--value-small">/14</span>
      </kpi-card>
      <kpi-card v-if="!isVotingPeriod" :title="$t('stakingV3.basicRewards')">
        <!-- TODO: will make number dynamic -->
        <span class="text--value">9.7</span>
        <span class="text--value-small">%</span></kpi-card
      >
      <kpi-card :title="$t('stakingV3.bonusRewards')">
        <span class="text--value">2.3</span>
        <span class="text--value-small">%</span></kpi-card
      >
      <kpi-card :title="$t('dashboard.tvl')">
        <span class="text--value">
          <format-balance :balance="currentEraInfo?.totalLocked?.toString() ?? ''" />
        </span>
      </kpi-card>
      <div v-if="!isVotingPeriod" class="row--start-staking">
        <button class="button--staking" @click="navigateToVote()">
          <span class="text--start-staking">Start Staking Now</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDapps, useCampaign, useDappStakingNavigation } from '../hooks';
import { Campaign } from 'src/v2/models';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import KpiCard from './KpiCard.vue';

export default defineComponent({
  components: {
    FormatBalance,
    KpiCard,
  },
  setup() {
    const { constants, currentEraInfo, isVotingPeriod } = useDappStaking();
    const { registeredDapps } = useDapps();
    const { newListings } = useCampaign();
    const { navigateToVote } = useDappStakingNavigation();
    // const { totalSupply } = useTokenCirculation();

    // const tvlPercentage = computed<number>(
    //   () =>
    //     Number(ethers.utils.formatEther(currentEraInfo.value?.totalLocked.toString() ?? 0)) /
    //     totalSupply.value
    // );

    const promotedDapp = computed<Campaign | undefined>(() =>
      newListings.value.length ? newListings.value[0] : undefined
    );

    return {
      constants,
      registeredDapps,
      promotedDapp,
      currentEraInfo,
      isVotingPeriod,
      navigateToVote,
    };
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>
