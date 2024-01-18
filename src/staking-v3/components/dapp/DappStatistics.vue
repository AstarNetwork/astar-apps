<template>
  <div :class="`wrapper--dapp-statistics ${small ? 'small' : ''}`">
    <div class="row--data">
      <button class="button--vote-stake" @click="navigateToVote(dapp.extended?.address)">
        <span>{{ $t('stakingV3.dapp.voteAndStake') }}</span>
        <vote-stake-button-bg />
      </button>

      <kpi-card
        v-if="!small"
        :title="$t('dappStaking.dappPage.totalStaked')"
        description="description"
      >
        <span class="text--value">
          <token-balance-native :balance="dapp.chain.totalStake?.toString() || '0'" />
        </span>
      </kpi-card>
      <kpi-card v-if="!small" :title="$t('stakingV3.currentTier')" description="description">
        <span class="text--value">{{ getDappTier(dapp.chain.id) ?? '--' }}</span>
      </kpi-card>
      <kpi-card v-if="!small" :title="$t('stakingV3.numberOfStakers')" description="description">
        <span class="text--value">{{ dapp.dappDetails?.stakersCount ?? '--' }}</span>
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
import VoteStakeButtonBg from '../VoteStakeButtonBg.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
    KpiCard,
    VoteStakeButtonBg,
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
