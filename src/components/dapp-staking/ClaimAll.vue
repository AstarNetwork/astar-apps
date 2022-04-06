<template>
  <div v-if="currentAccount && isEnableIndividualClaim">
    <div class="title">Unclaimed Rewards</div>
    <div>
      <Button
        v-if="!isCompounding"
        :small="true"
        :primary="true"
        :disabled="batchTxs.length === 0 || isLoading"
        class="button"
        @click="claimAll"
      >
        {{ $t('dappStaking.claim') }}
      </Button>
      <span v-else class="text--title">{{ $t('dappStaking.autoCompoundingRewards') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { fasMoneyCheckAlt } from '@quasar/extras/fontawesome-v5';
import Button from 'src/components/common/Button.vue';
import { useAccount, useClaimAll } from 'src/hooks';
import { useCompoundRewards } from 'src/hooks/dapps-staking/useCompoundRewards';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const { claimAll, batchTxs, isLoading, isEnableIndividualClaim } = useClaimAll();
    const { currentAccount } = useAccount();
    const { isCompounding } = useCompoundRewards();

    return {
      isEnableIndividualClaim,
      fasMoneyCheckAlt,
      claimAll,
      batchTxs,
      isLoading,
      currentAccount,
      isCompounding,
    };
  },
});
</script>

<style scoped>
.button {
  float: right;
}

.title {
  margin-bottom: 12px;
}
</style>
