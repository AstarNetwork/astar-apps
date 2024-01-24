<template>
  <div :class="`wrapper--dapp-statistics ${small ? 'small' : ''}`">
    <div class="row--data">
      <button class="button--vote-stake" @click="navigateToVote(dapp.extended?.address)">
        <span>{{ $t('stakingV3.dapp.voteAndStake') }}</span>
        <vote-stake-button-bg />
      </button>

      <kpi-card v-if="!small" :title="$t('dappStaking.dappPage.totalStaked')">
        <format-balance :balance="dapp.chain.totalStake?.toString() || '0'" />
      </kpi-card>
      <kpi-card v-if="!small" :title="$t('stakingV3.currentTier')">
        <span>{{ getDappTier(dapp.chain.id) ?? '--' }}</span>
      </kpi-card>
      <kpi-card v-if="!small" :title="$t('stakingV3.numberOfStakers')">
        <span>{{ dapp.dappDetails?.stakersCount ?? '--' }}</span>
      </kpi-card>
    </div>
  </div>
</template>
<script lang="ts">
import { useDappStaking, useDappStakingNavigation } from 'src/staking-v3/hooks';
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType } from 'vue';
import KpiCard from '../KpiCard.vue';
import VoteStakeButtonBg from '../VoteStakeButtonBg.vue';
import FormatBalance from 'components/common/FormatBalance.vue';

export default defineComponent({
  components: {
    KpiCard,
    VoteStakeButtonBg,
    FormatBalance,
  },
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
    small: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const { getDappTier } = useDappStaking();
    const { navigateToVote } = useDappStakingNavigation();

    return { getDappTier, navigateToVote };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-statistics.scss';
</style>
