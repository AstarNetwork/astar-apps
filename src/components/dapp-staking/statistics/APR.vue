<template>
  <div
    v-if="percentage > 0"
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow tw-mb-8 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-8 tw-px-4
      box
    "
  >
    <div class="row--apr-buttons">
      <div
        class="tw-text-xl tw-font-semibold tw-mb-4"
        :class="isApr ? 'button--active' : 'button--not-active'"
        @click="isApr = true"
      >
        {{ $t('dappStaking.apr') }}
      </div>
      <div
        class="tw-text-xl tw-font-semibold tw-mb-4"
        :class="!isApr ? 'button--active' : 'button--not-active'"
        @click="isApr = false"
      >
        {{ $t('dappStaking.apy') }}
      </div>
    </div>
    <div class="tw-flex tw-flex-col tw-items-center">
      <div class="tw-text-5xl tw-font-semibold">{{ percentage }} %</div>
    </div>
  </div>
</template>

<script lang="ts">
import BN from 'bn.js';
import { $api } from 'src/boot/api';
import { AccountLedger, RewardDestination, useAccount, useApr } from 'src/hooks';
import { computed, defineComponent, ref, watch } from 'vue';

export default defineComponent({
  setup() {
    const { stakerApr, stakerApy } = useApr();
    const { currentAccount } = useAccount();
    const isApr = ref<boolean>(true);
    const percentage = computed(() =>
      Number((isApr.value ? stakerApr.value : stakerApy.value).toFixed(1))
    );

    const checkIsCompoundingAccount = async (): Promise<void> => {
      try {
        const ledger = await $api?.query.dappsStaking.ledger<AccountLedger>(currentAccount.value);
        const isStaker = ledger && !ledger.locked.eq(new BN(0));
        const isCompounding = ledger?.toJSON().rewardDestination === RewardDestination.StakeBalance;
        isApr.value = isStaker ? !isCompounding : true;
      } catch (error) {
        console.error(error);
      }
    };

    watch(
      [currentAccount],
      async () => {
        if (!currentAccount.value) return;
        checkIsCompoundingAccount();
      },
      { immediate: false }
    );

    return {
      isApr,
      percentage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
  @media (min-width: $xl) {
    max-width: 288px;
  }
}
.row--apr-buttons {
  display: flex;
  align-items: center;
  column-gap: 12px;
}

.button--not-active {
  opacity: 0.5;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease 0s;
}

.button--active {
  border-bottom: 2px solid $astar-blue-dark;
  transition: all 0.3s ease 0s;
}
</style>
