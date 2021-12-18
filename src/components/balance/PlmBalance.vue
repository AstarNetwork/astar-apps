<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-overflow-hidden tw-shadow tw-rounded-lg
      sm:tw-col-span-2
      tw-text-blue-900
      dark:tw-text-darkGray-100
      tw-p-5
      sm:tw-grid
      tw-grid-cols-2 tw-gap-4
      xl:tw-col-span-3
    "
  >
    <div>
      <div class="tw-flex tw-items-center tw-pt-1">
        <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold tw-text-lg">
          {{ $t('balance.transferable') }}
        </p>
      </div>

      <div class="tw-flex tw-flex-col tw-pt-1 sm:tw-pt-12 tw-pb-3 sm:tw-pb-0 tw-justify-center">
        <div class="tw-flex tw-justify-center">
          <div>
            <p class="tw-font-semibold tw-text-center">
              <span class="tw-text-4xl tw-tracking-tight tw-leading-tight">
                <format-balance :balance="accountData?.getUsableTransactionBalance()" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="tw-text-sm tw-flex tw-flex-col tw-gap-y-5">
      <div
        class="
          tw-flex tw-justify-between tw-items-center tw-bg-blue-50
          dark:tw-bg-darkGray-700
          tw-rounded-lg tw-py-3 tw-px-4
        "
      >
        <div>{{ $t('balance.vested') }}</div>
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
              <format-balance :balance="accountData?.vested" />
            </span>
          </p>
        </div>
      </div>

      <div
        class="
          tw-flex tw-justify-between tw-items-center tw-bg-blue-50
          dark:tw-bg-darkGray-700
          tw-rounded-lg tw-py-3 tw-px-4
        "
      >
        <div>{{ $t('balance.locked') }}</div>
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
              <format-balance :balance="accountData?.miscFrozen" />
            </span>
          </p>
        </div>
      </div>
      <div
        class="
          tw-flex
          tw-justify-center
          tw-items-center
          tw-bg-blue-500
          tw-rounded-lg
          tw-h-14
          tw-cursor-pointer
        "
        @click="openFaucetModal"
      >
        <div class="tw-font-bold tw-text-lg tw-text-white">{{ $t('balance.faucet') }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import FormatBalance from 'components/balance/FormatBalance.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    FormatBalance,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    accountData: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:is-open-modal-faucet'],
  setup(props, { emit }) {
    const openFaucetModal = (): void => {
      emit('update:is-open-modal-faucet', true);
    };

    return {
      openFaucetModal,
    };
  },
});
</script>
<style scoped>
.disabled_btn {
  background: #c6d3e1 !important;
}
.btn {
  text-align: center;
}
.transfer-button {
  @apply tw-flex tw-justify-center tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-0.5 tw-w-48 xl:tw-w-auto;
  min-width: 96px;
}
.transfer-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
</style>
