<template>
  <div :class="`wrapper--dapp-statistics ${small ? 'small' : ''}`">
    <div class="row--data">
      <button
        :disabled="isZkEvm"
        class="button--vote-stake"
        @click="navigateToVote(dapp.extended?.address)"
      >
        <span>{{ $t('stakingV3.dapp.voteAndStake') }}</span>
        <vote-stake-button-bg />
      </button>

      <kpi-card v-if="!small" :title="$t('dappStaking.dappPage.totalStaked')">
        <format-balance
          :balance="dapp.chain.totalStake?.toString() || '0'"
          :show-token-unit="false"
        />
        <span class="unit">{{ defaultUnitToken }}</span>
      </kpi-card>
      <kpi-card v-if="!small" :title="$t('stakingV3.currentTier')">
        <span>{{ getDappTier(dapp.chain.id) ?? '--' }}</span> /
        <span>{{ getDappRank(dapp.chain.id) ?? '--' }}</span>
        <template #description>
          <span>
            {{ $t('stakingV3.dappTierDescription') }}
            <a
              href="https://docs.astar.network/docs/learn/dapp-staking/dapp-staking-protocol#tier-system"
              target="_blank"
              class="text--link"
              rel="noopener noreferrer"
              >{{ $t('common.docs') }}</a
            >
          </span>
        </template>
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
import { useChainMetadata, useNetworkInfo } from 'src/hooks';

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
    const { getDappTier, getDappRank } = useDappStaking();
    const { isZkEvm } = useNetworkInfo();
    const { navigateToVote } = useDappStakingNavigation();
    const { defaultUnitToken } = useChainMetadata();

    return { getDappTier, getDappRank, navigateToVote, defaultUnitToken, isZkEvm };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-statistics.scss';
</style>
