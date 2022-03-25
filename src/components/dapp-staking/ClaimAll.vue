<template>
  <div
    v-if="currentAccount && isEnableIndividualClaim"
    class="
      tw-text-center tw-mb-8 tw-flex tw-items-center tw-justify-center tw-gap-x-2
      sm:tw-gap-x-10
    "
  >
    <Button
      :disabled="batchTxs.length === 0 || isLoading"
      class="
        sm:tw-w-40
        tw-justify-center
        tw-inline-flex
        tw-items-center
        tw-text-sm
        tw-font-medium
        tw-rounded-full
        tw-shadow-sm
        tw-text-white
        tw-bg-indigo-500
      "
      @click="claimAll"
    >
      <icon-base class="tw-w-5 tw-h-5 tw-text-white tw--ml-2 tw-mr-2" icon-name="sack-dollar">
        <q-icon :name="fasMoneyCheckAlt" color="green" />
      </icon-base>
      <span>
        {{ $t('dappStaking.claim') }}
      </span>
    </Button>
  </div>
</template>

<script lang="ts">
import { fasMoneyCheckAlt } from '@quasar/extras/fontawesome-v5';
import IconBase from 'components/icons/IconBase.vue';
import Button from 'src/components/common/Button.vue';
import { useAccount, useClaimAll } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    Button,
    IconBase,
  },
  setup() {
    const { claimAll, batchTxs, isLoading, isEnableIndividualClaim } = useClaimAll();
    const { currentAccount } = useAccount();

    return {
      isEnableIndividualClaim,
      fasMoneyCheckAlt,
      claimAll,
      batchTxs,
      isLoading,
      currentAccount,
    };
  },
});
</script>
