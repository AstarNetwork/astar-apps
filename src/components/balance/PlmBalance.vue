<template>
  <div
    class="tw-bg-white dark:tw-bg-darkGray-800 tw-overflow-hidden tw-shadow tw-rounded-lg sm:tw-col-span-2 tw-text-blue-900 dark:tw-text-darkGray-100 tw-p-5 sm:tw-grid tw-grid-cols-2 tw-gap-4"
  >
    <div>
      <div class="tw-flex tw-items-center">
        <div
          class="tw-h-10 tw-w-10 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mr-2"
        >
          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
        <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold tw-text-lg">
          {{ defaultUnitToken }} {{ $t('balance.balance') }}
        </p>
      </div>

      <div class="tw-flex tw-justify-center tw-mt-4 lg:tw-mt-6">
        <div>
          <p class="tw-font-semibold tw-text-center">
            <span class="tw-text-4xl tw-tracking-tight tw-leading-tight"
              ><format-balance :balance="accountData?.free"
            /></span>
          </p>
        </div>
      </div>

      <div class="tw-mt-3 tw-text-center tw-mb-6 sm:tw-mb-0">
        <button
          type="button"
          @click="openTransferModal"
          :disabled="!address"
          class="transfer-button"
          :class="!address ? 'disabled_btn' : ''"
        >
          {{ $t('balance.transfer') }}
        </button>
      </div>
    </div>

    <div class="tw-text-sm">
      <div
        class="tw-flex tw-justify-between tw-items-center tw-bg-blue-50 dark:tw-bg-darkGray-700 tw-rounded-lg tw-mb-2 tw-py-3 tw-px-4"
      >
        <div> {{ $t('balance.transferable') }}</div>
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight"><format-balance :balance="accountData?.getUsableTransactionBalance()" /></span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useChainMetadata } from 'src/hooks';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import FormatBalance from 'components/balance/FormatBalance.vue';

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    FormatBalance,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    accountData: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const openTransferModal = (): void => {
      emit('update:is-open-transfer', true);
    };

    const { defaultUnitToken } = useChainMetadata();

    return {
      openTransferModal,
      defaultUnitToken,
      ...toRefs(props)
    };
  },
});
</script>
<style scoped>
.disabled_btn {
  background: #c6d3e1 !important;
}

.transfer-button {
  @apply tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-0.5;
}
.transfer-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
</style>
