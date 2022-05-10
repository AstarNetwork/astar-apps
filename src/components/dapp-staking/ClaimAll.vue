<template>
  <div v-if="currentAccount" class="widget-container">
    <div class="title">
      {{ $t('dappStaking.unclaimedRewards') }}
      <IconTooltip>
        {{ $t('dappStaking.unclaimedRewardsTooltip') }}
      </IconTooltip>
    </div>
    <div class="widget-content">
      <span class="text--title">&nbsp;</span>
      <Button
        :small="true"
        :primary="true"
        :disabled="!canClaim || isLoading"
        class="button"
        @click="claimAll"
      >
        {{ $t('dappStaking.claim') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { fasMoneyCheckAlt } from '@quasar/extras/fontawesome-v5';
import Button from 'src/components/common/Button.vue';
import IconTooltip from 'components/common/IconTooltip.vue';
import { useAccount, useClaimAll } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    Button,
    IconTooltip,
  },
  setup() {
    const { claimAll, canClaim, isLoading } = useClaimAll();
    const { currentAccount } = useAccount();

    return {
      fasMoneyCheckAlt,
      claimAll,
      canClaim,
      isLoading,
      currentAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards-widget.scss';
</style>
