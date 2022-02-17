<template>
  <div
    v-if="currentAccount && isEnableIndividualClaim"
    class="
      tw-text-center tw-mb-8 tw-flex tw-items-center tw-justify-center tw-gap-x-2
      sm:tw-gap-x-10
    "
  >
    <div class="tw-text-sm tw-font-medium tw-text-blue-900 dark:tw-text-darkGray-100">
      <span>{{ $t('dappStaking.ttlPendingRewards') }}</span>
      <FormatBalance :balance="new BN(ttlPendingRewards)" />
    </div>
    <Button
      :disabled="numOfRewardableApp === 0"
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
    >
      <icon-base class="tw-w-5 tw-h-5 tw-text-white tw--ml-2 tw-mr-2" icon-name="sack-dollar">
        <q-icon :name="fasMoneyCheckAlt" color="green" />
      </icon-base>
      <div>
        {{ $t('dappStaking.claimAll', { value: numOfRewardableApp }) }}
      </div>
    </Button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import FormatBalance from 'components/balance/FormatBalance.vue';
import { useAccount } from 'src/hooks';
import IconBase from 'components/icons/IconBase.vue';
import BN from 'bn.js';
import Button from 'src/components/common/Button.vue';
import { isEnableIndividualClaim } from 'src/config/chainEndpoints';
import { fasMoneyCheckAlt } from '@quasar/extras/fontawesome-v5';

export default defineComponent({
  components: {
    FormatBalance,
    Button,
    IconBase,
  },
  setup() {
    const { currentAccount } = useAccount();
    const numOfRewardableApp = ref<number>(0);
    const ttlPendingRewards = ref<string>('0');

    // Todo: query the values
    watchEffect(() => {
      numOfRewardableApp.value = 2;
      ttlPendingRewards.value = '1000000000000000000000'; // 1K ASTR
    });
    return {
      BN,
      currentAccount,
      ttlPendingRewards,
      numOfRewardableApp,
      isEnableIndividualClaim,
      fasMoneyCheckAlt,
    };
  },
});
</script>
