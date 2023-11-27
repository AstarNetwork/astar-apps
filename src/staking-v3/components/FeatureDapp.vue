<template>
  <div class="wrapper--promo">
    <div class="row--title">
      <span class="text--promo-title">{{
        isVotingPeriod ? $t('stakingV3.votingNow') : $t('stakingV3.newDappPromotion')
      }}</span>
    </div>
    <div>
      <span>{{ isVotingPeriod ? $t('stakingV3.voteToday') : promotedDapp?.shortDescription }}</span>
    </div>
    <div class="row--button">
      <astar-button
        v-if="isVotingPeriod"
        class="button--link pink--button"
        @click="navigateToVote()"
      >
        {{ $t('stakingV3.voteNow') }}
      </astar-button>
      <astar-button v-else class="button--link" @click="navigateToVote(promotedDapp?.address)">
        {{ $t('stakingV3.stakeOn', { name: promotedDapp?.name }) }}
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
      <kpi-card v-if="!isVotingPeriod" :title="$t('stakingV3.basicRewards')">9.7%</kpi-card>
      <kpi-card :title="$t('stakingV3.bonusRewards')">2.3%</kpi-card>
      <kpi-card :title="$t('dashboard.tvl')">
        <format-balance :balance="currentEraInfo?.totalLocked?.toString() ?? ''" />
      </kpi-card>
    </div>
    <div v-if="!isVotingPeriod" class="row--start-staking">
      <button class="button--staking" @click="navigateToVote()">
        <span class="text--start-staking">Start Staking Now</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDapps, useCampaign } from '../hooks';
import { Campaign } from 'src/v2/models';
import { Path, networkParam } from 'src/router/routes';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import KpiCard from './KpiCard.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    FormatBalance,
    KpiCard,
  },
  setup() {
    const { constants, currentEraInfo, isVotingPeriod } = useDappStaking();
    const { registeredDapps } = useDapps();
    const { newListings } = useCampaign();
    const router = useRouter();
    // const { totalSupply } = useTokenCirculation();

    // const tvlPercentage = computed<number>(
    //   () =>
    //     Number(ethers.utils.formatEther(currentEraInfo.value?.totalLocked.toString() ?? 0)) /
    //     totalSupply.value
    // );

    const promotedDapp = computed<Campaign | undefined>(() =>
      newListings.value.length ? newListings.value[0] : undefined
    );

    const navigateToVote = (dAppAddress: string | undefined = undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Vote;
      router.push(`${base}?dappAddress=${dAppAddress ?? ''}`);
    };

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
