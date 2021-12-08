<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-overflow-hidden tw-shadow tw-rounded-lg
      sm:tw-col-span-2
      tw-text-blue-900
      dark:tw-text-darkGray-100
      tw-p-5 tw-pb-14
      sm:tw-grid
      tw-grid-cols-2 tw-gap-4
      xl:tw-col-span-3
    "
  >
    <div>
      <div class="tw-flex tw-items-center tw-pt-1">
        <div
          class="
            tw-h-10 tw-w-10 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mr-2
          "
        >
          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
        <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold tw-text-lg">
          {{ defaultUnitToken }} {{ $t('balance.transferable') }}
        </p>
      </div>

      <div class="tw-flex tw-flex-col tw-h-full tw-justify-center">
        <div class="tw-flex tw-justify-center">
          <div>
            <p class="tw-font-semibold tw-text-center">
              <span class="tw-text-3xl tw-tracking-tight tw-leading-tight">
                <format-balance :balance="accountData?.getUsableTransactionBalance()" />
              </span>
            </p>
          </div>
        </div>

        <div
          class="
            tw-mt-8
            xl:tw-mt-1
            tw-text-center tw-mb-6
            sm:tw-mb-0
            tw-flex tw-flex-col
            2xl:tw-flex-row
            tw-justify-center tw-items-center
            xl:tw-gap-x-1
            2xl:tw-gap-x-2
            tw-gap-y-4
            xl:tw-pt-3
          "
        >
          <div class="tw-flex tw-flex-col xl:tw-flex-row tw-gap-y-4 xl:tw-gap-x-4">
            <button
              type="button"
              :disabled="!address"
              class="transfer-button"
              :class="!address ? 'disabled_btn' : ''"
              @click="openTransferModal"
            >
              {{ $t('balance.transfer') }}
            </button>
            <button v-if="!isH160" type="button" class="transfer-button" @click="openFaucetModal">
              {{ $t('balance.faucet') }}
            </button>
          </div>

          <button
            v-if="isEvmDeposit && !isH160"
            type="button"
            class="transfer-button"
            @click="openWithdrawalModal"
          >
            {{ $t('balance.withdrawEvm') }}
          </button>
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
        v-if="!isH160"
        class="
          tw-flex tw-justify-between tw-items-center tw-bg-blue-50
          dark:tw-bg-darkGray-700
          tw-rounded-lg tw-mb-0 tw-py-3 tw-px-4
        "
      >
        <div>{{ $t('balance.evmDeposit') }}</div>
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
              <format-balance :balance="evmDeposit" />
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { useChainMetadata, useEvmDeposit } from 'src/hooks';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import FormatBalance from 'components/balance/FormatBalance.vue';
import { useStore } from 'src/store';

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
      required: true,
    },
  },
  emits: [
    'update:is-open-transfer',
    'update:is-open-withdrawal-evm-deposit',
    'update:is-open-modal-faucet',
  ],
  setup(props, { emit }) {
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const openTransferModal = (): void => {
      emit('update:is-open-transfer', true);
    };

    const openWithdrawalModal = (): void => {
      emit('update:is-open-withdrawal-evm-deposit', true);
    };

    const openFaucetModal = (): void => {
      emit('update:is-open-modal-faucet', true);
    };

    const { defaultUnitToken } = useChainMetadata();
    const { evmDeposit, isEvmDeposit } = useEvmDeposit();

    return {
      openWithdrawalModal,
      openFaucetModal,
      openTransferModal,
      evmDeposit,
      isEvmDeposit,
      defaultUnitToken,
      isH160,
      ...toRefs(props),
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
