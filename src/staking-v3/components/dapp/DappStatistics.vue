<template>
  <div class="wrapper--dapp-statistics">
    <div class="row--data">
      <button class="button--vote-stake" @click="navigateToVote(dapp.extended?.address)">
        {{ $t('stakingV3.dapp.voteAndStake') }}
      </button>

      <kpi-card :title="$t('dappStaking.dappPage.totalStaked')">
        <token-balance-native :balance="dapp.chain.totalStake?.toString() || '0'" />
      </kpi-card>

      <!-- <kpi-card :title="$t('dappStaking.dappPage.totalStaker')">
        <span>{{ $n(dapp.stakerInfo.stakersCount) }}</span>
      </kpi-card> -->

      <kpi-card :title="$t('stakingV3.currentTier')">
        <span>{{ getDappTier(dapp.chain.id) ?? '--' }}</span>
      </kpi-card>

      <!-- <kpi-card :title="$t('stakingV3.totalEarned')">
        <span>{{ $t('amountToken', { amount: 10, token: nativeTokenSymbol }) }}</span>
      </kpi-card> -->
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useDappStaking, useDappStakingNavigation } from 'src/staking-v3/hooks';
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType } from 'vue';
import KpiCard from '../KpiCard.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
    KpiCard,
  },
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
  setup(props) {
    const { getDappTier } = useDappStaking();
    const { navigateToVote } = useDappStakingNavigation();

    console.log('dapp', props.dapp);

    return { getDappTier, navigateToVote };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-statistics.scss';
</style>
