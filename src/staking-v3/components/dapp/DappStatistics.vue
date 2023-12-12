<template>
  <div class="wrapper--dapp-statistics">
    <div class="row--data">
      <button class="button--vote-stake" @click="navigateToVote(dapp.dapp.address)">
        {{ $t('stakingV3.dapp.voteAndStake') }}
      </button>

      <kpi-card :title="$t('dappStaking.dappPage.totalStaked')">
        <token-balance :balance="dapp.stakerInfo.totalStakeFormatted" :symbol="nativeTokenSymbol" />
      </kpi-card>

      <kpi-card :title="$t('dappStaking.dappPage.totalStaker')">
        <span>{{ $n(dapp.stakerInfo.stakersCount) }}</span>
      </kpi-card>

      <kpi-card :title="$t('stakingV3.currentTier')">
        <span>{{ $n(1) }}</span>
      </kpi-card>

      <kpi-card :title="$t('stakingV3.totalEarned')">
        <span> {{ $t('amountToken', { amount: 10, token: nativeTokenSymbol }) }}</span>
      </kpi-card>
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent } from 'vue';
import KpiCard from '../KpiCard.vue';
import { useDappStakingNavigation } from '../../hooks';

export default defineComponent({
  components: {
    TokenBalance,
    KpiCard,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { navigateToVote } = useDappStakingNavigation();

    return { nativeTokenSymbol, navigateToVote };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-statistics.scss';
</style>
